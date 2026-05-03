import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, TrendingUp, BookOpen, Clock, CheckCircle, Loader2 } from "lucide-react";
import { progressAPI } from "../../services/api";

export default function MasteryMap() {
    const [summary, setSummary] = useState(null);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [summaryData, progressData] = await Promise.all([
                    progressAPI.getSummary(),
                    progressAPI.getAll(),
                ]);
                setSummary(summaryData.data);
                setProgress(progressData.data || []);
            } catch (err) {
                setError("Failed to load progress data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-32 gap-3 text-gray-500">
            <Loader2 size={24} className="animate-spin" /><span>Loading your mastery map…</span>
        </div>
    );

    if (error) return (
        <div className="text-center py-32 text-red-400">{error}</div>
    );

    const stats = summary ? [
        { label: "Streak", value: `${summary.streak}d`, icon: <TrendingUp size={22} />, color: "indigo" },
        { label: "Chapters Done", value: summary.completed, icon: <CheckCircle size={22} />, color: "emerald" },
        { label: "Listened", value: `${summary.totalListenedMinutes}m`, icon: <Clock size={22} />, color: "purple" },
        { label: "Avg. Progress", value: `${summary.avgCompletion}%`, icon: <BarChart size={22} />, color: "indigo" },
    ] : [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-6 md:px-10 max-w-5xl mx-auto pb-12">
            <h2 className="text-3xl font-bold text-white mb-8 font-serif">Mastery Map</h2>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className={`bg-[#09090b] border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center group hover:border-${s.color}-500/30 transition-all`}
                    >
                        <div className={`text-${s.color}-400 mb-2`}>{s.icon}</div>
                        <div className="text-2xl font-black text-white">{s.value}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Recent progress */}
            <div className="bg-[#09090b] border border-white/10 rounded-[2rem] p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-400" /> Recent Activity
                </h3>
                {progress.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-8">Start listening to materials to track your progress here.</p>
                ) : (
                    <div className="space-y-4">
                        {progress.slice(0, 8).map((p, i) => (
                            <div key={p._id} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen size={18} className="text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{p.material?.title || "Unknown"}</p>
                                    <p className="text-gray-600 text-xs">{p.material?.subject} · Last: {new Date(p.lastAccessedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <div className="w-24 h-1.5 bg-white/10 rounded-full">
                                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${p.percentComplete}%` }} />
                                    </div>
                                    <span className="text-[10px] text-gray-600">{p.percentComplete}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}