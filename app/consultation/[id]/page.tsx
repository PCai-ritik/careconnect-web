"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    PanelRightClose, PanelRightOpen,
    MessageSquare, FileText, Send, Copy, Users,
    Clipboard, FilePlus,
} from "lucide-react";
import PatientProfileSheet from "@/components/dashboard/PatientProfileSheet";
import NewPrescriptionSheet from "@/components/dashboard/NewPrescriptionSheet";

/* ── Timer ───────────────────────────────────────────────────────────── */

function useCallTimer() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, []);
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
}

/* ── Mock chat ───────────────────────────────────────────────────────── */

const MOCK_CHAT = [
    { id: 1, sender: "patient", name: "Sarah Jenkins", text: "Hello Doctor, I'm joining now.", time: "10:02 AM" },
    { id: 2, sender: "doctor", name: "Dr. Rohan Mehta", text: "Good morning Sarah! How are you feeling today?", time: "10:03 AM" },
    { id: 3, sender: "patient", name: "Sarah Jenkins", text: "I've been having headaches on the left side, mostly in the mornings.", time: "10:04 AM" },
];

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ConsultationRoom({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const timer = useCallTimer();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");
    const [isChartOpen, setIsChartOpen] = useState(false);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [chatMsg, setChatMsg] = useState("");
    const [chat, setChat] = useState(MOCK_CHAT);
    const [copied, setCopied] = useState(false);

    const mockPatient = { id, name: "Sarah Jenkins", condition: "Hypertension" };

    const copyId = () => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendMessage = () => {
        if (!chatMsg.trim()) return;
        setChat((prev) => [
            ...prev,
            {
                id: Date.now(), sender: "doctor", name: "Dr. Rohan Mehta",
                text: chatMsg.trim(),
                time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            },
        ]);
        setChatMsg("");
    };

    return (
        <>
            <div className="h-screen w-screen bg-slate-950 flex overflow-hidden font-sans">

                {/* ════════════════ LEFT: Video Feed ════════════════ */}
                <div className="flex-1 relative flex flex-col transition-all duration-300 p-4">
                    <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col items-center justify-center">

                        {/* ── Top-left: Timer ── */}
                        <div className="absolute top-5 left-5 flex items-center gap-3 z-10">
                            <div className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md border border-red-500/20">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="font-mono font-medium">{timer}</span>
                            </div>
                            <div className="bg-slate-800/60 text-slate-300 text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50 flex items-center gap-1.5">
                                <Users size={11} />
                                2 participants
                            </div>
                        </div>

                        {/* ── Top-right: Room ID ── */}
                        <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
                            <button
                                onClick={copyId}
                                className="text-slate-300 text-xs bg-slate-800/60 px-3 py-1.5 rounded-lg backdrop-blur-md border border-slate-700/50 flex items-center gap-1.5 hover:bg-slate-700/70 transition-colors cursor-pointer"
                            >
                                <span className="font-mono">Room: {id}</span>
                                <Copy size={11} />
                            </button>
                            <AnimatePresence>
                                {copied && (
                                    <motion.span
                                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="text-green-400 text-xs"
                                    >
                                        Copied!
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Patient Feed Placeholder ── */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-2 border-blue-500/30 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-12 h-12 text-slate-400" fill="currentColor">
                                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                            </div>
                            <p className="text-slate-300 font-medium mt-5 text-sm">Waiting for patient to join...</p>
                            <p className="text-slate-500 text-xs mt-1">Sarah Jenkins has been notified</p>
                        </div>

                        {/* ── Doctor PiP ── */}
                        <motion.div
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            className="absolute bottom-6 right-6 w-48 h-32 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden cursor-move z-10"
                        >
                            <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-b from-slate-700 to-slate-800">
                                {isVideoOff ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <VideoOff size={20} className="text-slate-500" />
                                        <span className="text-slate-500 text-[10px]">Camera off</span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-white/60">RM</span>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-slate-300 text-[10px] text-center py-1">
                                    Dr. Rohan Mehta (You)
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Control Bar ── */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-2.5 rounded-2xl flex items-center gap-3 shadow-2xl z-50">

                            {/* Mic */}
                            <button
                                onClick={() => setIsMuted((v) => !v)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isMuted ? "bg-red-500/20 text-red-400" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            {/* Camera */}
                            <button
                                onClick={() => setIsVideoOff((v) => !v)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isVideoOff ? "bg-red-500/20 text-red-400" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
                                title={isVideoOff ? "Start Camera" : "Stop Camera"}
                            >
                                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                            </button>

                            <div className="w-px h-8 bg-slate-700" />

                            {/* Patient Chart */}
                            <button
                                onClick={() => setIsChartOpen(true)}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer bg-slate-700 hover:bg-slate-600 text-white"
                                title="Patient Chart"
                            >
                                <Clipboard size={20} />
                            </button>

                            {/* Prescribe */}
                            <button
                                onClick={() => setIsPrescriptionOpen(true)}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer bg-slate-700 hover:bg-slate-600 text-white"
                                title="New Prescription"
                            >
                                <FilePlus size={20} />
                            </button>

                            {/* Toggle Clinical Panel */}
                            <button
                                onClick={() => setIsPanelOpen((v) => !v)}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer bg-slate-700 hover:bg-slate-600 text-white"
                                title={isPanelOpen ? "Close Panel" : "Open Panel"}
                            >
                                {isPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                            </button>

                            <div className="w-px h-8 bg-slate-700" />

                            {/* End Call */}
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="px-6 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <PhoneOff size={18} />
                                End Call
                            </button>
                        </div>
                    </div>
                </div>

                {/* ════════════════ RIGHT: Clinical Panel (slide-out) ════════════════ */}
                <AnimatePresence>
                    {isPanelOpen && (
                        <motion.div
                            key="clinical-panel"
                            initial={{ width: 0, opacity: 0, x: 50 }}
                            animate={{ width: 400, opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: 50 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="h-full bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden"
                        >
                            {/* Tab Bar */}
                            <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50/50 shrink-0">
                                {[
                                    { id: "notes" as const, label: "Clinical Notes", Icon: FileText },
                                    { id: "chat" as const, label: "Chat", Icon: MessageSquare },
                                ].map(({ id: tabId, label, Icon }) => (
                                    <button
                                        key={tabId}
                                        onClick={() => setActiveTab(tabId)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tabId
                                                ? "bg-white shadow-sm text-[#4F46E5]"
                                                : "text-gray-500 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Notes Panel */}
                            {activeTab === "notes" && (
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    {/* Patient context */}
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Sarah Jenkins</p>
                                                <p className="text-xs text-gray-400 mt-0.5">28 yrs • Hypertension • Video Consultation</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-semibold">
                                                SJ
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick tags */}
                                    <div className="px-4 py-2.5 border-b border-gray-100 flex gap-2 flex-wrap shrink-0">
                                        {["Headache", "BP Elevated", "Follow-up"].map((tag) => (
                                            <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                                        ))}
                                        <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-full border border-dashed border-gray-300 cursor-pointer">
                                            + tag
                                        </button>
                                    </div>

                                    {/* Textarea */}
                                    <textarea
                                        className="flex-1 w-full resize-none focus:outline-none text-gray-700 p-4 text-sm placeholder-gray-400"
                                        placeholder="Type consultation notes here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />

                                    {/* Save */}
                                    <div className="p-3 border-t border-gray-100 shrink-0">
                                        <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                                            <FileText size={14} />
                                            Save Note
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Chat Panel */}
                            {activeTab === "chat" && (
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {chat.map((msg) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.sender === "doctor" ? "items-end" : "items-start"}`}>
                                                <span className="text-[10px] text-gray-400 mb-1">{msg.name} · {msg.time}</span>
                                                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${msg.sender === "doctor"
                                                        ? "bg-[#4F46E5] text-white rounded-br-sm"
                                                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-gray-100 shrink-0">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
                                            <input
                                                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                                                placeholder="Type a message..."
                                                value={chatMsg}
                                                onChange={(e) => setChatMsg(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                            />
                                            <button onClick={sendMessage} className="p-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg cursor-pointer">
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Overlay Sheets ── */}
            <PatientProfileSheet
                patient={mockPatient}
                isOpen={isChartOpen}
                onClose={() => setIsChartOpen(false)}
                onNewPrescription={() => { setIsChartOpen(false); setIsPrescriptionOpen(true); }}
            />
            <NewPrescriptionSheet
                isOpen={isPrescriptionOpen}
                onClose={() => setIsPrescriptionOpen(false)}
            />
        </>
    );
}
