/**
 * TTS Service – PDF text extraction, chapter detection, and audio generation
 *
 * TTS Strategy (in order):
 *  1. Google Cloud TTS (requires GOOGLE_TTS_API_KEY)
 *  2. Edge TTS – Microsoft voices via WebSocket (free, no key needed)
 *  3. Windows SAPI via PowerShell (offline fallback, Windows only)
 *  4. Silent placeholder (last resort)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execFile, spawn } = require('child_process');
const os = require('os');
const imageDescriptionService = require('./imageDescriptionService');
const { getIO } = require('../socket');

// ─── Ensure audio directory exists ───────────────────────────────────────────
const AUDIO_DIR = path.join(__dirname, '..', 'uploads', 'audio');
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

// ─── Download file from URL ───────────────────────────────────────────────────
function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const chunks = [];
        protocol.get(url, (res) => {
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

// ─── Extract raw text + page map from PDF ────────────────────────────────────
async function extractTextFromPDF(pdfPathOrUrl) {
    const pdfParse = require('pdf-parse');
    if (typeof pdfParse !== 'function') {
        throw new Error('pdf-parse is not a function – check your installation (needs v1.1.1)');
    }
    let pdfBuffer;

    if (pdfPathOrUrl.startsWith('http')) {
        pdfBuffer = await downloadFile(pdfPathOrUrl);
    } else {
        // Handles both absolute paths and /uploads/... relative server paths
        const localPath = pdfPathOrUrl.startsWith('/uploads')
            ? path.join(__dirname, '..', pdfPathOrUrl)
            : path.isAbsolute(pdfPathOrUrl)
                ? pdfPathOrUrl
                : path.join(__dirname, '..', pdfPathOrUrl);
        if (!fs.existsSync(localPath)) {
            throw new Error(`PDF not found at: ${localPath}`);
        }
        pdfBuffer = fs.readFileSync(localPath);
    }

    const data = await pdfParse(pdfBuffer);
    return { fullText: data.text || '', numPages: data.numpages || 0 };
}

// ─── Chapter detection from raw text ─────────────────────────────────────────
function detectChapters(fullText) {
    const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

    // Chapter heading patterns
    const chapterPatterns = [
        /^(chapter\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|[ivxlc]+)[\s:–-]*(.*))/i,
        /^(unit\s+(\d+|[ivxlc]+)[\s:–-]*(.*))/i,
        /^(lesson\s+(\d+|[ivxlc]+)[\s:–-]*(.*))/i,
        /^(part\s+(I{1,3}|IV|V?I{0,3}|[12345])[\s:–-]*(.*))/i,  // Part I/II/III/IV/1/2 only
        /^(section\s+(\d+|[ivxlc]+)[\s:–-]*(.*))/i,
        /^(\d+[\.\s]+[A-Z][A-Z\s,'']{3,50})$/, // ALL-CAPS titles like "1. THE FUN THEY HAD"
    ];

    const rawChapters = [];
    let currentChapterTitle = null;
    let currentLines = [];

    for (const line of lines) {
        let isMatch = false;
        for (const pattern of chapterPatterns) {
            if (pattern.test(line)) {
                if (currentChapterTitle !== null) {
                    rawChapters.push({
                        title: currentChapterTitle,
                        text: currentLines.join(' ').replace(/\s+/g, ' ').trim()
                    });
                }
                currentChapterTitle = line.length > 120 ? line.substring(0, 120) : line;
                currentLines = [];
                isMatch = true;
                break;
            }
        }
        if (!isMatch && currentChapterTitle !== null) {
            currentLines.push(line);
        }
    }
    if (currentChapterTitle !== null) {
        rawChapters.push({
            title: currentChapterTitle,
            text: currentLines.join(' ').replace(/\s+/g, ' ').trim()
        });
    }

    // ── Post-processing: filter & deduplicate ─────────────────────────────────
    // Normalize a title for comparison: remove numbers, punctuation, extra spaces
    const normalize = (t) => t.toLowerCase().replace(/[\d\.\s_–\-:]+/g, '').replace(/\s+/g, '');

    const seen = new Set();
    const chapters = [];

    for (const ch of rawChapters) {
        // Skip chapters with fewer than 200 chars of body text (likely ToC entries or page headers)
        if (ch.text.length < 200) continue;

        const key = normalize(ch.title);
        if (seen.has(key)) continue; // deduplicate same-title chapters
        seen.add(key);

        // Clean up title: collapse multiple spaces
        chapters.push({
            title: ch.title.replace(/\s+/g, ' ').trim(),
            text: ch.text,
        });
    }

    // ── Fallback: if no valid chapters found, split into even chunks ───────────
    if (chapters.length === 0) {
        const words = fullText.split(/\s+/);
        let chunk = [], count = 0, charCount = 0;
        for (const word of words) {
            chunk.push(word);
            charCount += word.length + 1;
            if (charCount >= 3000) {
                chapters.push({ title: `Part ${++count}`, text: chunk.join(' ').trim() });
                chunk = [];
                charCount = 0;
            }
        }
        if (chunk.length > 0) {
            chapters.push({ title: `Part ${++count}`, text: chunk.join(' ').trim() });
        }
    }

    console.log(`📚 Chapter detection: ${rawChapters.length} raw → ${chapters.length} after dedup/filter`);
    return chapters.slice(0, 30); // max 30 chapters
}

// ─── Math symbols → readable speech ──────────────────────────────────────────
function mathToSpeech(text) {
    return text
        .replace(/\^(\d+)/g, ' to the power of $1')
        .replace(/sqrt\(([^)]+)\)/g, 'square root of $1')
        .replace(/([a-zA-Z])\s*=\s*/g, '$1 equals ')
        .replace(/\+/g, ' plus ')
        .replace(/-/g, ' minus ')
        .replace(/\*/g, ' times ')
        .replace(/\//g, ' divided by ')
        .replace(/π/g, 'pi')
        .replace(/∑/g, 'sum of')
        .replace(/∫/g, 'integral of')
        .replace(/∞/g, 'infinity')
        .replace(/≈/g, 'approximately equals')
        .replace(/≠/g, 'not equal to')
        .replace(/≤/g, 'less than or equal to')
        .replace(/≥/g, 'greater than or equal to');
}

function splitTextIntoChunks(text, maxLen = 4500) {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks = [];
    let current = '';

    for (const word of words) {
        if (!current) {
            current = word;
            continue;
        }
        if ((current.length + 1 + word.length) > maxLen) {
            chunks.push(current.trim());
            current = word;
        } else {
            current += ` ${word}`;
        }
    }
    if (current) chunks.push(current.trim());
    return chunks;
}

function skipID3v2Tag(buffer) {
    if (buffer.length < 10 || buffer.toString('utf8', 0, 3) !== 'ID3') return 0;
    const size = ((buffer[6] & 0x7f) << 21)
        | ((buffer[7] & 0x7f) << 14)
        | ((buffer[8] & 0x7f) << 7)
        | (buffer[9] & 0x7f);
    return 10 + size;
}

function concatenateMp3Files(mp3Paths, outPath) {
    const outStream = fs.createWriteStream(outPath);
    try {
        for (let i = 0; i < mp3Paths.length; i++) {
            const buf = fs.readFileSync(mp3Paths[i]);
            const start = (i === 0) ? 0 : skipID3v2Tag(buf);
            outStream.write(buf.slice(start));
        }
    } finally {
        outStream.close();
    }
}

async function generateChunkedAudioWithGoogle(chunks, outputPath, tmpDir) {
    const chunkFiles = [];
    for (let i = 0; i < chunks.length; i++) {
        const chunkPath = path.join(tmpDir, `google_chunk_${i}.mp3`);
        const buf = await googleTTS(chunks[i]);
        fs.writeFileSync(chunkPath, buf);
        chunkFiles.push(chunkPath);
    }
    concatenateMp3Files(chunkFiles, outputPath);
}

async function generateChunkedAudioWithEdge(chunks, outputPath, tmpDir) {
    const chunkFiles = [];
    for (let i = 0; i < chunks.length; i++) {
        const chunkPath = path.join(tmpDir, `edge_chunk_${i}.mp3`);
        await edgeTTS(chunks[i], chunkPath);
        chunkFiles.push(chunkPath);
    }
    concatenateMp3Files(chunkFiles, outputPath);
}

// ─── TTS: Google Cloud ────────────────────────────────────────────────────────
async function googleTTS(text) {
    if (!process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEY === 'your_google_tts_key') {
        throw new Error('Google TTS API key not configured');
    }
    const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
    const client = new TextToSpeechClient({ key: process.env.GOOGLE_TTS_API_KEY });
    const [response] = await client.synthesizeSpeech({
        input: { text },
        voice: { languageCode: 'en-IN', name: 'en-IN-Neural2-D', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
    });
    return response.audioContent;
}

// ─── TTS: msedge-tts (Microsoft Edge voices, proper Node.js package) ───────────────
async function edgeTTS(text, outputPath) {
    const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
    const tts = new MsEdgeTTS();
    await tts.setMetadata('en-IN-NeerjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {});

    // toFile writes the audio to a directory and names it audio.mp3
    const tmpDir = outputPath + '_tmp';
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    try {
        await tts.toFile(tmpDir, text);
        tts.close();

        // Move the generated audio.mp3 to the expected outputPath
        const generatedFile = path.join(tmpDir, 'audio.mp3');
        if (!fs.existsSync(generatedFile) || fs.statSync(generatedFile).size < 500) {
            throw new Error('msedge-tts produced empty or missing file');
        }
        fs.renameSync(generatedFile, outputPath);
    } finally {
        // Clean up temp dir
        try { fs.rmdirSync(tmpDir); } catch (_) { }
    }

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 500) {
        throw new Error('msedge-tts output file is too small or missing');
    }
}

// ─── SAPI helper: synthesize ONE chunk to a WAV file ──────────────────────────
function sapiChunk(text, wavPath) {
    const tempTxt = path.join(os.tmpdir(), `sapi_in_${Date.now()}_${Math.random().toString(36).slice(2)}.txt`);
    const tempPs1 = path.join(os.tmpdir(), `sapi_${Date.now()}_${Math.random().toString(36).slice(2)}.ps1`);
    fs.writeFileSync(tempTxt, text.replace(/[`$]/g, ' '), 'utf16le');

    const psScript = [
        'Add-Type -AssemblyName System.Speech',
        '$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer',
        '$speak.Rate = 1',
        '$speak.Volume = 100',
        `$speak.SetOutputToWaveFile('${wavPath.replace(/'/g, "''")}')`,
        `$text = Get-Content -Path '${tempTxt.replace(/'/g, "''")}' -Encoding Unicode -Raw`,
        '$speak.Speak($text)',
        '$speak.SetOutputToDefaultAudioDevice()',
        '$speak.Dispose()',
    ].join('\r\n');
    fs.writeFileSync(tempPs1, psScript, 'utf8');

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            ps.kill();
            cleanup();
            reject(new Error('SAPI chunk timeout'));
        }, 480000); // 8 minutes per chunk

        const cleanup = () => {
            try { if (fs.existsSync(tempTxt)) fs.unlinkSync(tempTxt); } catch (_) { }
            try { if (fs.existsSync(tempPs1)) fs.unlinkSync(tempPs1); } catch (_) { }
        };

        let stderr = '';
        const ps = spawn('powershell', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', tempPs1]);
        ps.stderr && ps.stderr.on('data', d => { stderr += d.toString(); });
        ps.on('close', code => {
            clearTimeout(timeout);
            cleanup();
            if (code !== 0) return reject(new Error(`SAPI chunk failed (code ${code}): ${stderr.trim().slice(0, 200)}`));
            if (!fs.existsSync(wavPath) || fs.statSync(wavPath).size < 500) return reject(new Error('SAPI chunk produced empty WAV'));
            resolve();
        });
        ps.on('error', err => { clearTimeout(timeout); cleanup(); reject(err); });
    });
}

// ─── Concatenate multiple WAV PCM files into one ──────────────────────────────
function concatWavFiles(wavPaths, outPath) {
    const buffers = [];
    let fmt = null;

    for (const wp of wavPaths) {
        if (!fs.existsSync(wp)) continue;
        const buf = fs.readFileSync(wp);
        if (buf.length < 44) continue;
        // Read fmt chunk (bytes 12..36) from first file
        if (!fmt) fmt = buf.slice(12, 36);
        // data chunk starts at byte 44
        const dataSize = buf.readUInt32LE(40);
        if (dataSize > 0 && buf.length >= 44 + dataSize) {
            buffers.push(buf.slice(44, 44 + dataSize));
        }
    }

    if (buffers.length === 0 || !fmt) throw new Error('No valid WAV chunks to concatenate');

    const totalData = buffers.reduce((s, b) => s + b.length, 0);
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + totalData, 4);
    header.write('WAVE', 8);
    fmt.copy(header, 12); // copy fmt chunk
    header.write('data', 36);
    header.writeUInt32LE(totalData, 40);
    fs.writeFileSync(outPath, Buffer.concat([header, ...buffers]));
}

// ─── TTS: Windows SAPI (offline, via PowerShell) ─────────────────────────────
function windowsSAPITTS(text, outputPath) {
    if (os.platform() !== 'win32') return Promise.reject(new Error('Not Windows'));

    // Split text into chunks ≤2500 chars (≈500 words ≈ 3 min synthesis)
    // This ensures each SAPI call finishes well within the 8-min per-chunk timeout
    const CHUNK_SIZE = 2500;
    const chunks = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
        const chunk = text.slice(i, i + CHUNK_SIZE).trim();
        if (chunk.length > 10) chunks.push(chunk);
    }
    if (chunks.length === 0) return Promise.reject(new Error('Empty text'));

    const wavPaths = chunks.map((_, i) =>
        path.join(os.tmpdir(), `sapi_wav_${Date.now()}_${i}.wav`)
    );

    const cleanWavs = () => {
        wavPaths.forEach(wp => { try { if (fs.existsSync(wp)) fs.unlinkSync(wp); } catch (_) { } });
    };

    // Process chunks SEQUENTIALLY to avoid overwhelming SAPI
    const synthesizeAll = async () => {
        for (let i = 0; i < chunks.length; i++) {
            console.log(`   🔈 SAPI chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
            await sapiChunk(chunks[i], wavPaths[i]);
        }
    };

    return synthesizeAll().then(() => {
        // Concatenate all WAVs
        const tempCombined = path.join(os.tmpdir(), `sapi_combined_${Date.now()}.wav`);
        try {
            concatWavFiles(wavPaths, tempCombined);
        } finally {
            cleanWavs();
        }

        // Try ffmpeg WAV→MP3, else serve WAV directly
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', ['-y', '-i', tempCombined, '-codec:a', 'libmp3lame', '-q:a', '4', outputPath]);
            const cleanCombined = () => { try { if (fs.existsSync(tempCombined)) fs.unlinkSync(tempCombined); } catch (_) { } };
            ffmpeg.on('close', fc => {
                cleanCombined();
                if (fc === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 500) {
                    resolve();
                } else {
                    try { fs.copyFileSync(tempCombined, outputPath); resolve(); }
                    catch (e) { reject(new Error('SAPI: failed to save audio')); }
                }
            });
            ffmpeg.on('error', () => {
                cleanCombined();
                try { fs.copyFileSync(tempCombined, outputPath); resolve(); }
                catch (e) { reject(new Error('SAPI: ffmpeg unavailable')); }
            });
        });
    }).catch(err => {
        cleanWavs();
        throw err;
    });
}

// ─── TTS: Fallback – write silent placeholder ─────────────────────────────────
function silentFallback(outputPath) {
    // Minimal valid WAV file (44-byte header + 1 second of silence at 22050 Hz)
    const sampleRate = 22050;
    const numSamples = sampleRate * 2; // 2 seconds silence
    const dataSize = numSamples * 2;   // 16-bit
    const buf = Buffer.alloc(44 + dataSize, 0);
    // RIFF header
    buf.write('RIFF', 0);
    buf.writeUInt32LE(36 + dataSize, 4);
    buf.write('WAVE', 8);
    buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16);          // PCM chunk size
    buf.writeUInt16LE(1, 20);           // PCM format
    buf.writeUInt16LE(1, 22);           // 1 channel
    buf.writeUInt32LE(sampleRate, 24);
    buf.writeUInt32LE(sampleRate * 2, 28); // byte rate
    buf.writeUInt16LE(2, 32);           // block align
    buf.writeUInt16LE(16, 34);          // bits per sample
    buf.write('data', 36);
    buf.writeUInt32LE(dataSize, 40);
    // silence bytes already zero-filled
    fs.writeFileSync(outputPath, buf);
}

// ─── Core: generate audio for a given text ────────────────────────────────────
async function generateAudioForText(text, outputPath) {
    // Clean text for TTS — remove control chars but preserve printable ASCII & common punctuation
    const cleanText = mathToSpeech(text)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const chunks = splitTextIntoChunks(cleanText, 4500);
    const tmpDir = path.join(os.tmpdir(), `tts_chunks_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const cleanupTmp = () => {
        try {
            if (fs.existsSync(tmpDir)) {
                fs.readdirSync(tmpDir).forEach(file => fs.unlinkSync(path.join(tmpDir, file)));
                fs.rmdirSync(tmpDir);
            }
        } catch (_) {}
    };

    try {
        if (chunks.length === 1) {
            try {
                const buf = await googleTTS(cleanText);
                fs.writeFileSync(outputPath, buf);
                console.log('✅ Google TTS used');
                return 'google';
            } catch (e) {
                console.log('ℹ️  Google TTS skipped:', e.message);
            }

            try {
                await edgeTTS(cleanText, outputPath);
                console.log('✅ Edge TTS used');
                return 'edge';
            } catch (e) {
                console.warn('⚠️  Edge TTS failed:', String(e));
            }

            try {
                await windowsSAPITTS(cleanText, outputPath);
                if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
                    console.log('✅ Windows SAPI TTS used');
                    return 'sapi';
                }
                throw new Error('SAPI output too small');
            } catch (e) {
                console.warn('⚠️  Windows SAPI TTS failed:', e.message);
            }
        }

        // Long text: chunk and merge into a single file
        try {
            await generateChunkedAudioWithGoogle(chunks, outputPath, tmpDir);
            console.log('✅ Google TTS chunked audio used');
            return 'google';
        } catch (e) {
            console.log('ℹ️  Chunked Google TTS skipped:', e.message);
        }

        try {
            await generateChunkedAudioWithEdge(chunks, outputPath, tmpDir);
            console.log('✅ Edge TTS chunked audio used');
            return 'edge';
        } catch (e) {
            console.warn('⚠️  Chunked Edge TTS failed:', String(e));
        }

        await windowsSAPITTS(cleanText, outputPath);
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
            console.log('✅ Windows SAPI TTS used');
            return 'sapi';
        }
        throw new Error('SAPI output too small');
    } finally {
        cleanupTmp();
    }
}

// ─── Extract chapters only (no audio) – called at upload time ────────────────
async function extractChaptersOnly(material) {
    if (!material.pdfUrl) return [];
    try {
        const { fullText } = await extractTextFromPDF(material.pdfUrl);
        const rawChapters = detectChapters(fullText);
        return rawChapters.map((ch, i) => ({
            title: ch.title,
            text: ch.text,
            startPage: i + 1,
            audioUrl: '',
            transcript: ch.text.substring(0, 2000),
        }));
    } catch (err) {
        console.warn('Chapter extraction failed:', err.message);
        return [];
    }
}

// ─── Generate audio for entire material + all chapters + image descriptions ──
async function generateFromMaterial(material, userId) {
    const io = getIO();
    let fullText = '';
    let chapters = [];
    let imageDescriptions = [];
    let numPages = 0;

    // 1. Extract text from PDF (primary source)
    if (material.pdfUrl) {
        try {
            console.log(`📄 Extracting PDF text from: ${material.pdfUrl}`);
            const extracted = await extractTextFromPDF(material.pdfUrl);
            fullText = (extracted.fullText || '').trim();
            numPages = extracted.numPages || 0;
            console.log(`✅ Extracted ${fullText.length} chars from PDF (${numPages} pages)`);
            io.to(`user-${userId}`).emit('audio-progress', { progress: 20, message: 'Text extracted from PDF' });
        } catch (err) {
            console.warn('⚠️  PDF extraction failed:', err.message);
        }
    }

    // 2. Extract images and descriptions from PDF
    if (material.pdfUrl) {
        try {
            console.log(`🖼️  Extracting images from PDF...`);
            imageDescriptions = await imageDescriptionService.extractImagesWithDescriptions(material.pdfUrl);
            console.log(`✅ Found and described ${imageDescriptions.length} images`);
            io.to(`user-${userId}`).emit('audio-progress', { progress: 40, message: 'Images processed' });
        } catch (err) {
            console.warn('⚠️  Image extraction/description failed:', err.message);
        }
    }

    // 3. Append teacher notes if available
    if (material.teacherNotes) {
        fullText = fullText
            ? `${material.teacherNotes}\n\n${fullText}`
            : material.teacherNotes;
    }

    // 4. Interleave image descriptions into the text at the correct page positions
    let audioText = '';
    if (numPages > 1) {
        // Try to split by page using \f (form feed) or fallback to even split
        let pageTexts = fullText.split('\f');
        if (pageTexts.length !== numPages) {
            // fallback: split by lines and divide evenly
            const lines = fullText.split('\n');
            const linesPerPage = Math.ceil(lines.length / numPages);
            pageTexts = [];
            for (let i = 0; i < numPages; i++) {
                pageTexts.push(lines.slice(i * linesPerPage, (i + 1) * linesPerPage).join(' '));
            }
        }
        for (let i = 0; i < numPages; i++) {
            audioText += pageTexts[i] ? pageTexts[i].trim() : '';
            // Insert image descriptions for this page
            const imgs = imageDescriptions.filter(img => img.pageNum === (i + 1));
            if (imgs.length > 0) {
                audioText += '\n';
                imgs.forEach(img => {
                    audioText += `Image on page ${img.pageNum}: ${img.description}\n`;
                });
            }
            audioText += '\n';
        }
    } else {
        // Single page or fallback
        audioText = fullText;
        if (imageDescriptions.length > 0) {
            audioText += '\n';
            imageDescriptions.forEach(img => {
                audioText += `Image on page ${img.pageNum}: ${img.description}\n`;
            });
        }
    }

    audioText = audioText.trim();
    if (!audioText || audioText.length < 20) {
        audioText = 'No readable content was found in this material. Please ensure the PDF contains selectable text and not just scanned images.';
    }

    console.log(`🧠 Audio content prepared: ${audioText.length} chars, images=${imageDescriptions.length}`);
    io.to(`user-${userId}`).emit('audio-progress', { progress: 50, message: 'Content prepared for audio generation' });

    // 5. Auto-detect chapters from extracted text (always re-detect, ignore stale DB chapters)
    if (audioText.length > 200) {
        const detected = detectChapters(audioText);
        if (detected && detected.length > 0) {
            chapters = detected.map((ch, i) => ({
                title: ch.title,
                text: ch.text,
                startPage: i + 1,
                audioUrl: '',
                transcript: ch.text.substring(0, 2000),
            }));
            console.log(`🔍 Detected ${chapters.length} chapters/segments`);
        }
    }

    // 6. Generate full-material audio (from full extracted text + image descriptions)
    const mainFilename = `material_${material._id}_${Date.now()}.mp3`;
    const mainOutputPath = path.join(AUDIO_DIR, mainFilename);
    await generateAudioForText(audioText, mainOutputPath);
    console.log(`🔊 Main audio generated: ${mainFilename}`);
    io.to(`user-${userId}`).emit('audio-progress', { progress: 80, message: 'Main audio generated' });

    // 7. Do not create separate chapter audio files. The main audio file is the single canonical output.
    const updatedChapters = chapters.map((ch, i) => ({
        title: ch.title,
        startPage: ch.startPage || i + 1,
        audioUrl: '',
        transcript: ch.text.substring(0, 5000),
    }));

    const response = {
        audioUrl: `/uploads/audio/${mainFilename}`,
        transcript: audioText.substring(0, 10000),
        chapters: updatedChapters,
        imageDescriptions: imageDescriptions,
    };

    io.to(`user-${userId}`).emit('audio-complete', { materialId: material._id, audioUrl: response.audioUrl });
    return response;
}

// ─── Generate audio from plain text ───────────────────────────────────────────
async function generateFromText(text) {
    const filename = `tts_${Date.now()}.mp3`;
    const outputPath = path.join(AUDIO_DIR, filename);
    await generateAudioForText(text, outputPath);
    return `/uploads/audio/${filename}`;
}

module.exports = {
    generateFromMaterial,
    generateFromText,
    extractChaptersOnly,
    mathToSpeech,
    extractTextFromPDF,
};
