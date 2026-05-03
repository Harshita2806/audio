import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Cloud, ShieldCheck, Loader2, CheckCircle, AlertCircle, Mic, X } from "lucide-react";
import { materialsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "English", "Science", "Social Science", "Other"];
const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export default function UploadCenter() {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [form, setForm] = useState({ title: "", subject: "Mathematics", gradeLevel: "Grade 10", chapter: "", description: "" });
    const [status, setStatus] = useState("idle"); // idle | uploading | generating | success | error
    const [message, setMessage] = useState("");
    const [uploadedMaterial, setUploadedMaterial] = useState(null);

    const handleFile = (file) => {
        if (!file || file.type !== "application/pdf") {
            setMessage("Please select a PDF file.");
            setStatus("error");
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setMessage("File too large. Maximum size is 50MB.");
            setStatus("error");
            return;
        }
        setSelectedFile(file);
        if (!form.title) setForm(f => ({ ...f, title: file.name.replace(".pdf", "") }));
        setStatus("idle");
        setMessage("");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) { setMessage("Please select a PDF file first."); setStatus("error"); return; }
        if (!form.title.trim()) { setMessage("Please enter a title."); setStatus("error"); return; }

        setStatus("uploading");
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("pdf", selectedFile);
            Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));

            const data = await materialsAPI.create(formData);
            setUploadedMaterial(data.data);
            setStatus("success");
            setMessage("PDF uploaded successfully! You can now generate AI audio.");
        } catch (err) {
            setStatus("error");
            setMessage(err.message || "Upload failed. Please try again.");
        }
    };

    const handleGenerateAudio = async () => {
        if (!uploadedMaterial) return;
        setStatus("generating");
        setMessage("Generating AI narration… this may take a minute.");
        try {
            await materialsAPI.generateAudio(uploadedMaterial._id);
            setStatus("success");
            setMessage("🎉 Audio generated and material published successfully!");
        } catch (err) {
            setStatus("error");
            setMessage(err.message || "Audio generation failed.");
        }
    };

    return (
        <section className="min-h-screen py-20 px-10 flex flex-col items-center justify-center bg-[#050507]" aria-label="Upload Center">
            <div className="max-w-[900px] w-full text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold font-welcome tracking-wide text-white uppercase">Upload Center</h2>
                    <p className="text-indigo-300/80 text-xl md:text-2xl italic font-light mt-3 px-4">
                        "Transforming raw knowledge into accessible audio experiences."
                    </p>
                </motion.div>

                {/* Status message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-6 ${status === "error" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}
                        role="alert" aria-live="polite"
                    >
                        {status === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {message}
                    </motion.div>
                )}

                {/* Drop Zone */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative group mb-8"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-70 transition duration-1000" />
                    <div
                        className={`relative bg-[#0d0d12] border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-all
                            ${dragOver ? "border-indigo-400 bg-indigo-500/5" : "border-white/10 hover:border-white/20"}
                            ${selectedFile ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Drop zone for PDF upload"
                        onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} aria-label="File input" />
                        <div className="w-20 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8">
                            <Upload className="text-indigo-400" size={40} />
                        </div>
                        {selectedFile ? (
                            <>
                                <h3 className="text-xl font-semibold mb-2 text-emerald-400 flex items-center gap-2"><CheckCircle size={20} /> {selectedFile.name}</h3>
                                <p className="text-gray-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-2xl font-semibold mb-4 text-white">Drag &amp; Drop Your NCERT PDF</h3>
                                <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">Support for PDF files up to 50MB. Our AI will automatically narrate the content.</p>
                            </>
                        )}
                        <div className="flex flex-wrap justify-center gap-6 text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-4">
                            <span className="flex items-center gap-2"><FileText size={14} /> PDF only</span>
                            <span className="flex items-center gap-2"><Cloud size={14} /> Auto-processed</span>
                            <span className="flex items-center gap-2"><ShieldCheck size={14} /> Encrypted</span>
                        </div>
                    </div>
                </motion.div>

                {/* Metadata Form */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="bg-[#0d0d12] border border-white/10 rounded-[2rem] p-8 mb-6 text-left">
                    <h3 className="text-lg font-semibold text-white mb-6">Material Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Title *", key: "title", type: "text", span: "col-span-2" },
                            { label: "Chapter / Topic", key: "chapter", type: "text" },
                            { label: "Description", key: "description", type: "text" },
                        ].map(({ label, key, type, span }) => (
                            <div key={key} className={span}>
                                <label className="text-xs text-gray-400 font-medium mb-1 block">{label}</label>
                                <input
                                    type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                    aria-label={label}
                                />
                            </div>
                        ))}
                        <div>
                            <label className="text-xs text-gray-400 font-medium mb-1 block">Subject</label>
                            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none" aria-label="Subject">
                                {SUBJECTS.map(s => <option key={s} value={s} className="bg-[#0d0d12]">{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-medium mb-1 block">Grade Level</label>
                            <select value={form.gradeLevel} onChange={e => setForm(f => ({ ...f, gradeLevel: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none" aria-label="Grade level">
                                {GRADES.map(g => <option key={g} value={g} className="bg-[#0d0d12]">{g}</option>)}
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleUpload}
                        disabled={status === "uploading" || status === "generating" || !selectedFile}
                        className="flex-1 sm:flex-none px-8 py-3.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        aria-label="Upload PDF"
                    >
                        {status === "uploading" ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Upload size={18} /> Upload PDF</>}
                    </button>

                    {uploadedMaterial && (
                        <button
                            onClick={handleGenerateAudio}
                            disabled={status === "generating"}
                            className="flex-1 sm:flex-none px-8 py-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            aria-label="Generate AI audio narration"
                        >
                            {status === "generating" ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Mic size={18} /> Generate AI Audio</>}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}