import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, CheckCircle, XCircle, Trophy, ArrowLeft, Headphones, Loader } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "../services/api";

export default function QuizPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const onBack = () => navigate(-1);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Speech-to-text
    const [listening, setListening] = useState(false);
    const [speechText, setSpeechText] = useState("");
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!quizId) return;
        quizzesAPI.getOne(quizId)
            .then(res => setQuiz(res.data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [quizId]);

    // Initialise Web Speech API
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in your browser. Please use Google Chrome.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = true;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(r => r[0].transcript)
                .join(" ")
                .toLowerCase()
                .trim();
            setSpeechText(transcript);

            // Try to match spoken word to one of the options
            if (event.results[event.results.length - 1].isFinal) {
                const q = quiz?.questions?.[currentQ];
                if (q) {
                    const matched = q.options.findIndex(opt =>
                        transcript.includes(opt.toLowerCase())
                    );
                    if (matched !== -1) {
                        handleSelect(matched);
                        setSpeechText(`Heard: "${transcript}" → Selected: Option ${matched + 1}`);
                    } else {
                        // Try A/B/C/D matching
                        const letterIdx = ["a", "b", "c", "d"].findIndex(l => transcript.includes(l));
                        if (letterIdx !== -1 && letterIdx < q.options.length) {
                            handleSelect(letterIdx);
                            setSpeechText(`Heard: "${transcript}" → Selected: Option ${letterIdx + 1}`);
                        } else {
                            setSpeechText(`Heard: "${transcript}" — Say the option text or 'A', 'B', 'C', or 'D'`);
                        }
                    }
                }
            }
        };

        recognition.onerror = () => setListening(false);
        recognition.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setListening(false);
    };

    const handleSelect = (optionIdx) => {
        const q = quiz?.questions?.[currentQ];
        if (!q || submitted) return;
        setAnswers(prev => ({ ...prev, [currentQ]: optionIdx }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        setSubmitting(true);
        try {
            // Build answers array as expected by backend
            const answersArray = quiz.questions.map((_, i) => ({
                questionIndex: i,
                selectedOption: answers[i] !== undefined ? answers[i] : -1,
            }));
            const res = await quizzesAPI.submitAttempt(quiz._id, { answers: answersArray });
            setResults(res.data);
            setSubmitted(true);
        } catch (e) {
            alert("Failed to submit: " + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050507] flex items-center justify-center">
            <Loader className="animate-spin text-teal-400 mr-3" />
            <p className="text-gray-400">Loading quiz...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-20">
            <XCircle size={48} className="mx-auto mb-3 text-red-400" />
            <p className="text-red-400 font-semibold">{error}</p>
            <button onClick={onBack} className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition-all">← Back</button>
        </div>
    );

    if (!quiz) return null;

    const q = quiz.questions?.[currentQ];
    const answered = answers[currentQ] !== undefined;
    const totalAnswered = Object.keys(answers).length;
    const progress = quiz.questions.length > 0 ? (currentQ / quiz.questions.length) * 100 : 0;

    // Results screen
    if (submitted && results) {
        const pct = results.percentageScore ?? 0;
        const passed = results.passed;
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <button onClick={onBack} className="flex items-center gap-2 text-teal-400 hover:text-white font-bold transition-all">
                    <ArrowLeft size={18} /> Back to Library
                </button>

                <div className={`rounded-2xl p-8 text-center border ${passed ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                    <Trophy size={64} className={`mx-auto mb-4 ${passed ? "text-yellow-400" : "text-red-400"}`} />
                    <h2 className="text-3xl font-bold mb-2">{passed ? "🎉 You Passed!" : "Better Luck Next Time"}</h2>
                    <p className="text-5xl font-bold my-4">{pct}%</p>
                    <p className="text-gray-400">{results.totalScore} / {results.maxScore} correct</p>
                    <p className={`mt-2 text-sm font-semibold ${passed ? "text-green-400" : "text-red-400"}`}>
                        {passed ? "Great job! Keep listening and learning." : "Try again after reviewing the material."}
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-lg">Question Breakdown</h3>
                    {results.detailedResults?.map((r, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${r.isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                            <div className="flex items-start gap-3">
                                {r.isCorrect
                                    ? <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                                    : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300">{r.questionText || quiz.questions[i]?.questionText}</p>
                                    {!r.isCorrect && (
                                        <p className="text-xs text-green-400 mt-1">
                                            ✓ Correct: <span className="font-semibold">{quiz.questions[i]?.options?.[r.correctAnswer]}</span>
                                        </p>
                                    )}
                                    {r.explanation && <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setResults(null); }}
                    className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold transition-all text-white"
                >
                    Retake Quiz
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <button onClick={onBack} className="flex items-center gap-2 text-teal-400 hover:text-white font-bold transition-all">
                <ArrowLeft size={18} /> Back to Library
            </button>

            <div>
                <h1 className="text-3xl font-bold">{quiz.title}</h1>
                <p className="text-gray-400 mt-1">{quiz.description}</p>
                <p className="text-sm text-indigo-400 mt-2">{quiz.questions.length} questions • {totalAnswered} answered</p>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            {/* Question */}
            {q && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
                    >
                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">{currentQ + 1}</span>
                            <p className="text-lg font-semibold leading-relaxed">{q.questionText}</p>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-3">
                            {q.options?.map((opt, idx) => {
                                const selected = answers[currentQ] === idx;
                                const letter = ["A", "B", "C", "D"][idx];
                                return (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(idx)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${selected
                                            ? "bg-indigo-500/20 border-indigo-500 text-white"
                                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:border-indigo-500/40 hover:bg-white/5"
                                            }`}
                                    >
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${selected ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-400"}`}>{letter}</span>
                                        <span className="font-medium">{opt}</span>
                                        {selected && <CheckCircle size={18} className="ml-auto text-indigo-400 shrink-0" />}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Speech answer */}
                        <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                                <Headphones size={14} /> Or speak your answer — say the option text or "A", "B", "C", "D"
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={listening ? stopListening : startListening}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${listening
                                        ? "bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse"
                                        : "bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30"
                                        }`}
                                >
                                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
                                    {listening ? "Stop" : "Speak Answer"}
                                </button>
                                {speechText && (
                                    <p className="text-xs text-gray-400 italic">{speechText}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => { setCurrentQ(q => Math.max(0, q - 1)); setSpeechText(""); }}
                    disabled={currentQ === 0}
                    className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 font-semibold transition-all disabled:opacity-30"
                >
                    ← Previous
                </button>

                <span className="text-sm text-gray-500">{currentQ + 1} / {quiz.questions.length}</span>

                {currentQ < quiz.questions.length - 1 ? (
                    <button
                        onClick={() => { setCurrentQ(q => q + 1); setSpeechText(""); }}
                        className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white font-semibold transition-all"
                    >
                        Next →
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || totalAnswered === 0}
                        className="px-5 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded-lg text-white font-bold transition-all flex items-center gap-2"
                    >
                        {submitting ? <Loader size={16} className="animate-spin" /> : <Trophy size={16} />}
                        Submit Quiz
                    </button>
                )}
            </div>

            {/* Question dots nav */}
            <div className="flex flex-wrap gap-2 justify-center">
                {quiz.questions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { setCurrentQ(i); setSpeechText(""); }}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all border ${i === currentQ
                            ? "bg-indigo-500 text-white border-indigo-500"
                            : answers[i] !== undefined
                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                : "bg-white/5 text-gray-500 border-white/10 hover:border-white/30"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
