import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Filter, Search, Mic, Loader2, AlertCircle } from "lucide-react";
import { materialsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "English", "Science", "Social Science"];
const SUBJECT_COLORS = {
    Mathematics: "indigo", Physics: "violet", Chemistry: "emerald", Biology: "green",
    History: "amber", Geography: "orange", English: "sky", Science: "teal", "Social Science": "rose", Other: "gray"
};

export default function SubjectLibrary({ onSelectMaterial }) {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await materialsAPI.getAll();
            setMaterials(data.data || []);
        } catch (err) {
            setError("Failed to load materials. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = materials.filter(m => {
        const matchSubject = filter === "All" || m.subject === filter;
        const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
        return matchSubject && matchSearch;
    });

    return (
        <section className="py-20 px-6 md:px-10 max-w-[1400px] mx-auto" aria-label="Subject Library">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">Subject Library</h2>
                <p className="text-gray-500">AI-powered NCERT audiobooks for all subjects</p>
            </motion.div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="search" placeholder="Search materials…" value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        aria-label="Search materials"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {SUBJECTS.slice(0, 6).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            aria-pressed={filter === s}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${filter === s ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Loading library…</span>
                </div>
            )}

            {error && !loading && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 mb-6" role="alert">
                    <AlertCircle size={18} />
                    {error}
                    <button onClick={fetchMaterials} className="ml-auto text-xs underline">Retry</button>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="text-center py-20 text-gray-600">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-semibold">No materials found</p>
                    <p className="text-sm mt-1">Teachers haven't uploaded any content yet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((material, i) => {
                    const color = SUBJECT_COLORS[material.subject] || "indigo";
                    return (
                        <motion.div
                            key={material._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="group bg-[#09090b] border border-white/10 rounded-[1.5rem] p-6 cursor-pointer hover:border-indigo-500/30 transition-all"
                            onClick={() => onSelectMaterial && onSelectMaterial(material)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Open ${material.title}`}
                            onKeyDown={e => e.key === "Enter" && onSelectMaterial && onSelectMaterial(material)}
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <BookOpen size={22} className={`text-${color}-400`} />
                            </div>
                            <span className={`text-[10px] uppercase tracking-widest font-bold text-${color}-400 mb-2 block`}>{material.subject}</span>
                            <h3 className="text-white font-semibold text-base mb-1 line-clamp-2">{material.title}</h3>
                            <p className="text-gray-600 text-xs mb-4">{material.gradeLevel} {material.chapter && `· ${material.chapter}`}</p>
                            <div className="flex items-center justify-between">
                                <span className={`flex items-center gap-1 text-xs ${material.audioUrl ? `text-${color}-400` : "text-gray-600"}`}>
                                    <Mic size={12} />
                                    {material.audioUrl ? "Audio ready" : "No audio yet"}
                                </span>
                                <span className="text-[10px] text-gray-600">{material.totalListens || 0} listens</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}