import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Repeat, Zap, Bookmark, List, Loader2, Volume2 } from "lucide-react";
import { progressAPI, materialsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function NeuralPlayer({ material }) {
    const { user } = useAuth();
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speedIndex, setSpeedIndex] = useState(2); // 1.0x
    const [bookmarkLabel, setBookmarkLabel] = useState("");
    const [bookmarking, setBookmarking] = useState(false);
    const [transcript, setTranscript] = useState(false);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState("");
    const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
    const [showChapters, setShowChapters] = useState(false);

    const audioSrc = currentChapterIndex === -1
        ? `/api/materials/${material?._id}/stream`
        : `/api/materials/${material?._id}/chapters/${currentChapterIndex}/stream`;

    const activeTitle = currentChapterIndex === -1
        ? material?.title
        : material?.chapters?.[currentChapterIndex]?.title || "Unknown Segment";

    const hasAudio = !!(material?._id && (material?.audioUrl || (material?.chapters && material.chapters.length > 0)));

    const handleChapterChange = (index) => {
        setCurrentChapterIndex(index);
        setPlaying(false);
        setError("");
        setCurrentTime(0);
    };

    const nextChapter = () => {
        if (material?.chapters && currentChapterIndex < material.chapters.length - 1) {
            handleChapterChange(currentChapterIndex + 1);
        }
    };

    const prevChapter = () => {
        if (currentChapterIndex > -1) {
            handleChapterChange(currentChapterIndex - 1);
        }
    };

    // Load saved progress on mount
    useEffect(() => {
        if (!material?._id) return;
        progressAPI.getForMaterial(material._id).then(data => {
            setProgress(data.data);
            if (data.data?.lastPosition && audioRef.current) {
                audioRef.current.currentTime = data.data.lastPosition;
            }
        }).catch(() => { });
    }, [material?._id]);

    // Save progress every 10 seconds
    useEffect(() => {
        if (!material?._id || !playing) return;
        const interval = setInterval(() => {
            const pos = audioRef.current?.currentTime || 0;
            const dur = audioRef.current?.duration || 1;
            const pct = Math.round((pos / dur) * 100);
            progressAPI.update({
                materialId: material._id,
                lastPosition: Math.round(pos),
                percentComplete: pct,
                isCompleted: pct >= 95,
            }).catch(() => { });
        }, 10000);
        return () => clearInterval(interval);
    }, [material?._id, playing]);

    const togglePlay = async () => {
        if (!audioRef.current) return;
        try {
            if (playing) {
                audioRef.current.pause();
            } else {
                await audioRef.current.play();
            }
        } catch (err) {
            console.error("Play error:", err);
            setError("Could not play audio. Please try again.");
            setPlaying(false);
        }
    };

    const handlePlay = () => { setPlaying(true); setError(""); };
    const handlePause = () => { setPlaying(false); };
    const handleError = (e) => {
        setPlaying(false);
        const code = e.target?.error?.code;
        const msgs = {
            1: 'Audio loading aborted.',
            2: 'Network error.',
            3: 'Audio decoding failed.',
            4: 'Format not supported.',
        };
        setError(msgs[code] || 'Failed to load audio. Please regenerate it.');
    };

    const seek = (secs) => {
        if (audioRef.current) { audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) + secs); }
    };

    const cycleSpeed = () => {
        const next = (speedIndex + 1) % SPEEDS.length;
        setSpeedIndex(next);
        if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
    };

    const handleBookmark = async () => {
        if (!material?._id) return;
        setBookmarking(true);
        try {
            await progressAPI.addBookmark(material._id, { position: Math.round(audioRef.current?.currentTime || 0), label: `Bookmark at ${fmtTime(audioRef.current?.currentTime || 0)}` });
        } catch { }
        setBookmarking(false);
    };

    const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!material) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-10 max-w-5xl mx-auto text-center">
                <div className="bg-[#09090b] border border-white/5 rounded-[3rem] p-16 shadow-2xl">
                    <Zap size={48} className="text-indigo-400 opacity-30 mx-auto mb-6" />
                    <p className="text-gray-500 text-lg">Select a subject from the library to start listening</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-4 sm:px-10 max-w-5xl mx-auto">
            <div className="bg-[#09090b] border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[120px]" />

                <div className="relative z-10 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-black mb-8">
                        Now Playing · {material.subject}
                    </span>

                    {/* Cover art */}
                    <div className="w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner">
                        <Zap size={60} className="text-indigo-400 opacity-50" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold mb-1 font-serif text-white text-center">{activeTitle}</h2>
                    {currentChapterIndex === -1 && material.chapter && <p className="text-gray-500 mb-4">{material.chapter}</p>}
                    {currentChapterIndex !== -1 && <p className="text-gray-500 mb-4 text-xs tracking-widest uppercase">Part {currentChapterIndex + 1} of {material.chapters?.length}</p>}
                    <p className="text-gray-600 mb-8 text-sm">Narrated by AccessLearn AI</p>

                    {error && <p className="text-red-400 text-sm mb-4" role="alert">{error}</p>}

                    {/* Hidden audio element */}
                    {hasAudio && (
                        <audio
                            ref={audioRef}
                            src={audioSrc}
                            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onEnded={() => { setPlaying(false); if (material?._id) progressAPI.update({ materialId: material._id, percentComplete: 100, isCompleted: true }).catch(() => { }); }}
                            onError={handleError}
                            preload="metadata"
                            aria-label={`Audio player for ${material.title}`}
                        />
                    )}

                    {/* Waveform */}
                    <div className="w-full flex items-end justify-center gap-1 h-12 mb-8" aria-hidden="true">
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={playing ? { height: [6, 10 + (i % 7) * 5, 6] } : { height: 6 }}
                                transition={{ repeat: Infinity, duration: 0.8 + (i % 5) * 0.2, ease: "easeInOut" }}
                                className="w-1.5 bg-indigo-500/40 rounded-full"
                            />
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full mb-4">
                        <div
                            className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer"
                            onClick={e => {
                                if (!audioRef.current || !duration) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const seek = ((e.clientX - rect.left) / rect.width) * duration;
                                audioRef.current.currentTime = seek;
                            }}
                            role="slider" aria-label="Audio progress" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(currentTime)}
                        >
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{fmtTime(currentTime)}</span>
                            <span>{duration > 0 ? fmtTime(duration) : "—:——"}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6 sm:gap-8 mb-10" role="toolbar" aria-label="Audio controls">
                        <button onClick={() => seek(-30)} className="text-gray-500 hover:text-white transition-colors" aria-label="Rewind 30 seconds"><SkipBack size={28} /></button>
                        <button onClick={togglePlay} disabled={!hasAudio || !!error} className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-40" aria-label={playing ? "Pause" : "Play"}>
                            {playing ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" />}
                        </button>
                        <button onClick={() => seek(30)} className="text-gray-500 hover:text-white transition-colors" aria-label="Skip forward 30 seconds"><SkipForward size={28} /></button>
                    </div>

                    {/* Utility bar */}
                    <div className="grid grid-cols-3 w-full max-w-md p-4 bg-white/5 rounded-2xl border border-white/5">
                        <button onClick={handleBookmark} disabled={bookmarking} className="flex flex-col items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-indigo-400 transition-colors" aria-label="Add bookmark">
                            {bookmarking ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} />} BOOKMARK
                        </button>
                        <button onClick={cycleSpeed} className="flex flex-col items-center gap-1 text-[10px] font-bold text-indigo-400" aria-label={`Playback speed ${SPEEDS[speedIndex]}x`}>
                            <span className="text-xs">{SPEEDS[speedIndex]}x</span> SPEED
                        </button>
                        <button onClick={() => setTranscript(t => !t)} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${transcript ? "text-indigo-400" : "text-gray-400 hover:text-indigo-400"}`} aria-label="Toggle transcript">
                            <List size={16} /> TRANSCRIPT
                        </button>
                        <button onClick={() => setShowChapters(s => !s)} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${showChapters ? "text-indigo-400" : "text-gray-400 hover:text-indigo-400"}`} aria-label="Toggle chapters">
                            <BookOpen size={16} /> CHAPTERS
                        </button>
                    </div>

                    {/* Chapters panel */}
                    {showChapters && material.chapters && material.chapters.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full max-h-48 overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-4 scrollbar-hide">
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleChapterChange(-1)}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${currentChapterIndex === -1 ? "bg-indigo-500/20 text-white border border-indigo-500/30" : "text-gray-400 hover:bg-white/5"}`}
                                >
                                    <span className="text-sm font-medium">Full Material Narration</span>
                                    {currentChapterIndex === -1 && <Zap size={14} className="text-indigo-400" />}
                                </button>
                                {material.chapters.map((ch, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleChapterChange(idx)}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${currentChapterIndex === idx ? "bg-indigo-500/20 text-white border border-indigo-500/30" : "text-gray-400 hover:bg-white/5"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-gray-600 font-bold w-4">{idx + 1}</span>
                                            <span className="text-sm font-medium truncate">{ch.title}</span>
                                        </div>
                                        {currentChapterIndex === idx && <Zap size={14} className="text-indigo-400" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Transcript panel */}
                    {transcript && material.transcript && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full max-h-48 overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-4 text-left text-sm text-gray-400 leading-relaxed" aria-label="Transcript">
                            {material.transcript}
                        </motion.div>
                    )}

                    {!hasAudio && (
                        <p className="mt-6 text-xs text-gray-600 text-center">No audio generated yet for this material. Ask your teacher to generate audio.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}