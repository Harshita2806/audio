import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added Link for navigation
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ArrowRight,
    Sparkles,
    AlertCircle,
    Headphones,
    Waves,
    Users,
    Library,
    Heart,

} from 'lucide-react';

// Assets
import heroImage from '../images/image.png';
import probImage from '../images/image2.png';
import solImage from '../images/image3.png';
import FeatureSection from '../components/Hero/FeatureSection';
import HowItWorks from '../components/Hero/HowItWorks';
import AboutSection from '../components/Hero/AboutSection';
import IntelligentFlowSection from '../components/Hero/IntelligentFlowSection';
import { ContactSection, Footer } from '../components/Hero/ContactFooter';


// --- ANIMATION VARIANTS ---
const springTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.3 }
    }
};

const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function LandingPage() {
    return (
        <div className="bg-[#050505] - font-sans selection:bg-indigo-500/30 h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Nunito+Sans:wght@300;400;600;700;800;900&display=swap');
                
                .font-lora { font-family: 'Lora', serif; }
                .font-nunito { font-family: 'Nunito Sans', sans-serif; }
                
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .gradient-text-teal {
                    background: linear-gradient(135deg, #ffffff 45%, #14b8a6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .btn-stealth-teal {
                    background: linear-gradient(145deg, #0d9488 0%, #14b8a6 100%);
                    box-shadow: 0 4px 15px rgba(20, 184, 166, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                
                .btn-stealth-teal:hover {
                    filter: brightness(1.1);
                    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.3);
                }
            `}</style>
            <Header />

            <div className="snap-start"><HeroSection /></div>
            <ProblemSolution />
            <ImpactSlides />

            {/* Added ID for Features navigation */}
            <div id="features" className="snap-start">
                <FeatureSection />
            </div>

            {/* Added ID for How It Works navigation */}
            <div id="how-it-works" className="snap-start">
                <HowItWorks />
            </div>

            <div className="snap-start">
                <IntelligentFlowSection />
            </div>

            {/* Added ID for About navigation */}
            <div id="about" className="snap-start">
                <AboutSection />
            </div>

            {/* Added ID for Contact navigation */}
            <div id="contact" className="snap-start">
                <ContactSection />
                <Footer />
            </div>

        </div>
    );
}



// --- HEADER ---
function Header() {
    const [isOpen, setIsOpen] = useState(false);

    // Updated navLinks to include both section slugs and explicit paths
    const navLinks = [
        { name: "About", slug: "about" },
        { name: "Features", slug: "features" },
        { name: "How It Works", slug: "how-it-works" },
        { name: "Contact", slug: "contact" },

    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-lg border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-white font-lora font-bold text-2xl tracking-tight">
                    <div className="p-1 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488]">
                        <BookOpen size={20} className="text-black" />
                    </div>
                    <span>AccessLearn</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => {
                        // If link has a 'path', use React Router Link
                        if (link.path) {
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                                >
                                    {link.name}
                                </Link>
                            );
                        }
                        // Otherwise use anchor tag for section scrolling
                        return (
                            <a
                                key={link.name}
                                href={`#${link.slug}`}
                                className="text-[#888888] hover:text-[#14b8a6] transition-colors text-sm font-semibold tracking-wide"
                            >
                                {link.name}
                            </a>
                        );
                    })}
                </nav>

                {/* Single Login Button */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/auth"
                        className="bg-brand-primary px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all text-white"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}


function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">

            {/* Subtle Stealth Ambient Light */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-[#14b8a6]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >

                    <motion.div
                        variants={badgeVariants}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-[#14b8a6] text-[10px] font-black uppercase tracking-widest mb-8"
                    >
                        <Sparkles size={12} /> AI MATH NARRATION
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="text-6xl lg:text-7xl font-bold font-lora leading-[1.1] mb-8 tracking-tight"
                    >
                        Accessible <span className="italic font-normal">Learning</span>, <br />

                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="gradient-text-teal font-nunito font-extrabold uppercase tracking-tighter"
                        >
                            Powered by AI
                        </motion.span>

                    </motion.h1>

                    <motion.p
                        variants={wordVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8 }}
                        className="text-[#a3a3a3] text-lg mb-10 max-w-md font-nunito font-light leading-relaxed"
                    >
                        Breaking digital barriers for visually impaired students with surgical precision in audio delivery.
                    </motion.p>

                    <motion.div
                        variants={wordVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 1 }}
                    >

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 0 30px rgba(20,184,166,0.35)"
                            }}
                            whileTap={{ scale: 0.96 }}
                            className="btn-stealth-teal text-white px-10 py-4 rounded-xl font-bold text-base flex items-center gap-3 group transition-all font-nunito"
                        >
                            Start Learning

                            <ArrowRight
                                size={20}
                                className="group-hover:translate-x-1 transition-transform"
                            />

                        </motion.button>

                    </motion.div>

                </motion.div>


                {/* IMAGE SECTION */}

                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    className="relative hidden lg:block"
                >

                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        whileHover={{
                            scale: 1.03,
                            boxShadow: "0 30px 80px rgba(20,184,166,0.25)"
                        }}
                        className="relative rounded-[32px] border border-transparent overflow-hidden bg-[#0a0a0a] shadow-2xl shadow-black transition-all duration-500"
                    >

                        <motion.img
                            src={heroImage}
                            alt="App Interface"
                            className="w-full h-full object-cover inline"
                        />

                        {/* subtle glow on hover */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            className="absolute inset-0 bg-linear-to-tr from-brand-primary/10 to-transparent pointer-events-none"
                        />

                    </motion.div>

                </motion.div>

            </div>
        </section>
    );
}






function ProblemSolution() {

    const rowVariants = {
        hiddenLeft: { opacity: 0, x: -60 },
        hiddenRight: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <>

            {/* PROBLEM SECTION */}

            <section className="snap-start h-screen w-full flex flex-col items-center justify-center bg-[#050505] px-6">

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mb-14 text-center"
                >

                    <h2 className="text-4xl md:text-6xl font-[Playfair_Display] font-semibold tracking-tight text-white">

                        Inclusive

                        <span className="text-[#14b8a6] italic font-light ml-2">
                            By Design
                        </span>

                    </h2>

                    <p className="text-[#7a7a7a] font-inter text-sm mt-3 tracking-wide">
                        Accessibility is not a feature — it is the foundation.
                    </p>

                </motion.div>


                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 h-[60vh]">

                    {/* LEFT CARD */}

                    <motion.div
                        variants={rowVariants}
                        initial="hiddenLeft"
                        whileInView="visible"
                        transition={springTransition}
                        className="bg-[#0f0f0f] border border-[#222] p-12 rounded-[32px] flex flex-col justify-center"
                    >

                        <AlertCircle className="text-[#999898] mb-6" size={40} />

                        <h3 className="text-xs font-black text-[#14b8a6] uppercase tracking-[0.35em] mb-5 font-nunito">

                            The Barrier

                        </h3>

                        <h2 className="text-4xl md:text-5xl font-[Playfair_Display] font-semibold italic tracking-tight mb-6 text-white">

                            E-learning is 90% visual.

                        </h2>

                        <p className="text-[#a3a3a3] text-lg font-inter font-light leading-relaxed max-w-md">

                            Without sight, students encounter digital barriers that make modern
                            learning platforms difficult to navigate and understand.

                        </p>

                    </motion.div>


                    {/* RIGHT IMAGE */}

                    <motion.div
                        variants={rowVariants}
                        initial="hiddenRight"
                        whileInView="visible"
                        transition={springTransition}
                        className="relative rounded-[32px] overflow-hidden border border-[#222]"
                    >

                        <img
                            src={probImage}
                            className="absolute inset-0 w-full h-full object-cover grayscale opacity-40"
                            alt="Problem Illustration"
                        />

                        {/* overlay gradient */}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

                        {/* overlay text */}

                        <div className="absolute bottom-10 left-10">

                            <h3 className="text-xl font-[Playfair_Display] text-white mb-2">

                                Learning should never depend on sight.

                            </h3>

                            <p className="text-sm text-[#a3a3a3] font-inter max-w-xs">

                                Millions of students face barriers when education relies only
                                on visual information.

                            </p>

                        </div>

                    </motion.div>

                </div>

            </section>


            {/* SOLUTION SECTION */}

            <section className="snap-start h-screen w-full flex items-center justify-center bg-[#050505] px-6">

                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 h-[60vh]">


                    {/* IMAGE */}

                    <motion.div
                        variants={rowVariants}
                        initial="hiddenLeft"
                        whileInView="visible"
                        transition={springTransition}
                        className="relative rounded-[32px] overflow-hidden border border-[#14b8a6]/20"
                    >

                        <img
                            src={solImage}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Solution Illustration"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />

                        {/* overlay text */}

                        <div className="absolute bottom-10 left-10">

                            <h3 className="text-xl font-[Playfair_Display] text-white mb-2">

                                AI transforms visuals into sound.

                            </h3>

                            <p className="text-sm text-[#cfcfcf] font-inter max-w-xs">

                                Complex diagrams, charts, and equations become immersive
                                audio experiences.

                            </p>

                        </div>

                    </motion.div>


                    {/* RIGHT CARD */}

                    <motion.div
                        variants={rowVariants}
                        initial="hiddenRight"
                        whileInView="visible"
                        transition={springTransition}
                        className="bg-[#0f0f0f] border border-[#14b8a6]/20 p-12 rounded-[32px] flex flex-col justify-center"
                    >

                        <Headphones className="text-[#14b8a6] mb-6" size={40} />

                        <h3 className="text-xs font-black text-[#14b8a6] uppercase tracking-[0.35em] mb-4 font-nunito">

                            The Bridge

                        </h3>

                        <h2 className="text-4xl md:text-5xl font-[Playfair_Display] font-semibold tracking-tight mb-8 text-white">

                            AI-Synthesized Reality

                        </h2>

                        <p className="text-[#a3a3a3] text-lg font-inter font-light leading-relaxed mb-10">

                            Our AI converts diagrams, charts, and mathematical expressions
                            into spatial audio environments that students can explore.

                        </p>

                        <div className="flex gap-4 font-nunito">

                            <span className="flex items-center gap-2 text-[10px] font-black bg-white/5 border border-white/10 px-4 py-2 rounded-lg uppercase tracking-widest">

                                <Waves size={14} className="text-[#14b8a6]" />
                                SONIC SYNC

                            </span>

                            <span className="flex items-center gap-2 text-[10px] font-black bg-[#14b8a6] text-black px-4 py-2 rounded-lg uppercase tracking-widest">

                                <Sparkles size={14} />
                                AI NARRATOR

                            </span>

                        </div>

                    </motion.div>

                </div>

            </section>

        </>
    );
}
function ImpactSlides() {
    const slides = [
        { icon: <Users size={40} />, title: "10,000+ Learners", sub: "Breaking digital borders." },
        { icon: <Library size={40} />, title: "500+ Courses", sub: "Fully narrated by AI." },
        { icon: <Heart size={40} />, title: "98% Satisfaction", sub: "Accessibility at the core." }
    ];

    return (
        <>
            {slides.map((slide, index) => (
                <section
                    key={index}
                    className="snap-start h-screen w-full flex flex-col items-center justify-center bg-[#050505] px-6 relative overflow-hidden"
                >

                    {/* BACKGROUND GLOW */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.12),transparent_60%)] pointer-events-none" />

                    {/* FLOATING BLUR ORBS */}
                    <motion.div
                        animate={{ y: [0, -40, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-20 w-72 h-72 bg-[#14b8a6]/20 blur-[120px] rounded-full"
                    />

                    <motion.div
                        animate={{ y: [0, 40, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 right-20 w-72 h-72 bg-[#14b8a6]/20 blur-[120px] rounded-full"
                    />

                    {/* SNAP LINE */}
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "180px" }}
                        viewport={{ once: false, amount: 0.6 }}
                        transition={{ duration: 0.9 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#14b8a6] to-transparent"
                    />

                    {/* CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.6 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl relative z-10"
                    >

                        {/* ICON */}
                        <motion.div
                            animate={{
                                scale: [1, 1.08, 1],
                                filter: [
                                    "drop-shadow(0 0 0px rgba(20,184,166,0))",
                                    "drop-shadow(0 0 25px rgba(20,184,166,0.8))",
                                    "drop-shadow(0 0 0px rgba(20,184,166,0))"
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-[#14b8a6] flex justify-center mb-8"
                        >
                            {slide.icon}
                        </motion.div>

                        {/* TITLE */}
                        <h2 className="text-5xl md:text-7xl font-serif gradient-text-teal font-bold mb-6 tracking-tight drop-shadow-[0_5px_15px_rgba(20,184,166,0.35)]">
                            {slide.title}
                        </h2>

                        {/* SUBTEXT */}
                        <p className="text-[#737373] text-lg md:text-xl font-inter font-light uppercase tracking-[0.4em] drop-shadow-md">
                            {slide.sub}
                        </p>

                        {/* BOTTOM LINE */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: false, amount: 0.6 }}
                            transition={{ duration: 0.9 }}
                            className="origin-center w-40 h-px bg-[#14b8a6]/60 mx-auto mt-12"
                        />

                    </motion.div>

                </section>
            ))}
        </>
    );
}


