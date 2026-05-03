/**
 * Image Description Service
 * Generates descriptions of PDF visual content using Google Gemini AI (free tier)
 * 
 * Approach:
 * - Uses Gemini to analyze text context and generate relevant visual descriptions
 * - Integrates seamlessly with existing PDF processing
 * - Gracefully degrades if API is unavailable
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Initialize Gemini Client ────────────────────────────────────────────────
const genAI = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * Generate image descriptions from extracted PDF text
 * @param {string} fullText - Full extracted text from PDF
 * @param {number} maxDescriptions - Maximum descriptions to generate
 * @returns {Promise<Array>} Array of image descriptions
 */
async function generateImageDescriptionsFromText(fullText, maxDescriptions = 8) {
    if (!genAI) {
        console.warn('⚠️ Gemini API key not configured. Image descriptions disabled.');
        return [];
    }

    if (!fullText || fullText.length < 100) {
        console.log('ℹ️ Text too short for image analysis');
        return [];
    }

    try {
        console.log('🖼️ Analyzing content for visual elements...');
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

        // Use a larger sample for better image inference when possible
        const textSample = fullText.substring(0, 12000);

        const prompt = `You are an educational content expert. Analyze this text and identify visual elements (diagrams, charts, graphs, photos, illustrations, tables, screenshots, and diagrams) that are likely referenced by the content.

Do not repeat or paraphrase the exact text from the document. If the text already describes an image, only create a clean image description that adds visual detail for a listener.

If the text does not clearly imply any image or visual content, respond with an empty JSON array.

For each visual element, provide a brief, distinct spoken description (1-2 sentences) suitable for audio narration.

Respond ONLY with valid JSON array:
[
  {"pageNum": 1, "imageIndex": 0, "description": "Clear description of visual"}
]

Generate up to ${Math.min(maxDescriptions, 10)} descriptions.

TEXT TO ANALYZE:
${textSample}`;

        const response = await model.generateContent(prompt);
        const responseText = response.response.text();

        // Extract JSON from response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.warn('No valid JSON in response');
            return [];
        }

        const descriptions = JSON.parse(jsonMatch[0]);
        const valid = [];
        if (Array.isArray(descriptions)) {
            const seen = new Set();
            for (const d of descriptions) {
                if (!d || !d.description || typeof d.description !== 'string') continue;
                const descText = d.description.trim().replace(/\s+/g, ' ');
                if (descText.length < 20) continue;
                const normalized = descText.toLowerCase();
                if (seen.has(normalized)) continue;
                seen.add(normalized);
                valid.push({
                    pageNum: Number.isFinite(d.pageNum) ? d.pageNum : 1,
                    imageIndex: Number.isFinite(d.imageIndex) ? d.imageIndex : valid.length,
                    description: descText.charAt(0).toUpperCase() + descText.slice(1),
                });
            }
        }

        console.log(`✅ Generated ${valid.length} image descriptions`);
        return valid;

    } catch (error) {
        console.warn(`⚠️ Image description generation failed: ${error.message}`);
        return [];
    }
}

/**
 * Main entry point: Extract images with descriptions from PDF
 * @param {string} pdfPathOrUrl - Path or URL to PDF
 * @returns {Promise<Array>} Array of image descriptions
 */
async function extractImagesWithDescriptions(pdfPathOrUrl) {
    try {
        console.log('🖼️ Processing visual content...');

        // Get PDF content
        let pdfBuffer;
        const fs = require('fs');
        const path = require('path');

        if (pdfPathOrUrl.startsWith('http')) {
            pdfBuffer = await downloadFile(pdfPathOrUrl);
        } else {
            const localPath = pdfPathOrUrl.startsWith('/uploads')
                ? path.join(__dirname, '..', pdfPathOrUrl)
                : path.isAbsolute(pdfPathOrUrl)
                    ? pdfPathOrUrl
                    : path.join(__dirname, '..', pdfPathOrUrl);

            if (!fs.existsSync(localPath)) {
                throw new Error(`PDF not found: ${localPath}`);
            }
            pdfBuffer = fs.readFileSync(localPath);
        }

        // Extract text from PDF
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(pdfBuffer);

        console.log(`📖 Analyzed ${pdfData.numpages} pages`);

        // Generate descriptions from text
        const descriptions = await generateImageDescriptionsFromText(pdfData.text, 8);

        return descriptions;
    } catch (error) {
        console.warn(`⚠️ Visual content processing failed gracefully: ${error.message}`);
        return [];
    }
}

/**
 * Format descriptions for audio narration
 */
function formatDescriptionsForAudio(descriptions) {
    if (!descriptions || descriptions.length === 0) return '';
    return descriptions
        .map(desc => `Image on page ${desc.pageNum}: ${desc.description}`)
        .join('\n\n');
}

/**
 * Download file from URL
 */
function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? require('https') : require('http');
        const chunks = [];
        protocol.get(url, (res) => {
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

module.exports = {
    extractImagesWithDescriptions,
    generateImageDescriptionsFromText,
    formatDescriptionsForAudio,
};
