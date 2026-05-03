import React from "react";
import { motion } from "framer-motion";
import { Compass, GitBranch, LayoutGrid, ListTree } from "lucide-react";

export default function CurriculumCommander() {
    return (
        <div className="min-h-screen bg-[#050507] text-white pt-24 px-10 flex flex-col items-center">
            {/* --- HEADING --- */}
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold mb-4 text-center uppercase tracking-tight font-serif"
            >
                Curriculum Commander
            </motion.h2>

            {/* --- QUOTE --- */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-amber-300/70 text-xl md:text-2xl italic font-light mb-4 text-center max-w-2xl"
            >
                "A master architect does not just build rooms; they design the journey between them."
            </motion.p>

            {/* --- MAIN CONTENT AREA --- */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full max-w-6xl relative group"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000" />

                <div className="relative bg-[#09090b] border border-white/25 rounded-[2.5rem] p-8 md:p-12 overflow-hidden h-120">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Control Panel */}
                        <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                            {[
                                { icon: <ListTree />, label: "Module Hierarchy" },
                                { icon: <GitBranch />, label: "Learning Paths" },
                                { icon: <LayoutGrid />, label: "Course Mapping" }
                            ].map((item, i) => (
                                <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer group/item">
                                    <div className="text-amber-400 group-hover/item:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-semibold tracking-wide uppercase">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Visual Canvas Placeholder */}
                        <div className="col-span-12 md:col-span-8 bg-black/40 rounded-[2rem] border border-white/5 p-12 flex flex-col items-center justify-center min-h-[400px]">
                            <Compass size={64} className="text-amber-500/20 mb-6 animate-pulse" />
                            <p className="text-gray-500 text-center italic max-w-xs">
                                Drag and drop modules to reorder your curriculum flow. AI will suggest optimal pacing.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}