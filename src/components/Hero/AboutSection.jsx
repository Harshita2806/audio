import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Globe, Users, Info } from "lucide-react";

export default function AboutSection() {

    const cardHover = {
        whileHover: {
            y: -10,
            scale: 1.03,
            transition: { duration: 0.35 }
        }
    };

    return (
        /* Global font set to Inter */
        <section className="relative w-full min-h-screen flex items-center justify-center py-16 px-6 overflow-hidden bg-[#050505] font-['Inter']">

            {/* BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">

                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {/* grid */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg,#ffffff 1px,transparent 1px)",
                        backgroundSize: "30px 30px"
                    }}
                />

                {/* glow */}
                <motion.div
                    animate={{ opacity: [0.04, 0.1, 0.04], scale: [1, 1.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[450px] bg-[#14b8a6] rounded-full blur-[160px]"
                />
            </div>


            {/* MAIN CONTAINER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto relative z-20 w-full border border-[#696969] rounded-[40px] p-6 md:p-10 backdrop-blur-4xl bg-[#0a0a0a]/40 shadow-2xl overflow-hidden"
            >

                <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-y-12 md:gap-y-8 relative">

                    {/* TOP LEFT */}
                    <motion.div
                        initial={{ opacity: 0, x: -80, y: -80 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        {...cardHover}
                        className="flex flex-col space-y-3 group"
                    >
                        {/* Heading font: Plus Jakarta Sans */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#333] bg-[#111] text-[#888] text-[9px] font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-[0.2em] w-fit group-hover:border-[#14b8a6] transition">
                            <Info size={10} className="text-[#14b8a6]" /> About Us
                        </div>

                        <h3 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight font-['Plus_Jakarta_Sans'] group-hover:text-[#14b8a6] transition">
                            Our Mission
                        </h3>

                        <p className="text-[#a4a2a2] text-lg font-light leading-7 max-w-[280px]">
                            AccessLearn is a collective of AI engineers dedicated to rewriting the rules of digital education for the visually impaired.
                        </p>
                    </motion.div>


                    {/* TOP RIGHT */}
                    <motion.div
                        initial={{ opacity: 0, x: 80, y: -80 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        {...cardHover}
                        className="flex flex-col items-end text-right space-y-3"
                    >
                        <h3 className="text-2xl md:text-4xl font-extrabold uppercase text-white font-['Plus_Jakarta_Sans']">
                            Accessible <br />
                            <span className="text-[#14b8a6] text-xl md:text-2xl font-black drop-shadow-[0_0_12px_rgba(20,184,166,0.7)]">
                                by Design.
                            </span>
                        </h3>

                        <p className="text-[#a4a2a2] text-lg font-light leading-7 max-w-[280px]">
                            Visual complexity should never be a barrier. We engineer a world where knowledge is heard and felt.
                        </p>
                    </motion.div>


                    {/* BOTTOM LEFT */}
                    <motion.div
                        initial={{ opacity: 0, x: -80, y: 80 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        {...cardHover}
                        className="flex flex-col justify-end mt-8 md:mt-16 space-y-3"
                    >
                        <h3 className="text-2xl md:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                            Inclusive <br />
                            <span className="text-[#14b8a6] text-xl md:text-2xl font-black drop-shadow-[0_0_12px_rgba(20,184,166,0.7)]">
                                by Default.
                            </span>
                        </h3>

                        <p className="text-[#a4a2a2] text-lg font-light leading-7 max-w-[280px]">
                            Rebuilding education around empathy and AI to ensure every student learns without limits.
                        </p>
                    </motion.div>


                    {/* BOTTOM RIGHT */}
                    <motion.div
                        initial={{ opacity: 0, x: 80, y: 80 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        {...cardHover}
                        className="flex flex-col justify-end items-end space-y-5"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#14b8a6]/30 bg-[#14b8a6]/10 text-[#14b8a6] text-[11px] font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-widest">
                            <Sparkles size={10} /> The Vision
                        </div>

                        <div className="flex gap-3">

                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-[#222] flex items-center gap-3 hover:border-[#14b8a6]"
                            >
                                <Globe size={16} className="text-[#14b8a6]" />
                                <span className="text-[13px] font-['Plus_Jakarta_Sans'] font-bold text-[#a3a3a3] uppercase">Global Edge</span>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-[#222] flex items-center gap-3 hover:border-[#14b8a6]"
                            >
                                <Users size={16} className="text-[#14b8a6]" />
                                <span className="text-[13px] font-['Plus_Jakarta_Sans'] font-bold text-[#a3a3a3] uppercase">12k+ Users</span>
                            </motion.div>

                        </div>
                    </motion.div>


                    {/* CENTER HUB */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">

                        {/* CROSSHAIR LINES */}
                        <div className="absolute h-[60vh] w-[1px] bg-gradient-to-b from-transparent via-[#222] to-transparent" />
                        <div className="absolute w-[60vw] h-[1px] bg-gradient-to-r from-transparent via-[#222] to-transparent" />

                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                            transition={{
                                rotate: { duration: 35, repeat: Infinity, ease: "linear" },
                                scale: { duration: 4, repeat: Infinity }
                            }}
                            className="relative bg-[#050505] border border-[#14b8a6] p-7 rounded-full shadow-[0_0_60px_rgba(20,184,166,0.25)]"
                        >
                            <Brain size={24} className="text-[#14b8a6]" />

                            <div
                                className="absolute inset-0 rounded-full border border-[#14b8a6] animate-ping"
                                style={{ animationDuration: "4s" }}
                            />
                        </motion.div>
                    </div>

                </div>

                {/* CORNER ACCENTS */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-[#4a4949] rounded-tl-2xl" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-[#4a4949] rounded-br-2xl" />

            </motion.div>
        </section>
    );
}