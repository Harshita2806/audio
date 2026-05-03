import React from "react";
import { motion } from "framer-motion";
import { Mic, Info } from "lucide-react";

export default function VoiceDoubts() {
    return (
        <div className="pt-24 px-10 flex flex-col items-center justify-center h-[70vh]">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
            >
                <h2 className="text-5xl font-bold font-serif mb-6 text-white">Something unclear?</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-16 italic">
                    "Speak your question naturally. Our AI tutor will explain it using a simplified analogy."
                </p>

                {/* Pulsing Mic Button */}
                <div className="relative group cursor-pointer">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl"
                    />
                    <div className="relative w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-transform group-hover:scale-110">
                        <Mic size={48} className="text-black" />
                    </div>
                </div>

                <div className="mt-20 flex items-center gap-3 text-gray-500 justify-center">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Hold to speak to your tutor</span>
                </div>
            </motion.div>
        </div>
    );
}