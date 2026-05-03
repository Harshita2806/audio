import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu, X, LogOut, Play, Pause, SkipBack, SkipForward, Volume2, Zap, BookOpen,
    Headphones, BarChart, Grid, List, ChevronRight, Activity, HelpCircle, Mic,
    Brain, CheckCircle, XCircle, Clock, Trophy, AlertCircle, Bell
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { materialsAPI, progressAPI, quizzesAPI } from "../services/api";

/**
 * StudentPage Component - ACCESSIBILITY-FIRST DESIGN
 * Black / Teal / White color scheme.
 * Optimized for blind children using keyboard navigation, voice feedback,
 * and high-contrast, large-target UI.
 */
export default function StudentPage() {
    const { user, logout } = useAuth();
    const { announcements, audioProgress, audioComplete } = useSocket();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("library");
    const [loading, setLoading] = useState(false);
    const [gridView, setGridView] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [announcement, setAnnouncement] = useState("");

    // --- Announcement helpers ---
    // `announce` — updates the ARIA live region ONLY (silent, for screen readers)
    const announce = useCallback((text) => {
        setAnnouncement(text);
    }, []);

    // `speak` — triggers audible speechSynthesis for DELIBERATE user actions only.
    // Has a 1-second cooldown so rapid events cannot spam the voice.
    const lastSpokenAt = useRef(0);
    const speak = useCallback((text, force = false) => {
        setAnnouncement(text);
        if (!("speechSynthesis" in window)) return;
        const now = Date.now();
        if (!force && now - lastSpokenAt.current < 1000) return;
        lastSpokenAt.current = now;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.1;
        window.speechSynthesis.speak(u);
    }, []);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const response = await materialsAPI.getAll({});
            const published = (response.data || []).filter(m => m.isPublished || m.status === "published");
            setMaterials(published);
        } catch (err) {
            console.error("Failed to fetch materials:", err);
            // Silent ARIA update only — no voice spam on background errors
            announce("Failed to load materials. Please check connection.");
        } finally {
            setLoading(false);
        }
    }, [announce]);

    useEffect(() => {
        fetchMaterials();
        // Silently update ARIA only on mount — do NOT auto-speak on page load
        announce("Access Learn loaded. Press H for keyboard shortcuts.");
    }, [fetchMaterials, announce]);

    useEffect(() => {
        if (announcements.length > 0) {
            const latest = announcements[0];
            announce(`New announcement: ${latest.title}`);
        }
    }, [announcements, announce]);

    useEffect(() => {
        if (audioProgress) {
            announce(`Audio generation ${audioProgress.progress} percent complete. ${audioProgress.message}`);
        }
    }, [audioProgress, announce]);

    useEffect(() => {
        if (audioComplete) {
            announce(`Audio generation complete. You can now play the new material.`);
        }
    }, [audioComplete, announce]);

    // Keyboard Shortcuts — use `speak` (voice) because key presses are deliberate
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === "h") {
                speak("Shortcuts: L for Library, R for Progress. Numbers 1 to 9 open books. Escape to go back.");
            }
            if (e.key.toLowerCase() === "l" && activeSection !== "player") {
                setActiveSection("library");
                speak("Library.");
            }
            if (e.key.toLowerCase() === "r") {
                setActiveSection("progress");
                speak("My Progress.");
            }
            if (e.key === "Escape") {
                setSidebarOpen(false);
                if (activeSection === "player") {
                    setActiveSection("library");
                    speak("Back to library.");
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeSection, speak]);

    const handleLogout = () => {
        logout();
        navigate("/auth", { replace: true });
    };

    const handleSelectMaterial = (material) => {
        setSelectedMaterial(material);
        setActiveSection("player");
        // Only speak the title on deliberate book selection
        speak(`${material.title}. Press Space to play.`);
    };

    return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans selection:bg-teal-400 selection:text-black">
            {/* ARIA Live Region for voice feedback */}
            <div role="status" aria-live="polite" className="sr-only">{announcement}</div>

            {/* Skip link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-teal-400 focus:text-black focus:font-bold focus:rounded-xl"
            >
                Skip to main content
            </a>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f] border-b-2 border-teal-900/40 px-4 md:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        aria-expanded={sidebarOpen}
                        aria-label="Open Navigation Menu"
                        className="p-3 hover:bg-teal-500/10 rounded-xl transition-all text-teal-400 md:hidden"
                    >
                        <Menu size={28} />
                    </button>
                    <h1 className="text-2xl font-black tracking-tighter text-white">
                        ACCESS<span className="text-teal-400">LEARN</span>
                    </h1>
                </div>

                <nav className="hidden md:flex items-center gap-4" aria-label="Primary Navigation">
                    {[
                        { id: "library", label: "Library", icon: <BookOpen size={20} /> },
                        { id: "quizzes", label: "Quizzes", icon: <Brain size={20} /> },
                        { id: "progress", label: "My Progress", icon: <BarChart size={20} /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            aria-pressed={activeSection === item.id}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border-2 ${activeSection === item.id
                                ? "bg-teal-400 text-black border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                                : "text-gray-400 border-transparent hover:text-white hover:border-white/10"
                                }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-teal-600 font-bold uppercase tracking-widest">Student</p>
                        <p className="text-sm font-bold text-white">{user?.name || "Learner"}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        aria-label="Logout"
                        className="w-12 h-12 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </header>

            {(audioProgress || audioComplete) && (
                <div className="mx-auto mt-6 max-w-7xl rounded-3xl border border-teal-500/20 bg-[#061519] p-4 px-6 text-sm text-gray-200 shadow-lg">
                    {audioProgress && (
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold text-white">Audio generation in progress</p>
                                <p className="text-gray-400">{audioProgress.message} — {audioProgress.progress}%</p>
                            </div>
                            <div className="text-xs uppercase tracking-[0.25em] text-teal-300">Live</div>
                        </div>
                    )}
                    {audioComplete && (
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold text-white">Audio generation complete</p>
                                <p className="text-gray-400">New audio is ready for material ID {audioComplete.materialId}.</p>
                            </div>
                            <a href={audioComplete.audioUrl} target="_blank" rel="noreferrer" className="text-teal-300 hover:text-white">Open audio</a>
                        </div>
                    )}
                </div>
            )}

            {/* ── Announcements Display ────────────────────────────────────── */}
            {announcements.length > 0 && (
                <div className="mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-teal-500/20 rounded-lg">
                                <Bell size={20} className="text-teal-400" />
                            </div>
                            <h3 className="text-lg font-black text-white">Latest Announcement</h3>
                        </div>
                        <div className="space-y-3">
                            {announcements.slice(0, 3).map((announcement) => (
                                <motion.div
                                    key={announcement._id}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-white/[0.02] border border-teal-900/20 rounded-xl"
                                >
                                    <h4 className="font-bold text-white mb-1">{announcement.title}</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">{announcement.content}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(announcement.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric",
                                            hour: "2-digit", minute: "2-digit"
                                        })}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────── */}
            <main id="main-content" className="flex-1 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {activeSection === "library" && (
                        <LibrarySection
                            key="library"
                            materials={materials}
                            loading={loading}
                            onSelect={handleSelectMaterial}
                            gridView={gridView}
                            setGridView={setGridView}
                            speak={speak}
                        />
                    )}
                    {activeSection === "player" && selectedMaterial && (
                        <PlayerSection
                            key="player"
                            material={selectedMaterial}
                            onBack={() => setActiveSection("library")}
                            onGoToQuizzes={() => setActiveSection("quizzes")}
                            speak={speak}
                        />
                    )}
                    {activeSection === "quizzes" && (
                        <QuizSection key="quizzes" speak={speak} />
                    )}
                    {activeSection === "progress" && (
                        <ProgressSection key="progress" announce={announce} />
                    )}
                </AnimatePresence>
            </main>

            {/* ── Mobile Sidebar ──────────────────────────────────────────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
                        />
                        <motion.nav
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-80 bg-[#0a0a0f] border-r-2 border-teal-900/40 z-[70] p-6 flex flex-col"
                            aria-label="Mobile Navigation"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-xl font-black text-white">MENU</h2>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    aria-label="Close Menu"
                                    className="p-3 bg-white/5 rounded-xl text-teal-400 hover:bg-teal-500/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: "library", label: "LEARNING LIBRARY", icon: <BookOpen size={24} /> },
                                    { id: "quizzes", label: "QUIZZES", icon: <Brain size={24} /> },
                                    { id: "progress", label: "MY PROGRESS", icon: <BarChart size={24} /> },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                                        className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-left transition-all border-2 ${activeSection === item.id
                                            ? "bg-teal-400 text-black border-teal-400"
                                            : "bg-white/5 text-gray-300 border-white/5 hover:border-teal-800"
                                            }`}
                                    >
                                        {item.icon} {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-left text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all border-2 border-transparent hover:border-red-900/30"
                                >
                                    <LogOut size={24} /> SIGN OUT
                                </button>
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            {/* ── Help FAB ────────────────────────────────────────────────── */}
            <div className="fixed bottom-6 right-6 z-40 hidden md:block">
                <button
                    onClick={() => speak("Shortcuts: L for Library, R for Progress, Space for play or pause, Escape to go back.")}
                    className="w-14 h-14 rounded-full bg-teal-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:scale-110 transition-all font-bold"
                    aria-label="Keyboard Shortcuts Help"
                >
                    <HelpCircle size={28} />
                </button>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Library Section
// ────────────────────────────────────────────────────────────────────────────
function LibrarySection({ materials, loading, onSelect, gridView, setGridView, speak }) {
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key >= "1" && e.key <= "9") {
                const idx = parseInt(e.key) - 1;
                if (materials[idx]) onSelect(materials[idx]);
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [materials, onSelect]);

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black tracking-tight mb-2 text-white">My Library</h2>
                    <p className="text-xl text-gray-400 font-medium">Select a textbook to begin listening.</p>
                </div>

                <div className="flex items-center gap-3">
                    {[
                        { view: false, icon: <List size={24} />, label: "List View" },
                        { view: true, icon: <Grid size={24} />, label: "Grid View" },
                    ].map(({ view, icon, label }) => (
                        <button
                            key={String(view)}
                            onClick={() => setGridView(view)}
                            aria-pressed={gridView === view}
                            aria-label={label}
                            className={`p-4 rounded-xl border-2 transition-all ${gridView === view
                                ? "bg-teal-400 border-teal-400 text-black"
                                : "bg-white/5 border-white/10 text-gray-500 hover:border-teal-700"
                                }`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Headphones size={64} className="text-teal-400 animate-pulse" />
                    <p className="text-xl font-bold animate-pulse text-gray-400 italic">Preparing your textbooks...</p>
                </div>
            ) : materials.length === 0 ? (
                <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-3xl p-24 text-center">
                    <BookOpen size={64} className="mx-auto mb-6 text-gray-700" />
                    <h3 className="text-2xl font-black mb-2 text-white">Your library is currently empty.</h3>
                    <p className="text-gray-500 text-lg">Books added by your teacher will appear here.</p>
                </div>
            ) : (
                <div className={gridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {materials.map((m, i) => (
                        <MaterialItem
                            key={m._id}
                            material={m}
                            idx={i}
                            view={gridView ? "grid" : "list"}
                            onClick={() => onSelect(m)}
                        />
                    ))}
                </div>
            )}
        </motion.section>
    );
}

function MaterialItem({ material, idx, view, onClick }) {
    const isGrid = view === "grid";
    return (
        <motion.button
            whileFocus={{ scale: 1.02 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            aria-label={`${material.title}. ${material.subject}. Press Enter to open.`}
            className={`group text-left p-6 rounded-3xl border-2 border-white/10 transition-all outline-none focus:ring-4 focus:ring-teal-400/50 hover:border-teal-500/50 bg-[#0a0a0f] ${isGrid ? "flex flex-col gap-6" : "flex items-center gap-6"
                }`}
        >
            <div className={`shrink-0 rounded-2xl flex items-center justify-center transition-all bg-gradient-to-br from-teal-900/30 to-black group-hover:from-teal-500/20 group-hover:to-teal-900/10 text-teal-600 group-hover:text-teal-300 ${isGrid ? "w-full aspect-[4/3]" : "w-16 h-16"
                }`}>
                <Headphones size={isGrid ? 48 : 28} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-white/10 py-0.5 px-2 rounded-md tracking-widest text-gray-400 uppercase">
                        Book {idx + 1}
                    </span>
                    {material.audioUrl && <Volume2 size={14} className="text-teal-400" />}
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-teal-300 transition-all truncate">
                    {material.title}
                </h3>
                <p className="text-gray-500 font-bold text-sm tracking-wide">
                    {material.subject} • {material.gradeLevel}
                </p>
                {isGrid && material.description && (
                    <p className="mt-4 text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                        {material.description}
                    </p>
                )}
            </div>

            <div className={`shrink-0 ${isGrid ? "mt-2" : ""}`}>
                <div className={`flex items-center justify-center transition-all ${isGrid
                    ? "w-full py-3 rounded-xl bg-white/5 group-hover:bg-teal-400 group-hover:text-black text-teal-400 font-black text-sm uppercase"
                    : "w-12 h-12 rounded-full bg-white/5 border border-white/10 text-teal-400 group-hover:translate-x-1"
                    }`}>
                    {isGrid ? "Listen Now" : <ChevronRight size={24} />}
                </div>
            </div>
        </motion.button>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Player Section
// ────────────────────────────────────────────────────────────────────────────
function PlayerSection({ material, onBack, onGoToQuizzes, speak }) {
    const navigate = useNavigate();
    const chapters = material.chapters || [];
    const [currentChapterIndex, setCurrentChapterIndex] = useState(chapters.length > 0 ? 0 : -1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rate, setRate] = useState(1.0);
    const [progress, setProgress] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [totalWords, setTotalWords] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);
    const wordIndexRef = useRef(0); // ref mirrors wordIndex to avoid stale closures

    const getCurrentText = (chIdx) => {
        if (chIdx === -1) return material.transcript || material.description || material.title || '';
        const ch = chapters[chIdx];
        return ch ? (ch.transcript || ch.text || ch.title || '') : '';
    };

    useEffect(() => {
        quizzesAPI.getByMaterial(material._id)
            .then(res => { const list = res.data || []; if (list.length > 0) setQuiz(list[0]); })
            .catch(() => { });
    }, [material._id]);

    useEffect(() => {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
        const text = getCurrentText(currentChapterIndex);
        const words = text.split(/\s+/).filter(Boolean);
        setTotalWords(words.length);
        setWordIndex(0);
        setProgress(0);
    }, [currentChapterIndex]);

    useEffect(() => () => window.speechSynthesis?.cancel(), []);

    const startSpeechFrom = (fromWordIdx) => {
        if (!('speechSynthesis' in window)) { alert('Text-to-speech not supported in this browser. Use Chrome or Edge.'); return; }
        window.speechSynthesis.cancel();
        const text = getCurrentText(currentChapterIndex);
        if (!text || text.trim().length < 5) { alert('No readable text found. The PDF may be an image scan — ask your teacher to upload a text-searchable PDF.'); return; }
        const words = text.split(/\s+/).filter(Boolean);
        const utt = new SpeechSynthesisUtterance(words.slice(fromWordIdx).join(' '));
        utt.rate = rate; utt.pitch = 1; utt.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft')))
            || voices.find(v => v.lang.startsWith('en')) || null;
        if (voice) utt.voice = voice;
        utt.onboundary = (e) => {
            if (e.name === 'word') {
                const w = fromWordIdx + Math.round(e.charIndex / Math.max(1, text.length / words.length));
                setWordIndex(Math.min(w, words.length));
                setProgress(Math.min(100, Math.round((w / words.length) * 100)));
                wordIndexRef.current = Math.min(w, words.length);
            }
        };
        utt.onend = () => {
            setIsPlaying(false);
            setProgress(100);
            setWordIndex(words.length);
            wordIndexRef.current = words.length;
            setShowQuizPrompt(true);
            // Save progress to backend so it shows in My Progress tab
            progressAPI.update({
                materialId: material._id,
                percentComplete: 100,
                isCompleted: true,
                totalListened: Math.round((words.length / Math.max(1, rate)) * 0.4), // approx seconds
            }).catch(() => { }); // silent fail
        };
        utt.onerror = (e) => { if (e.error !== 'interrupted') setIsPlaying(false); };
        window.speechSynthesis.speak(utt);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (isPlaying) { window.speechSynthesis.pause(); setIsPlaying(false); speak('Paused.'); }
        else if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setIsPlaying(true); speak('Resumed.'); }
        else { startSpeechFrom(wordIndex); }
    };

    const changeRate = (r) => {
        const rounded = Math.round(Math.min(Math.max(0.5, r), 2.0) * 10) / 10;
        setRate(rounded);
        // Use ref to get current word position (avoids stale closure)
        const currentWord = wordIndexRef.current;
        if (isPlaying) { window.speechSynthesis.cancel(); setTimeout(() => startSpeechFrom(currentWord), 100); }
        speak(`Speed ${rounded.toFixed(1)}x`);
    };

    const skipBack = () => {
        const newIdx = Math.max(0, wordIndexRef.current - 40);
        wordIndexRef.current = newIdx;
        setWordIndex(newIdx);
        setProgress(totalWords > 0 ? Math.round((newIdx / totalWords) * 100) : 0);
        if (isPlaying) { window.speechSynthesis.cancel(); setTimeout(() => startSpeechFrom(newIdx), 80); }
        else startSpeechFrom(newIdx);
        speak('Back 15 seconds.');
    };

    const skipForward = () => {
        const newIdx = Math.min(totalWords, wordIndexRef.current + 40);
        wordIndexRef.current = newIdx;
        setWordIndex(newIdx);
        setProgress(totalWords > 0 ? Math.round((newIdx / totalWords) * 100) : 0);
        if (newIdx >= totalWords) { setShowQuizPrompt(true); return; }
        if (isPlaying) { window.speechSynthesis.cancel(); setTimeout(() => startSpeechFrom(newIdx), 80); }
        else startSpeechFrom(newIdx);
        speak('Forward 15 seconds.');
    };

    const selectChapter = (idx) => {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
        setCurrentChapterIndex(idx);
        speak(idx === -1 ? 'Full overview.' : `Chapter ${idx + 1}: ${chapters[idx]?.title}`);
    };

    useEffect(() => {
        const h = (e) => {
            if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
            if (e.key === 'j') skipBack();
            if (e.key === 'k') skipForward();
            if (e.key === 'n' && currentChapterIndex < chapters.length - 1) selectChapter(currentChapterIndex + 1);
            if (e.key === 'b' && currentChapterIndex > 0) selectChapter(currentChapterIndex - 1);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [isPlaying, rate, currentChapterIndex, wordIndex]);

    const activeTitle = currentChapterIndex === -1 ? material.title : chapters[currentChapterIndex]?.title;
    const currentText = getCurrentText(currentChapterIndex);
    const hasContent = currentText.trim().length > 10;
    const previewText = currentText.slice(0, 400) + (currentText.length > 400 ? '…' : '');

    return (
        <motion.section initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
            <button onClick={() => { window.speechSynthesis?.cancel(); onBack(); }}
                className="px-6 py-3 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-gray-400 hover:text-teal-400 hover:border-teal-500/50 transition-all flex items-center gap-2">
                ← BACK TO LIBRARY
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0a0f] border-2 border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl">
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-teal-600 to-teal-900 flex items-center justify-center shadow-[0_0_60px_rgba(20,184,166,0.3)] mb-6 relative">
                            <Headphones size={64} className="text-white" />
                            <AnimatePresence>
                                {isPlaying && (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.3, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.2, repeatType: 'reverse' }}
                                        className="absolute inset-0 rounded-full border-4 border-teal-400/40" />
                                )}
                            </AnimatePresence>
                        </div>

                        <h2 className="text-3xl font-black text-white mb-1">{activeTitle}</h2>
                        <p className="text-teal-400 font-black italic mb-2">{material.subject} • {material.gradeLevel}</p>
                        {currentChapterIndex >= 0 && (
                            <span className="inline-block px-4 py-1 bg-white/5 rounded-full text-xs font-black uppercase text-gray-400 mb-4">Chapter {currentChapterIndex + 1}</span>
                        )}

                        {!hasContent && (
                            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 mb-4 text-amber-400 font-bold text-sm w-full text-left">
                                ⚠️ No text found. The PDF may be a scanned image. Ask your teacher to upload a text-searchable PDF.
                            </div>
                        )}
                        {hasContent && (
                            <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-5 text-left">
                                <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mb-2">📄 Content to be narrated:</p>
                                <p className="text-sm text-gray-300 leading-relaxed">{previewText}</p>
                            </div>
                        )}

                        <div className="w-full mb-6">
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <motion.div className="h-full bg-gradient-to-r from-teal-500 to-teal-300" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 font-bold mt-1 tabular-nums">
                                <span>{wordIndex} words read</span><span>{Math.round(progress)}%</span><span>{totalWords} total</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                            <button onClick={skipBack} title="Back 15 sec (J)"
                                className="w-16 h-16 rounded-2xl bg-white/5 border-2 border-white/10 flex flex-col items-center justify-center text-gray-400 hover:text-teal-400 hover:border-teal-400 transition-all gap-0.5">
                                <SkipBack size={22} />
                                <span className="text-[9px] font-black">-15s</span>
                            </button>
                            <button onClick={togglePlay} disabled={!hasContent}
                                className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-black transition-all outline-none focus:ring-8 focus:ring-teal-400/30 shadow-[0_0_40px_rgba(45,212,191,0.4)] ${hasContent ? 'bg-teal-400 hover:bg-teal-300 hover:scale-105 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'}`}>
                                {isPlaying ? <Pause size={44} fill="currentColor" /> : <Play size={44} fill="currentColor" className="ml-2" />}
                            </button>
                            <button onClick={skipForward} title="Forward 15 sec (K)"
                                className="w-16 h-16 rounded-2xl bg-white/5 border-2 border-white/10 flex flex-col items-center justify-center text-gray-400 hover:text-teal-400 hover:border-teal-400 transition-all gap-0.5">
                                <SkipForward size={22} />
                                <span className="text-[9px] font-black">+15s</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 font-bold">Space = Play/Pause • J = -15s • K = +15s • N/B = Chapters</p>
                    </div>

                    <AnimatePresence>
                        {showQuizPrompt && quiz && (
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-teal-900/80 to-teal-800/60 border-2 border-teal-500/40 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-1">KNOWLEDGE CHECK!</h3>
                                    <p className="text-teal-200 font-bold">Finished listening. Ready for a quiz?</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowQuizPrompt(false)} className="px-6 py-3 rounded-xl font-black bg-white/10 hover:bg-white/20 text-white">SKIP</button>
                                    <button onClick={() => { setShowQuizPrompt(false); onGoToQuizzes && onGoToQuizzes(); }} className="px-8 py-3 rounded-xl bg-teal-400 text-black font-black hover:bg-teal-300">TAKE QUIZ</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0a0a0f] border-2 border-white/10 rounded-[2rem] p-6">
                        <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-white"><Activity size={22} className="text-teal-400" /> CHAPTERS</h3>
                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                            {chapters.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No chapters detected. Upload a PDF first.</p>}
                            {chapters.map((ch, i) => (
                                <button key={i} onClick={() => selectChapter(i)}
                                    className={`w-full text-left p-4 rounded-2xl font-bold transition-all border-2 flex items-center gap-3 ${currentChapterIndex === i ? 'bg-teal-400/10 border-teal-400 text-teal-400' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}>
                                    <span className="w-8 h-8 shrink-0 rounded-lg bg-black/40 flex items-center justify-center text-xs font-black text-white">{i + 1}</span>
                                    <span className="truncate">{ch.title}</span>
                                    {ch.transcript && <Volume2 size={12} className="text-teal-600 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0a0a0f] border-2 border-white/10 rounded-[2rem] p-6">
                        <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-white"><Zap size={22} className="text-teal-400" /> VOICE SPEED</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { r: 0.5, label: 'Very Slow\n0.5×' },
                                { r: 0.7, label: 'Slow\n0.7×' },
                                { r: 1.0, label: 'Normal\n1.0×' },
                                { r: 1.5, label: 'Fast\n1.5×' },
                                { r: 2.0, label: 'Fastest\n2.0×' }
                            ].map(({ r, label }) => (
                                <button key={r} onClick={() => changeRate(r)}
                                    className={`py-4 px-2 rounded-2xl font-black transition-all border-2 text-center text-sm whitespace-pre-line leading-tight ${rate === r ? 'bg-teal-400 border-teal-400 text-black' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </motion.section>
    );
}


// ────────────────────────────────────────────────────────────────────────────
// Progress Section
// ────────────────────────────────────────────────────────────────────────────
function ProgressSection({ announce }) {
    const [progress, setProgress] = useState([]);
    const [quizResults, setQuizResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [progRes, quizRes] = await Promise.all([
                    progressAPI.getSummary(),
                    quizzesAPI.getAll(),
                ]);
                setProgress(progRes.data?.recentProgress || []);
                setQuizResults(quizRes.data || []);
                announce('Your learning progress is ready.');
            } catch {
                announce('Could not load progress.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [announce]);

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="space-y-12"
        >
            <div className="text-center">
                <h2 className="text-5xl font-black mb-4 text-white">My Learning Journey</h2>
                <div className="inline-flex items-center gap-2 bg-teal-400/10 text-teal-400 px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm border border-teal-400/20">
                    <Activity size={18} /> Daily Goal: 45 Minutes of Listening
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-bold italic">Analyzing your growth...</p>
                </div>
            ) : progress.length === 0 ? (
                <div className="bg-white/5 rounded-[3rem] p-24 text-center border-2 border-white/5">
                    <BarChart size={64} className="mx-auto mb-6 text-gray-700" />
                    <p className="text-xl font-bold text-gray-500">Your amazing journey starts here. Listen to your first book!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {progress.map((p, i) => {
                        const pct = p.percentComplete || 0;
                        const title = p.material?.title || p.title || 'Unknown Book';
                        const subject = p.material?.subject || p.subject || 'Subject';
                        const listenedMins = p.totalListened ? Math.round(p.totalListened / 60) : null;
                        const statusColor = pct >= 80 ? 'from-teal-400 to-teal-300' : pct >= 40 ? 'from-teal-600 to-teal-400' : 'from-teal-900 to-teal-700';
                        return (
                            <div key={i} className="bg-[#0a0a0f] border-2 border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:border-teal-800 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-2xl font-black truncate text-white">{title}</h3>
                                    <div className={`shrink-0 text-sm font-black px-4 py-1 rounded-full ${pct >= 80 ? 'bg-teal-400/20 text-teal-300' : pct >= 40 ? 'bg-teal-900/40 text-teal-400' : 'bg-white/10 text-gray-400'}`}>
                                        {pct}%
                                    </div>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                        className={`h-full bg-gradient-to-r ${statusColor} rounded-full`}
                                    />
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>{subject}</span>
                                    {listenedMins != null && <span className="text-teal-600">{listenedMins} min listened</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Quiz Results ── */}
            <div>
                <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                    <Brain size={28} className="text-teal-400" /> Quiz Results
                </h3>
                {quizResults.length === 0 ? (
                    <div className="bg-white/5 rounded-[2rem] p-12 text-center border-2 border-white/5">
                        <Brain size={48} className="mx-auto mb-4 text-gray-700" />
                        <p className="text-gray-500 font-bold">No quizzes available yet. Ask your teacher to generate a quiz!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quizResults.map((q, i) => {
                            const attempt = q.attempts?.[q.attempts.length - 1];
                            const score = attempt?.percentageScore ?? null;
                            const passed = attempt?.passed;
                            return (
                                <div key={i} className={`bg-[#0a0a0f] border-2 rounded-[2rem] p-7 space-y-4 transition-all ${score === null ? 'border-white/10' : passed ? 'border-teal-500/40' : 'border-red-500/30'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="text-lg font-black text-white truncate">{q.title}</h4>
                                            <p className="text-sm text-gray-500 font-bold mt-0.5">{q.questions?.length} questions</p>
                                        </div>
                                        {score !== null && (
                                            <span className={`shrink-0 text-sm font-black px-3 py-1.5 rounded-full ${passed ? 'bg-teal-400/15 text-teal-300' : 'bg-red-500/15 text-red-400'}`}>
                                                {passed ? '✓ Passed' : '✗ Failed'}
                                            </span>
                                        )}
                                    </div>
                                    {score !== null ? (
                                        <>
                                            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${score}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                    className={`h-full rounded-full ${passed ? 'bg-gradient-to-r from-teal-500 to-teal-300' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm font-bold">
                                                <span className="text-gray-500">Score</span>
                                                <span className={passed ? 'text-teal-400' : 'text-red-400'}>{score}%</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-gray-600 font-bold italic">Not attempted yet — go to Quizzes tab!</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </motion.section>
    );
}

// ─── Quiz Section ─────────────────────────────────────────────────────────────────────────────
function QuizSection({ speak }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);   // quiz being taken
    const [answers, setAnswers] = useState({});            // { qIndex: optionIndex }
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);           // { percentageScore, passed, detailedResults }
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        quizzesAPI.getAll()
            .then(res => setQuizzes(res.data || []))
            .catch(err => setError(err.message || 'Failed to load quizzes'))
            .finally(() => setLoading(false));
    }, []);

    const startQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        const mins = quiz.timeLimit || 10;
        setTimeLeft(mins * 60);
        speak(`Starting quiz: ${quiz.title}. ${quiz.questions.length} questions. ${mins} minutes.`);
    };

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || submitted) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, submitted]);

    const handleSubmit = async () => {
        if (submitted) return;
        clearTimeout(timerRef.current);
        setSubmitted(true);
        const answerArray = Object.entries(answers).map(([qi, opt]) => ({
            questionIndex: parseInt(qi), selectedOption: opt
        }));
        try {
            const res = await quizzesAPI.submitAttempt(activeQuiz._id, {
                answers: answerArray,
                timeTaken: (activeQuiz.timeLimit || 10) * 60 - (timeLeft || 0)
            });
            setResult(res.data);
            speak(res.data.passed ? `Quiz complete! You passed with ${res.data.percentageScore} percent.` : `Quiz complete. Score: ${res.data.percentageScore} percent. Better luck next time!`);
        } catch (err) {
            speak('Failed to submit quiz.');
        }
    };

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── Quiz List ────────────────────────────────────────────────────────────────────────
    if (!activeQuiz) return (
        <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            aria-label="Quizzes"
        >
            <div>
                <h2 className="text-4xl font-black text-white mb-1">Quizzes</h2>
                <p className="text-gray-400">Test your knowledge from the audio lessons.</p>
            </div>

            {loading && <p className="text-teal-400 animate-pulse py-12 text-center">Loading quizzes...</p>}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                    <AlertCircle size={20} /> {error}
                </div>
            )}
            {!loading && !error && quizzes.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <Brain size={56} className="mx-auto mb-4 text-teal-900" />
                    <p className="text-xl font-bold">No quizzes available yet.</p>
                    <p className="text-sm mt-2">Ask your teacher to generate quizzes from materials.</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {quizzes.map(quiz => (
                    <motion.div
                        key={quiz._id}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 bg-[#0a0a0f] border border-teal-900/30 rounded-2xl hover:border-teal-600/40 transition-all cursor-pointer"
                        onClick={() => startQuiz(quiz)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && startQuiz(quiz)}
                        aria-label={`Start quiz: ${quiz.title}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-black text-white leading-snug">{quiz.title}</h3>
                            <Trophy size={20} className="text-teal-400 shrink-0 ml-3" />
                        </div>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{quiz.description || `${quiz.questions?.length || 0} questions`}</p>
                        <div className="flex flex-wrap gap-3 text-xs font-bold">
                            <span className="bg-teal-400/10 text-teal-400 px-3 py-1 rounded-full">{quiz.questions?.length || 0} Qs</span>
                            <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full flex items-center gap-1"><Clock size={11} /> {quiz.timeLimit || 10} min</span>
                            <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full">Pass: {quiz.passingScore || 60}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );

    // ── Quiz Taking UI ──────────────────────────────────────────────────────────────────
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white">{activeQuiz.title}</h2>
                    <p className="text-gray-400 text-sm">{submitted ? 'Results' : `${Object.keys(answers).length} / ${activeQuiz.questions.length} answered`}</p>
                </div>
                {!submitted && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-teal-500/10 text-teal-400'
                        }`}>
                        <Clock size={18} /> {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Results panel */}
            {submitted && result && (
                <div className={`p-6 rounded-2xl border-2 text-center ${result.passed
                    ? 'bg-teal-500/10 border-teal-500/40'
                    : 'bg-red-500/10 border-red-500/40'
                    }`}>
                    <div className="text-5xl font-black mb-2">{result.percentageScore}%</div>
                    <div className={`text-xl font-bold mb-1 ${result.passed ? 'text-teal-400' : 'text-red-400'}`}>
                        {result.passed ? '🎉 Passed!' : '❌ Not passed'}
                    </div>
                    <p className="text-gray-400 text-sm">Score: {result.totalScore} / {result.maxScore}</p>
                    <button
                        onClick={() => setActiveQuiz(null)}
                        className="mt-4 px-6 py-2 bg-teal-500 text-black font-black rounded-xl hover:bg-teal-400 transition-all"
                    >
                        Back to Quizzes
                    </button>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
                {activeQuiz.questions.map((q, qi) => {
                    const detail = result?.detailedResults?.[qi];
                    return (
                        <div key={qi} className="p-5 bg-[#0a0a0f] border border-teal-900/30 rounded-2xl space-y-4">
                            <p className="font-bold text-white">
                                <span className="text-teal-400 mr-2">Q{qi + 1}.</span>{q.questionText}
                            </p>
                            <div className="grid gap-2">
                                {(q.options || []).map((opt, oi) => {
                                    let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ';
                                    if (submitted && detail) {
                                        if (oi === detail.correctAnswer) cls += 'bg-teal-500/10 border-teal-500/60 text-teal-300';
                                        else if (oi === detail.selectedOption && !detail.isCorrect) cls += 'bg-red-500/10 border-red-500/40 text-red-400';
                                        else cls += 'bg-white/[0.02] border-white/5 text-gray-500';
                                    } else if (answers[qi] === oi) {
                                        cls += 'bg-teal-500/20 border-teal-500/60 text-white';
                                    } else {
                                        cls += 'bg-white/[0.02] border-white/10 text-gray-300 hover:border-teal-700';
                                    }
                                    return (
                                        <button
                                            key={oi}
                                            disabled={submitted}
                                            onClick={() => { setAnswers(a => ({ ...a, [qi]: oi })); speak(opt); }}
                                            className={cls}
                                            aria-pressed={answers[qi] === oi}
                                        >
                                            {submitted && detail && oi === detail.correctAnswer && <CheckCircle size={14} className="inline mr-1 text-teal-400" />}
                                            {submitted && detail && oi === detail.selectedOption && !detail.isCorrect && <XCircle size={14} className="inline mr-1 text-red-400" />}
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                            {submitted && detail?.explanation && (
                                <p className="text-sm text-gray-500 italic border-l-2 border-teal-800 pl-3">{detail.explanation}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Submit button */}
            {!submitted && (
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-4 bg-teal-500 text-black font-black rounded-2xl text-lg hover:bg-teal-400 transition-all"
                    >
                        Submit Quiz
                    </button>
                    <button
                        onClick={() => setActiveQuiz(null)}
                        className="px-6 py-4 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </motion.div>
    );
}
