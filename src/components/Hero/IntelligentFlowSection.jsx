import React from "react";
import { motion } from "framer-motion";
import {
    FileUp,
    Search,
    Volume2,
} from "lucide-react";

export default function IntelligentFlowSection() {
    return (
        <section className="relative py-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(85,70,161,0.1),transparent_70%)]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                {/* --- LEARNING FLOW HEADER --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                    className="text-center mb-16 relative"
                >
                    {/* Animated Heading */}
                    <motion.h2 className="text-3xl font-serif md:text-5xl font-bold  tracking-tight bg-linear-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent shimmer-text">
                        {"The Learning Flow".split("").map((char, index) => (
                            <motion.span
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 40 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 1, ease: "easeOut" }
                                    }
                                }}
                                className="inline-block"
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </motion.h2>

                    {/* Animated Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-gray-300 max-w-2xl mx-auto text-lg font-light font-serif tracking-wide mt-6"
                    >
                        Bridging the gap between content and accessibility in three seamless steps.
                    </motion.p>

                    {/* Soft Glow */}
                    <div className="absolute inset-0 flex justify-center -z-10">
                        <div className="w-[500px] h-[200px] bg-brand-primary/10 blur-[120px] rounded-full animate-pulse" />
                    </div>

                    {/* Shimmer Animation */}
                    <style>{`
        .shimmer-text {
            background-size: 200% auto;
            animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
        }
    `}</style>
                </motion.div>

                {/* Diagram Container */}
                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4">

                    {/* --- STEP 1 --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex-1 relative z-10"
                    >
                        <div className=" rounded-3xl p-8 text-center transition-all duration-500 group hover:border-brand-primary hover:shadow-[0_0_40px_rgba(85,70,161,0.5)] hover:-translate-y-2">

                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-primary/30 flex items-center justify-center text-brand-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(85,70,161,0.7)]">
                                <FileUp size={34} />
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-3">
                                Upload Content
                            </h3>

                            <p className="text-gray-200 text-sm leading-relaxed">
                                Teachers upload PDFs, documents, and complex diagrams to the secure platform.
                            </p>
                        </div>
                    </motion.div>

                    {/* --- CONNECTOR 1 --- */}
                    <div className="hidden lg:flex items-center justify-center w-32 relative">
                        <svg width="100%" height="100" className="overflow-visible">
                            <motion.path
                                d="M 0 50 L 128 50"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="2"
                                fill="none"
                            />
                            <motion.path
                                d="M 0 50 L 128 50"
                                stroke="#5546A1"
                                strokeWidth="2"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                viewport={{ once: true }}
                            />
                        </svg>
                        <motion.div
                            className="absolute w-3 h-3 bg-brand-primary rounded-full shadow-lg shadow-brand-primary/50"
                            initial={{ x: 0 }}
                            whileInView={{ x: 128 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "linear",
                                delay: 1,
                            }}
                            viewport={{ once: true }}
                        />
                    </div>

                    {/* --- STEP 2 (CORE) --- */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="flex-1 relative z-20"
                    >
                        <div className="relative bg-brand-card  p-1 rounded-[32px]">
                            <div className="bg-brand-bg rounded-[30px] p-10 text-center relative overflow-hidden group transition-all duration-500 hover:shadow-[0_0_60px_rgba(85,70,161,0.6)]">

                                <div className="absolute inset-0 bg-brand-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-primary flex items-center justify-center shadow-xl shadow-brand-primary/30 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(85,70,161,0.8)]">
                                        <Search size={42} className="text-white" />
                                    </div>

                                    <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">
                                        AI Processing
                                    </h3>

                                    <p className="text-gray-200 text-sm leading-relaxed max-w-xs mx-auto">
                                        Neural networks interpret structure, math, and visuals instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* --- CONNECTOR 2 --- */}
                    <div className="hidden lg:flex items-center justify-center w-32 relative">
                        <svg width="100%" height="100" className="overflow-visible">
                            <motion.path
                                d="M 0 50 L 128 50"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="2"
                                fill="none"
                            />
                            <motion.path
                                d="M 0 50 L 128 50"
                                stroke="#5546A1"
                                strokeWidth="2"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.8 }}
                                viewport={{ once: true }}
                            />
                        </svg>
                        <motion.div
                            className="absolute w-3 h-3 bg-brand-primary rounded-full shadow-lg shadow-brand-primary/50"
                            initial={{ x: 0 }}
                            whileInView={{ x: 128 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "linear",
                                delay: 1.8,
                            }}
                            viewport={{ once: true }}
                        />
                    </div>

                    {/* --- STEP 3 --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        className="flex-1 relative z-10"
                    >
                        <div className=" border-brand-border rounded-3xl p-8 text-center transition-all duration-500 group hover:border-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-2">

                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-200/30 flex items-center justify-center text-emerald-400 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.7)]">
                                <Volume2 size={34} />
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-3">
                                Accessible Learning
                            </h3>

                            <p className="text-gray-200 text-sm leading-relaxed">
                                Students receive high-quality narration and structured audio instantly.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}