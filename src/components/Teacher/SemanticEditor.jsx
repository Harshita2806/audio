import React from "react";
import { motion } from "framer-motion";
import { AlignLeft, Sparkles, Wand2, Layers } from "lucide-react";

export default function SemanticEditor() {
    return (
        <div className="min-h-screen bg-[#050507] text-white pt-24 px-10 flex flex-col items-center">
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-bold mb-6 text-center uppercase tracking-tight"
            >
                Semantic Editor
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-indigo-300/70 text-xl italic font-light mb-4 text-center"
            >
                "Structure is the skeleton upon which the body of knowledge rests."
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-5xl bg-[#09090b] border-2 border-white/30 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-6 opacity-20"><Wand2 size={80} /></div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 md:col-span-4 space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                            <Layers size={18} className="text-indigo-400" />
                            <span className="text-sm font-medium">Smart Structuring</span>
                        </div>
                        <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-3 text-indigo-300">
                            <Sparkles size={18} />
                            <span className="text-sm font-medium">AI Content Refiner</span>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-8 bg-black/40 rounded-2xl border border-white/5 p-6 h-[400px] flex items-center justify-center text-gray-500 italic">
                        <div className="text-center">
                            <AlignLeft className="mx-auto mb-4 opacity-20" size={48} />
                            <p>Your parsed content will appear here for semantic refinement...</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}