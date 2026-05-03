import React from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Target, Zap, BarChart3 } from "lucide-react";

export default function AssessmentArchitect() {
    return (
        <div className="min-h-screen bg-[#050507] text-white pt-32 px-10 flex flex-col items-center">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-6 text-center uppercase tracking-tight"
            >
                Assessment Architect
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-purple-300/70 text-xl italic font-light mb-16 text-center"
            >
                "True mastery is measured not by what is taught, but by what is retained."
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {[
                    { icon: <Target />, title: "Goal Alignment", desc: "Maps questions to curriculum standards." },
                    { icon: <Zap />, title: "Adaptive Quiz", desc: "Difficulty scales based on student performance." },
                    { icon: <BarChart3 />, title: "Insight Engine", desc: "Visualizes retention and comprehension gaps." }
                ].map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="p-8 bg-[#0d0d12] border border-white/5 rounded-3xl hover:border-purple-500/30 transition-all group"
                    >
                        <div className="text-purple-400 mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                        <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}