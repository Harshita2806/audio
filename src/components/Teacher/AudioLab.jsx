import React from "react";
import { motion } from "framer-motion";
import { Mic2, Play, Volume2, Waves } from "lucide-react";

export default function AudioLab() {
    return (
        <div className="min-h-screen bg-[#050507] text-white pt-32 px-10 flex flex-col items-center">
            <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-4xl md:text-5xl font-bold mb-6 text-center uppercase tracking-tight"
            >
                Audio Lab
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-emerald-300/70 text-xl italic font-light mb-16 text-center"
            >
                "Voice gives life to the silent word, reaching learners beyond the screen."
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-[#09090b] border border-emerald-500/10 rounded-[2.5rem] p-10 relative overflow-hidden"
            >
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-emerald-500/20 rounded-3xl bg-emerald-500/5">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] mb-8"
                    >
                        <Play fill="black" size={32} className="ml-1" />
                    </motion.div>
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <motion.div
                                key={i}
                                animate={{ height: [10, 30, 10] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                className="w-1.5 bg-emerald-400/40 rounded-full"
                            />
                        ))}
                    </div>
                    <span className="text-emerald-400 font-mono tracking-widest uppercase text-xs">Generating Neural Narrative...</span>
                </div>
            </motion.div>
        </div>
    );
}