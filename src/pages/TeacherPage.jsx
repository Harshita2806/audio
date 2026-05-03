import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu, X, LogOut, Upload, Music, BarChart3, BookOpen,
    FileText, Zap, Clock, Users, Volume2, Sparkles, CheckCircle,
    TrendingUp, Award, Eye, Star, Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { materialsAPI, analyticsAPI, announcementsAPI } from "../services/api";
import { quizzesAPI } from "../services/api";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "English", "Science", "Social Science", "Other"];
const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export default function TeacherPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [materials, setMaterials] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);

    const [uploadForm, setUploadForm] = useState({
        title: "", subject: "Mathematics", gradeLevel: "Grade 10", chapter: "", description: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("idle");
    const [uploadMessage, setUploadMessage] = useState("");

    useEffect(() => { fetchMaterials(); fetchAnalytics(); }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const response = await materialsAPI.getAll({ subject: "", gradeLevel: "" });
            setMaterials(response.data || []);
        } catch (err) {
            console.error("Failed to fetch materials:", err);
        } finally { setLoading(false); }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getOverview();
            setAnalytics(response.data || {});
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            setAnalytics({});
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") { setUploadMessage("Please select a PDF file."); setUploadStatus("error"); return; }
        if (file.size > 50 * 1024 * 1024) { setUploadMessage("File too large. Maximum is 50MB."); setUploadStatus("error"); return; }
        setSelectedFile(file);
        if (!uploadForm.title) setUploadForm(prev => ({ ...prev, title: file.name.replace(".pdf", "") }));
        setUploadStatus("idle"); setUploadMessage("");
    };

    const handleUpload = async () => {
        if (!selectedFile) { setUploadMessage("Please select a PDF file."); setUploadStatus("error"); return; }
        if (!uploadForm.title.trim()) { setUploadMessage("Please enter a title."); setUploadStatus("error"); return; }
        setUploadStatus("uploading");
        try {
            const formData = new FormData();
            formData.append("pdf", selectedFile);
            Object.entries(uploadForm).forEach(([k, v]) => { if (v) formData.append(k, v); });
            await materialsAPI.create(formData);
            setUploadMessage("PDF uploaded successfully!");
            setUploadStatus("success");
            setSelectedFile(null);
            setUploadForm({ title: "", subject: "Mathematics", gradeLevel: "Grade 10", chapter: "", description: "" });
            fetchMaterials();
        } catch (err) {
            setUploadMessage(err.message || "Upload failed.");
            setUploadStatus("error");
        }
    };

    const handleGenerateAudio = async (materialId) => {
        try {
            setUploadStatus("uploading");
            setUploadMessage("Generating audio... this may take a few minutes for a large PDF.");
            await materialsAPI.generateAudio(materialId);
            setUploadMessage("✅ Audio generated successfully!");
            setUploadStatus("success");
            setTimeout(() => fetchMaterials(), 1000);
        } catch (err) {
            setUploadMessage(err.message || "Audio generation failed.");
            setUploadStatus("error");
        }
    };

    const handleGenerateQuiz = async (materialId) => {
        try {
            setUploadStatus("uploading");
            setUploadMessage("Generating quiz questions from PDF content...");
            const res = await materialsAPI.generateQuiz(materialId);
            setUploadMessage(`✅ ${res.message || "Quiz generated successfully!"}`);
            setUploadStatus("success");
        } catch (err) {
            setUploadMessage(err.message || "Quiz generation failed. Make sure audio has been generated first.");
            setUploadStatus("error");
        }
    };

    const handlePublish = async (materialId) => {
        try {
            await materialsAPI.publish(materialId);
            setUploadMessage("Material published successfully!");
            setUploadStatus("success");
            fetchMaterials();
        } catch (err) {
            setUploadMessage(err.message || "Failed to publish.");
            setUploadStatus("error");
        }
    };

    const handleDelete = async (materialId, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?\n\nThis will permanently remove the PDF, audio files, and all associated data.`)) return;
        try {
            await materialsAPI.delete(materialId);
            setUploadMessage(`"${title}" deleted successfully.`);
            setUploadStatus("success");
            fetchMaterials();
        } catch (err) {
            setUploadMessage(err.message || "Delete failed.");
            setUploadStatus("error");
        }
    };

    const handleLogout = () => { logout(); navigate("/auth", { replace: true }); };
    const closeAndNavigate = (section) => { setActiveSection(section); setSidebarOpen(false); };

    return (
        <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-teal-900/30 bg-[#0a0a0f]/95 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-teal-500/10 rounded-xl transition-all text-teal-400 md:hidden"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                {/* Desktop nav tabs */}
                <nav className="hidden md:flex items-center gap-2">
                    <h1 className="text-xl font-black text-white mr-6">
                        ACCESS<span className="text-teal-400">LEARN</span> <span className="text-gray-600 text-sm font-medium">Teacher</span>
                    </h1>
                    {[
                        { id: "dashboard", label: "Dashboard", icon: <Zap size={16} /> },
                        { id: "announcements", label: "Announcements", icon: <FileText size={16} /> },
                        { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${activeSection === item.id
                                ? "bg-teal-400 text-black border-teal-400"
                                : "text-gray-400 border-transparent hover:text-white hover:border-teal-900"
                                }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3 ml-auto">
                    <span className="text-sm font-semibold hidden sm:block text-gray-300">{user?.name}</span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center font-black shadow-lg text-black">
                        {user?.name?.charAt(0).toUpperCase() || "T"}
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </header>

            {/* ── Main Content ────────────────────────────────────────────── */}
            <main className="pt-24 pb-8 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {activeSection === "dashboard" && (
                            <TeacherDashboardSection
                                key="dashboard"
                                materials={materials}
                                analytics={analytics}
                                loading={loading}
                                uploadForm={uploadForm}
                                setUploadForm={setUploadForm}
                                selectedFile={selectedFile}
                                handleFileSelect={handleFileSelect}
                                handleUpload={handleUpload}
                                handleGenerateAudio={handleGenerateAudio}
                                handleGenerateQuiz={handleGenerateQuiz}
                                handlePublish={handlePublish}
                                handleDelete={handleDelete}
                                uploadStatus={uploadStatus}
                                uploadMessage={uploadMessage}
                                SUBJECTS={SUBJECTS}
                                GRADES={GRADES}
                            />
                        )}
                        {activeSection === "announcements" && (
                            <AnnouncementsSection key="announcements" />
                        )}
                        {activeSection === "analytics" && (
                            <AnalyticsSection
                                key="analytics"
                                analytics={analytics}
                                materials={materials}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* ── Mobile Sidebar ──────────────────────────────────────────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />
                        <motion.nav
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0f]/95 backdrop-blur-2xl border-r border-teal-900/30 z-50 flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">ACCESS<span className="text-teal-400">LEARN</span></h2>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 p-4 space-y-2">
                                {[
                                    { id: "dashboard", label: "Dashboard", icon: <Zap size={18} /> },
                                    { id: "announcements", label: "Announcements", icon: <FileText size={18} /> },
                                    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => closeAndNavigate(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id
                                            ? "bg-teal-500/20 border border-teal-500/50 text-teal-300"
                                            : "hover:bg-white/5 text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        {item.icon}<span className="font-bold">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold"
                                >
                                    <LogOut size={18} /><span>Sign Out</span>
                                </button>
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Teacher Dashboard Section ───────────────────────────────────────────────
function TeacherDashboardSection({
    materials, analytics, loading, uploadForm, setUploadForm, selectedFile,
    handleFileSelect, handleUpload, handleGenerateAudio, handleGenerateQuiz, handlePublish, handleDelete, uploadStatus,
    uploadMessage, SUBJECTS, GRADES
}) {
    const published = materials.filter(m => m.status === "published");
    const withAudio = materials.filter(m => m.audioUrl || (m.chapters && m.chapters.some(c => c.audioUrl)));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Materials", value: materials.length, icon: <FileText size={22} />, accent: "teal" },
                    { label: "Published", value: published.length, icon: <CheckCircle size={22} />, accent: "white" },
                    { label: "With Audio", value: withAudio.length, icon: <Volume2 size={22} />, accent: "teal" },
                    { label: "Student Reach", value: analytics?.totalStudents || 0, icon: <Users size={22} />, accent: "white" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.03 }}
                        className="p-6 rounded-2xl bg-[#0a0a0f] border border-teal-900/30 hover:border-teal-600/40 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-semibold">{stat.label}</p>
                                <p className="text-4xl font-black mt-2 text-white">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.accent === "teal" ? "bg-teal-500/10 text-teal-400" : "bg-white/5 text-white"}`}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Upload Section */}
            <div className="bg-[#0a0a0f] border border-teal-900/30 rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                    <Upload size={24} className="text-teal-400" /> Upload &amp; Generate Audio
                </h2>

                {uploadMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl border flex items-center gap-3 font-semibold ${uploadStatus === "error"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : uploadStatus === "uploading"
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                                : "bg-teal-500/10 border-teal-500/30 text-teal-400"
                            }`}
                    >
                        {uploadStatus === "uploading" && <Sparkles size={18} className="animate-spin" />}
                        {uploadMessage}
                    </motion.div>
                )}

                <div className="space-y-6">
                    {/* Drop zone */}
                    <div
                        onClick={() => document.getElementById("pdfInput")?.click()}
                        className="border-2 border-dashed border-teal-900/50 rounded-xl p-10 text-center hover:border-teal-500/50 transition-all cursor-pointer bg-teal-900/5"
                    >
                        <input id="pdfInput" type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                        <FileText size={48} className="mx-auto mb-3 text-teal-700" />
                        <p className="text-white font-black text-lg">
                            {selectedFile ? selectedFile.name : "Click to upload a PDF"}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Maximum 50 MB</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="Material Title *"
                            value={uploadForm.title}
                            onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                            className="px-4 py-3 rounded-xl bg-white/5 border border-teal-900/30 focus:border-teal-500 focus:bg-white/10 outline-none text-white placeholder:text-gray-600 transition-all"
                        />
                        <select
                            value={uploadForm.subject}
                            onChange={e => setUploadForm(p => ({ ...p, subject: e.target.value }))}
                            className="px-4 py-3 rounded-xl bg-white/5 border border-teal-900/30 focus:border-teal-500 outline-none text-white transition-all"
                        >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select
                            value={uploadForm.gradeLevel}
                            onChange={e => setUploadForm(p => ({ ...p, gradeLevel: e.target.value }))}
                            className="px-4 py-3 rounded-xl bg-white/5 border border-teal-900/30 focus:border-teal-500 outline-none text-white transition-all"
                        >
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <input
                            type="text" placeholder="Chapter (optional)"
                            value={uploadForm.chapter}
                            onChange={e => setUploadForm(p => ({ ...p, chapter: e.target.value }))}
                            className="px-4 py-3 rounded-xl bg-white/5 border border-teal-900/30 focus:border-teal-500 focus:bg-white/10 outline-none text-white placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={uploadStatus === "uploading"}
                        className="w-full px-6 py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 rounded-xl font-black transition-all flex items-center justify-center gap-2 text-black text-lg"
                    >
                        {uploadStatus === "uploading" ? "Uploading..." : "Upload PDF"}
                    </button>
                </div>
            </div>

            {/* Materials List */}
            <div className="bg-[#0a0a0f] border border-teal-900/30 rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                    <BookOpen size={24} className="text-teal-400" /> Your Materials
                    <span className="ml-auto text-sm font-bold bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full">{materials.length} total</span>
                </h2>
                <div className="space-y-3">
                    {materials.length === 0 ? (
                        <p className="text-gray-500 text-center py-12">No materials yet. Upload a PDF above to get started.</p>
                    ) : materials.map(material => (
                        <div key={material._id} className="p-5 bg-white/[0.02] border border-teal-900/20 rounded-xl hover:border-teal-700/40 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-white">{material.title}</h3>
                                        {material.status === "published" && (
                                            <span className="text-xs bg-teal-400/10 text-teal-400 border border-teal-400/20 px-2 py-0.5 rounded-full font-bold">Published</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{material.subject} • {material.gradeLevel}</p>
                                    {material.chapters?.length > 0 && (
                                        <p className="text-xs text-gray-600 mt-1">{material.chapters.length} chapters detected</p>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {/* Generate Audio — only if no audio exists yet */}
                                    {!material.audioUrl && !(material.chapters?.some(c => c.audioUrl)) && (
                                        <button
                                            onClick={() => handleGenerateAudio(material._id)}
                                            className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all"
                                        >
                                            <Music size={14} /> Generate Audio
                                        </button>
                                    )}
                                    {/* Re-generate Audio — if audio exists, allow regenerating */}
                                    {(material.audioUrl || material.chapters?.some(c => c.audioUrl)) && (
                                        <button
                                            onClick={() => handleGenerateAudio(material._id)}
                                            className="px-4 py-2 bg-teal-900/20 hover:bg-teal-500/20 text-teal-600 hover:text-teal-400 border border-teal-900/30 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all"
                                            title="Re-generate audio"
                                        >
                                            <Music size={14} /> Re-Generate
                                        </button>
                                    )}
                                    {/* Generate Quiz — only if chapters with transcripts exist */}
                                    {material.chapters?.length > 0 && (
                                        <button
                                            onClick={() => handleGenerateQuiz(material._id)}
                                            className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all"
                                        >
                                            <Sparkles size={14} /> Generate Quiz
                                        </button>
                                    )}
                                    {/* Publish */}
                                    {material.status !== "published" && (
                                        <button
                                            onClick={() => handlePublish(material._id)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all"
                                        >
                                            <CheckCircle size={14} /> Publish
                                        </button>
                                    )}
                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(material._id, material.title)}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all"
                                        title="Delete material"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Analytics Section ───────────────────────────────────────────────────────
function AnalyticsSection({ analytics, materials }) {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentError, setStudentError] = useState(null);
    const [studentData, setStudentData] = useState({});

    const fetchStudents = () => {
        setLoadingStudents(true);
        setStudentError(null);
        analyticsAPI.getStudents()
            .then(res => {
                const d = res.data || {};
                setStudents(d.students || []);
                setStudentData(d);
            })
            .catch(err => setStudentError(err.message || "Failed to load analytics"))
            .finally(() => setLoadingStudents(false));
    };

    useEffect(() => { fetchStudents(); }, []);

    const avgQuizScore = studentData.avgQuizScoreAll ?? 0;
    const totalListenedMins = studentData.totalListenedMinutes ?? 0;
    const publishedCount = materials.filter(m => m.status === "published").length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Overview Header */}
            <div>
                <h2 className="text-4xl font-black text-white mb-1">Student Analytics</h2>
                <p className="text-gray-400 font-medium">Track how your students are engaging with your materials.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Students",
                        value: students.length,
                        icon: <Users size={22} />,
                        sub: "engaged with your content",
                        teal: true,
                    },
                    {
                        label: "Hours Listened",
                        value: `${Math.round(totalListenedMins / 60)}h`,
                        icon: <Clock size={22} />,
                        sub: `${totalListenedMins} minutes total`,
                        teal: false,
                    },
                    {
                        label: "Avg Quiz Score",
                        value: `${avgQuizScore}%`,
                        icon: <Award size={22} />,
                        sub: "across all students",
                        teal: true,
                    },
                    {
                        label: "Published Materials",
                        value: publishedCount,
                        icon: <BookOpen size={22} />,
                        sub: `of ${materials.length} total`,
                        teal: false,
                    },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="p-6 bg-[#0a0a0f] border border-teal-900/30 rounded-2xl hover:border-teal-600/40 transition-all"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.teal ? "bg-teal-500/10 text-teal-400" : "bg-white/5 text-white"}`}>
                            {s.icon}
                        </div>
                        <p className="text-4xl font-black text-white">{s.value}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Student Engagement Table */}
            <div className="bg-[#0a0a0f] border border-teal-900/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <TrendingUp size={22} className="text-teal-400" /> Student Progress
                    </h3>
                    <button onClick={fetchStudents} className="text-xs text-teal-400 hover:text-teal-300 font-bold border border-teal-900/50 px-3 py-1.5 rounded-lg hover:border-teal-600/40 transition-all">
                        Refresh
                    </button>
                </div>

                {loadingStudents ? (
                    <div className="text-center py-16">
                        <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 font-semibold">Loading student data...</p>
                    </div>
                ) : studentError ? (
                    <div className="text-center py-16">
                        <p className="text-red-400 mb-4 font-semibold">⚠️ {studentError}</p>
                        <button onClick={fetchStudents} className="px-5 py-2.5 bg-teal-500/10 text-teal-400 rounded-xl hover:bg-teal-500/20 transition-all text-sm font-bold border border-teal-500/20">
                            Retry
                        </button>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-16">
                        <Users size={48} className="mx-auto mb-4 text-gray-700" />
                        <p className="text-gray-400 font-semibold">No students have accessed your materials yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {students.map((s, i) => {
                            const pct = s.avgCompletion || 0;
                            const scoreColor = s.avgQuizScore >= 70 ? "text-teal-400" : s.avgQuizScore >= 40 ? "text-amber-400" : "text-red-400";
                            const progressColor = pct >= 70 ? "bg-gradient-to-r from-teal-500 to-teal-300" : pct >= 40 ? "bg-gradient-to-r from-amber-600 to-amber-400" : "bg-gradient-to-r from-red-700 to-red-500";
                            return (
                                <motion.div
                                    key={s._id || i}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className="p-5 bg-white/[0.02] border border-teal-900/20 rounded-xl hover:border-teal-700/30 transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Avatar + name */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-teal-600 to-teal-900 flex items-center justify-center font-black text-black">
                                                {s.name?.charAt(0).toUpperCase() || "S"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-white truncate">{s.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{s.email}</p>
                                            </div>
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-4 md:w-auto md:flex md:gap-6 text-center md:text-left">
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Materials</p>
                                                <p className="font-black text-white mt-0.5">{s.materialsAccessed || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Completed</p>
                                                <p className="font-black text-white mt-0.5">{s.completedCount || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Quiz Score</p>
                                                <p className={`font-black mt-0.5 ${scoreColor}`}>{s.avgQuizScore || 0}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-gray-500">Avg Completion</span>
                                            <span className="text-white">{pct}%</span>
                                        </div>
                                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 }}
                                                className={`h-full rounded-full ${progressColor}`}
                                            />
                                        </div>
                                    </div>

                                    {s.lastActive && (
                                        <p className="text-[11px] text-gray-600 mt-2 font-medium">
                                            Last active: {new Date(s.lastActive).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Material Performance */}
            <div className="bg-[#0a0a0f] border border-teal-900/30 rounded-2xl p-6">
                <h3 className="text-xl font-black mb-6 text-white flex items-center gap-2">
                    <BookOpen size={22} className="text-teal-400" /> Material Performance
                </h3>
                {materials.filter(m => m.status === "published").length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No published materials yet.</p>
                ) : (
                    <div className="space-y-4">
                        {materials.filter(m => m.status === "published").map(m => {
                            const maxViews = Math.max(...materials.map(x => x.totalViews || 0), 1);
                            const barPct = Math.round(((m.totalViews || 0) / maxViews) * 100);
                            return (
                                <div key={m._id} className="p-4 bg-white/[0.02] border border-teal-900/20 rounded-xl">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-white truncate">{m.title}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">{m.subject} • {m.gradeLevel} • {m.chapters?.length || 0} chapters</p>
                                        </div>
                                        <div className="flex gap-6 text-sm shrink-0">
                                            <div className="text-center">
                                                <div className="flex items-center gap-1 text-gray-500 text-[10px] font-semibold uppercase"><Eye size={10} /> Views</div>
                                                <p className="font-black text-teal-400 text-lg">{m.totalViews || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center gap-1 text-gray-500 text-[10px] font-semibold uppercase"><Volume2 size={10} /> Listens</div>
                                                <p className="font-black text-teal-400 text-lg">{m.totalListens || 0}</p>
                                            </div>
                                            {m.averageRating != null && (
                                                <div className="text-center">
                                                    <div className="flex items-center gap-1 text-gray-500 text-[10px] font-semibold uppercase"><Star size={10} /> Rating</div>
                                                    <p className="font-black text-white text-lg">{m.averageRating?.toFixed(1) || "—"}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Relative bar */}
                                    <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${barPct}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-teal-500 to-teal-300 rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Announcements Section ───────────────────────────────────────────────────
function AnnouncementsSection() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
    const [creating, setCreating] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const res = await announcementsAPI.getAll();
            setAnnouncements(res.data || []);
        } catch (err) {
            setError(err.message || "Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handleCreateAnnouncement = async () => {
        if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
            setError("Please fill in both title and content");
            return;
        }

        setCreating(true);
        setError("");
        try {
            await announcementsAPI.create(newAnnouncement);
            setNewAnnouncement({ title: "", content: "" });
            fetchAnnouncements();
        } catch (err) {
            setError(err.message || "Failed to create announcement");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await announcementsAPI.delete(id);
            fetchAnnouncements();
        } catch (err) {
            setError(err.message || "Failed to delete announcement");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black text-white mb-1">Announcements</h2>
                <p className="text-gray-400 font-medium">Send real-time notifications to all students.</p>
            </div>

            {/* Create Announcement */}
            <div className="bg-[#0a0a0f] border border-teal-900/30 rounded-2xl p-6">
                <h3 className="text-xl font-black mb-4 text-white flex items-center gap-2">
                    <FileText size={22} className="text-teal-400" /> Create New Announcement
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Announcement Title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-teal-900/30 focus:border-teal-500 focus:bg-white/10 outline-none text-white placeholder:text-gray-600 transition-all"
                    />
                    <textarea
                        placeholder="Announcement Content"
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-teal-900/30 focus:border-teal-500 focus:bg-white/10 outline-none text-white placeholder:text-gray-600 transition-all resize-none"
                    />
                    <button
                        onClick={handleCreateAnnouncement}
                        disabled={creating}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 rounded-xl font-black transition-all flex items-center gap-2 text-black"
                    >
                        {creating ? "Creating..." : "Send Announcement"}
                    </button>
                </div>
            </div>

            {/* Announcements List */}
            <div className="bg-[#0a0a0f] border border-teal-900/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <FileText size={22} className="text-teal-400" /> Recent Announcements
                    </h3>
                    <button onClick={fetchAnnouncements} className="text-xs text-teal-400 hover:text-teal-300 font-bold border border-teal-900/50 px-3 py-1.5 rounded-lg hover:border-teal-600/40 transition-all">
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 font-semibold">Loading announcements...</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText size={48} className="mx-auto mb-4 text-gray-700" />
                        <p className="text-gray-400 font-semibold">No announcements yet.</p>
                        <p className="text-gray-600 text-sm mt-1">Create your first announcement above.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <motion.div
                                key={announcement._id}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-white/[0.02] border border-teal-900/20 rounded-xl hover:border-teal-700/30 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-white mb-2">{announcement.title}</h4>
                                        <p className="text-gray-300 leading-relaxed">{announcement.content}</p>
                                        <p className="text-xs text-gray-500 mt-3">
                                            {new Date(announcement.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric",
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete announcement"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}