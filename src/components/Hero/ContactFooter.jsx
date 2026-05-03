import React from "react";
import { motion } from "framer-motion";
import {
    BookOpen, Mail, MapPin, Send, ArrowRight,
    Linkedin, Twitter, Github, Globe, ShieldCheck
} from "lucide-react";

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export function ContactSection() {
    return (
        <section id="contact" className="relative py-32 overflow-hidden bg-[#050505]">
            {/* Background Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Tech Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                {/* Gradient Orbs - Updated to Stealth Teal */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#14b8a6] opacity-5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0d9488] opacity-5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
                >
                    {/* Left Column: Info */}
                    <motion.div variants={fadeInUp} className="space-y-12">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/30 text-[#14b8a6] text-[10px] font-black font-nunito uppercase tracking-widest mb-6"
                            >
                                <Globe size={14} /> Get in Touch
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-bold font-lora text-white mb-6 leading-tight">
                                Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] to-[#14b8a6]">Connect.</span>
                            </h2>
                            <p className="text-[#888] text-lg max-w-md leading-relaxed font-nunito font-light">
                                Have questions about AI implementation or partnerships? We're engineering the future of inclusive learning.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <ContactLink
                                icon={<Mail size={20} />}
                                label="Email Us"
                                value="support@accesslearn.io"
                                href="mailto:support@accesslearn.io"
                            />
                            <ContactLink
                                icon={<MapPin size={20} />}
                                label="Location"
                                value="Global Remote Team"
                                href="#"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-4 pt-4">
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    variants={scaleIn}
                                    whileHover={{ y: -5, scale: 1.1, boxShadow: "0 10px 20px rgba(20, 184, 166, 0.2)" }}
                                    className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center text-[#555] hover:text-white hover:bg-[#14b8a6] hover:border-[#14b8a6] transition-all duration-300"
                                    href="#"
                                >
                                    <Icon size={18} />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Glassmorphic Form */}
                    <motion.div
                        variants={fadeInUp}
                        className="relative group"
                    >
                        {/* Rotating Border Effect - Teal Update */}
                        <div className="absolute -inset-1 rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 overflow-hidden">
                            <div className="absolute inset-0 animate-rotate-gradient">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#14b8a6] via-transparent to-[#ffffff]" />
                            </div>
                        </div>

                        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[40px] p-8 md:p-12 shadow-2xl border border-[#222] overflow-hidden">
                            {/* Decorative Top Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-[#14b8a6]/5 rounded-full blur-3xl" />

                            <form className="relative z-10 space-y-6 font-nunito">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Name" placeholder="John Doe" />
                                    <InputField label="Email" placeholder="john@example.com" type="email" />
                                </div>
                                <InputField label="Subject" placeholder="Institutional Inquiry" />
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#555] block mb-2 ml-1">Message</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all text-white placeholder:text-[#444] text-sm resize-none"
                                        placeholder="Tell us about your project..."
                                    />
                                </div>

                                {/* Updated Button to Stealth Teal */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative w-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm overflow-hidden group/btn shadow-lg shadow-[#14b8a6]/10"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        Send Message
                                        <Send size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </span>
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <style>{`
                @keyframes rotate-gradient {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-rotate-gradient {
                    animation: rotate-gradient 4s linear infinite;
                }
            `}</style>
        </section>
    );
}

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#050505] border-t border-[#1a1a1a] pt-24 pb-10 relative overflow-hidden font-nunito">
            {/* Background Gradient */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-[#14b8a6] opacity-5 rounded-full blur-[120px]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                    {/* Brand Section */}
                    <div className="md:col-span-5 space-y-6">
                        <motion.a
                            href="/"
                            className="flex items-center gap-2 text-white font-lora font-bold text-2xl tracking-tight"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488]">
                                <BookOpen size={20} className="text-black" />
                            </div>
                            <span>AccessLearn</span>
                        </motion.a>
                        <p className="text-[#666] max-w-sm text-sm leading-relaxed font-light">
                            Redefining the boundaries of education through neural accessibility. We make knowledge audible and universally available.
                        </p>
                        <div className="flex items-center gap-3 py-2 px-4 rounded-full bg-[#14b8a6]/5 border border-[#14b8a6]/10 w-fit">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14b8a6] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14b8a6]"></span>
                            </span>
                            <span className="text-[10px] font-black text-[#14b8a6] uppercase tracking-wider">Core Systems Online</span>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <FooterGroup title="Platform" links={["Features", "Neural Core", "API Docs", "Pricing"]} />
                        <FooterGroup title="Company" links={["About Us", "Our Mission", "Partnerships", "Careers"]} />
                        <FooterGroup title="Compliance" links={["WCAG 2.1", "Privacy", "Terms", "Accessibility"]} />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <p className="text-[#444] text-xs font-medium">
                            © {currentYear} AccessLearn. All rights reserved.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-[#555]">
                        <ShieldCheck size={16} className="text-[#14b8a6]" />
                        <span className="text-[10px] font-black uppercase tracking-wider">End-to-End Encryption Active</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// --- HELPER COMPONENTS ---

function ContactLink({ icon, label, value, href }) {
    return (
        <motion.a
            href={href}
            className="flex items-center gap-5 group font-nunito"
            whileHover={{ x: 5 }}
        >
            <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center text-[#14b8a6] group-hover:bg-[#14b8a6] group-hover:text-black transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#14b8a6]/20">
                {icon}
            </div>
            <div>
                <p className="text-[#555] text-[10px] font-black uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-[#a3a3a3] font-medium group-hover:text-[#14b8a6] transition-colors">{value}</p>
            </div>
        </motion.a>
    );
}

function FooterGroup({ title, links }) {
    return (
        <div className="space-y-6">
            <h4 className="text-white font-black text-[11px] uppercase tracking-widest">{title}</h4>
            <ul className="space-y-4">
                {links.map((link, i) => (
                    <motion.li
                        key={link}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <a href="#" className="text-[#666] hover:text-[#14b8a6] text-sm transition-colors duration-300 relative group">
                            {link}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#14b8a6] group-hover:w-full transition-all duration-300" />
                        </a>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}

function InputField({ label, placeholder, type = "text" }) {
    return (
        <div className="space-y-2 font-nunito">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#555] ml-1">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3.5 focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all text-white placeholder:text-[#444] text-sm"
            />
        </div>
    );
}