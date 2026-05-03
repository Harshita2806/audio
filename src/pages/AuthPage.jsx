import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

import s1 from "../assets/s1.png";
import s2 from "../assets/s2.png";
import s3 from "../assets/s3.png";

const carouselData = [
    { url: s1, text: "Inclusive education for all learners", sub: "Empowering every student's journey" },
    { url: s2, text: "Learn through AI-powered audio experiences", sub: "Advanced narration for every subject" },
    { url: s3, text: "Accessible tools for a brighter future", sub: "Designed specifically for accessibility" },
];

export default function AuthPage({ defaultMode }) {
    const [isLogin, setIsLogin] = useState(defaultMode !== "signup");
    const [index, setIndex] = useState(0);
    const [role, setRole] = useState("student");

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // New state for verification info

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setIndex(prev => (prev + 1) % carouselData.length), 5000);
        return () => clearInterval(timer);
    }, []);

    // Clear alerts when switching mode
    useEffect(() => {
        setError("");
        setSuccessMessage("");
    }, [isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        try {
            if (isLogin) {
                const data = await authAPI.login({ email, password });
                if (data.success) {
                    login(data.user, data.token);
                    navigate(data.user.role === "teacher" ? "/teacher" : "/student", { replace: true });
                }
            } else {
                if (!name.trim()) { setError("Please enter your name"); setLoading(false); return; }
                const data = await authAPI.register({ name, email, password, role });

                if (data.success) {
                    // Success logic: Don't log in, show message and switch to login tab
                    setSuccessMessage(data.message || "Registration successful! Please check your email to verify your account.");
                    setName("");
                    setPassword("");
                    // Optional: auto-switch to login after a delay
                    setTimeout(() => setIsLogin(true), 4000);
                }
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-[#050505] font-['Inter'] text-white overflow-hidden flex items-center justify-center">
            <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden relative">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={isLogin ? "login-view" : "signup-view"}
                        initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 50 : -50 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`flex w-full h-full ${isLogin ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                    >
                        {/* FORM SECTION */}
                        <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto no-scrollbar">
                            <div className="w-full max-w-100">
                                <div className="flex items-center gap-2 text-[#14b8a6] font-bold text-xl mb-10 group cursor-pointer">
                                    <BookOpen size={24} className="group-hover:drop-shadow-[0_0_8px_#14b8a6]" />
                                    <span className="tracking-tighter font-['Plus_Jakarta_Sans'] uppercase text-lg">AccessLearn</span>
                                </div>

                                {/* Success message */}
                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-6"
                                    >
                                        <CheckCircle2 size={16} />
                                        {successMessage}
                                    </motion.div>
                                )}

                                {/* Error message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6"
                                        role="alert"
                                        aria-live="polite"
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {isLogin ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h1 className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-wider  mb-2 text-white drop-shadow-[0_4px_12px_rgba(20,184,166,0.2)]">
                                                    Welcome Back
                                                </h1>
                                                <p className="font-sans text-gray-400 text-base tracking-wide">Log in to continue your learning journey</p>
                                            </div>
                                            <div className="space-y-5">
                                                <InputBlock label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                                                <InputBlock label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-semibold text-base mt-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                                                    aria-label="Log in"
                                                >
                                                    {loading ? <><Loader2 size={18} className="animate-spin" /> Logging in...</> : "Log In"}
                                                </button>
                                            </div>
                                            <p className="text-center text-gray-400 text-sm mt-8">
                                                Don't have an account?{" "}
                                                <button type="button" onClick={() => setIsLogin(false)} className="text-brand-primary font-semibold hover:underline cursor-pointer ml-1">Sign up</button>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div>
                                                <h1 className="text-4xl tracking-wider font-extrabold font-['Plus_Jakarta_Sans'] mb-2 text-white drop-shadow-[0_4px_12px_rgba(20,184,166,0.2)]">
                                                    Create Account
                                                </h1>
                                                <p className="text-gray-400 text-base font-light">
                                                    Join our accessible learning platform
                                                </p>
                                            </div>
                                            <div className="space-y-4">
                                                <InputBlock label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
                                                <InputBlock label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                                                <InputBlock label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password (min 6 chars)" required />

                                                <div className="space-y-2 pt-1">
                                                    <label className="text-xs font-medium text-gray-300 ml-1">I am a</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {["student", "teacher"].map(r => (
                                                            <button
                                                                key={r}
                                                                type="button"
                                                                onClick={() => setRole(r)}
                                                                aria-pressed={role === r}
                                                                className={`py-3 rounded-xl text-sm font-medium transition-all border-2 capitalize ${role === r ? "bg-brand-input border-brand-primary text-white" : "bg-transparent border-white/10 text-gray-400 hover:border-white/20"}`}
                                                            >
                                                                {r}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-semibold text-base mt-2 hover:brightness-110 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                                                    aria-label="Create account"
                                                >
                                                    {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : "Create Account"}
                                                </button>
                                            </div>
                                            <p className="text-center text-gray-400 text-sm mt-6">
                                                Already have an account?{" "}
                                                <button type="button" onClick={() => setIsLogin(true)} className="text-brand-primary font-semibold hover:underline cursor-pointer ml-1">Log in</button>
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* CAROUSEL SECTION */}
                        <div className="hidden lg:flex w-1/2 h-full">
                            <div className="h-full w-full relative overflow-hidden bg-brand-bg">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute inset-0"
                                    >
                                        <img src={carouselData[index].url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-linear-to-t from-brand-bg via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-12 left-10 right-10">
                                            <h2 className="text-3xl font-bold mb-3 leading-tight font-welcome tracking-tight">{carouselData[index].text}</h2>
                                            <p className="text-gray-300 text-base mb-8">{carouselData[index].sub}</p>
                                            <div className="flex gap-2">
                                                {carouselData.map((_, i) => (
                                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-brand-primary" : "w-4 bg-white/30"}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function InputBlock({ label, type, placeholder, value, onChange, required }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 block ml-1">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full bg-brand-input border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-brand-primary focus:border-transparent outline-none transition-all placeholder:text-gray-600 text-white text-sm"
                aria-label={label}
            />
        </div>
    );
}