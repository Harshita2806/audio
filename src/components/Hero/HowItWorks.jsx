import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
    UserPlus,
    LayoutDashboard,
    Headphones,
    CheckCircle2,
    Mic,
    BarChart3
} from 'lucide-react';
import TeacherImage from '../../images/Teacher.png';
import Login from '../../images/Login.png';
import Student from '../../images/Student.png';

export default function HowItWorks() {
    const containerRef = useRef(null);

    // Tracking scroll progress for the vertical line
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const steps = [
        {
            number: "01",
            title: "Create Your Account",
            subtitle: "Getting started is simple",
            icon: <UserPlus className="text-[#14b8a6]" size={28} />,
            description: "Students and teachers can sign up in minutes to create personalized profiles with secure cloud synchronization.",
            features: [
                "Secure login & profile management",
                "Role-based access (Student/Teacher)",
                "Personalized learning preferences",
                "Saved progress & cloud sync"
            ],
            color: "from-[#14b8a6]/20",
            glow: "shadow-[#14b8a6]/25"
        },
        {
            number: "02",
            title: "Teacher Dashboard",
            subtitle: "Create Accessible Learning",
            icon: <LayoutDashboard className="text-[#14b8a6]" size={28} />,
            description: "Teachers transform traditional NCERT PDFs into fully accessible, audio-first learning experiences using our AI engine.",
            features: [
                "Automatic Math & Diagram extraction",
                "Voice-based MCQ & Quiz creation",
                "Detailed student performance analytics",
                "Audio preview before publishing"
            ],
            color: "from-[#14b8a6]/30",
            glow: "shadow-[#14b8a6]/40"
        },
        {
            number: "03",
            title: "Student Dashboard",
            subtitle: "Learn Without Barriers",
            icon: <Headphones className="text-[#14b8a6]" size={28} />,
            description: "A structured, audio-driven environment designed specifically for independent learning and voice interaction.",
            features: [
                "Adjustable Playback (0.5x – 2x)",
                "Repeat last sentence/equation",
                "Voice-based doubt asking",
                "Adaptive progress intelligence"
            ],
            color: "from-[#14b8a6]/20",
            glow: "shadow-[#14b8a6]/25"
        }
    ];

    return (
        <section ref={containerRef} className="bg-[#050505] text-white py-24 px-6 relative overflow-hidden">
            {/* Background Ambient Glows - Updated to Teal */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#14b8a6]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0d9488]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="max-w-7xl mx-auto text-center mb-8 relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold font-serif mb-6 tracking-tight">How It Works</h2>
                <p className="text-[#888] text-lg md:text-xl max-w-2xl mx-auto font-nunito font-light leading-relaxed">
                    Our platform is designed to make learning seamless, structured, and fully accessible in just three simple steps.
                </p>
            </div>

            <div className="max-w-7xl mx-auto relative">
                {/* THE STICKY PROGRESS LINE - Updated to Teal Gradient */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 -translate-x-1/2 hidden lg:block">
                    <motion.div
                        style={{ scaleY }}
                        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white via-[#14b8a6] to-[#0d9488] origin-top shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                    />
                </div>

                <div className="space-y-48">
                    {steps.map((step, index) => (
                        <div key={index} className={`relative flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>

                            {/* Step Number Bubble (Desktop) - Updated to Stealth Teal */}
                            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center z-20">
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ margin: "-100px" }}
                                    className="w-12 h-12 rounded-full bg-[#050505] border border-[#14b8a6]/40 flex items-center justify-center font-bold text-[#14b8a6] shadow-[0_0_20px_rgba(20,184,166,0.15)]"
                                >
                                    <span className="font-nunito">{step.number}</span>
                                </motion.div>
                            </div>

                            {/* Content Side */}
                            <motion.div
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: true, amount: 0.6 }}
                                className="w-full lg:w-[45%] space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-[#14b8a6]/5 border border-[#14b8a6]/10 text-[#14b8a6]">
                                            {step.icon}
                                        </div>
                                        <h4 className="text-[#14b8a6] font-black font-nunito tracking-[0.2em] text-[10px] uppercase">{step.subtitle}</h4>
                                    </div>
                                    <h3 className="text-2xl md:text-4xl font-bold font-['Plus_Jakarta_Sans'] tracking-wide">{step.title}</h3>
                                </div>

                                <p className="text-[#b5b5b5] text-lg leading-relaxed font-nunito font-light">
                                    {step.description}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {step.features.map((feat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.2 }}
                                            className="flex items-start gap-3 group"
                                        >
                                            <CheckCircle2 size={18} className="text-[#14b8a6] mt-1 shrink-0 opacity-70 group-hover:opacity-100 transition-all" />
                                            <span className="text-sm text-gray-400 font-nunito leading-tight">{feat}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Visual Grid Side - Updated Border and Glow */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "circOut" }}
                                viewport={{ once: true, amount: 0.2 }}
                                className={`w-full lg:w-[45%] aspect-[4/3] rounded-[40px] bg-gradient-to-br ${step.color} to-transparent border border-white/20 relative overflow-hidden group shadow-2xl ${step.glow}`}
                            >
                                <img
                                    src={index === 0 ? Login : index === 1 ? TeacherImage : Student}
                                    alt={step.title}
                                    className={`absolute inset-0 w-full h-full ${index === 0 ? 'object-scale-down p-8' : 'object-cover'} transition-transform duration-700 group-hover:scale-105 z-0 grayscale-[0.2] contrast-[1.1]`}
                                />

                                {/* Subtle Dark Overlay */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-700 z-10" />

                                {/* Floating UI Elements - Re-colored to Teal */}
                                {index === 1 && (
                                    <div className="absolute bottom-8 right-8 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-[#14b8a6]/20 hidden md:block animate-pulse z-20">
                                        <BarChart3 className="text-[#14b8a6]" size={24} />
                                    </div>
                                )}
                                {index === 2 && (
                                    <div className="absolute top-8 left-8 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-[#14b8a6]/20 hidden md:block animate-bounce z-20">
                                        <Mic className="text-[#14b8a6]" size={24} />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}