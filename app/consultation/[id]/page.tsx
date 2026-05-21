"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    PanelRightClose, PanelRightOpen,
    FileText, Copy, Users,
    Clipboard, FilePlus, X, Clock,
    Check, Loader2,
} from "lucide-react";
import {
    LiveKitRoom,
    VideoTrack,
    useLocalParticipant,
    RoomAudioRenderer,
    useRemoteParticipants,
    useTracks,
} from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import { startVideoSession, getJoinToken, getAppointment, getPatients, createDoctorNote, getDoctorNotes, type PatientResponse, type AppointmentResponse, type DoctorNoteResponse } from "@/lib/dashboard";

import PatientProfileSheet from "@/components/dashboard/PatientProfileSheet";
import NewPrescriptionSheet from "@/components/dashboard/NewPrescriptionSheet";
import type { PrescriptionPatient } from "@/components/dashboard/NewPrescriptionSheet";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

/* ── Timer ───────────────────────────────────────────────────────────── */

function useCallTimer() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, []);
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return { formatted: `${m}:${s}`, seconds };
}


/* ── Page ────────────────────────────────────────────────────────────── */

export default function ConsultationRoom({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { formatted: timer, seconds: elapsedSeconds } = useCallTimer();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isChartOpen, setIsChartOpen] = useState(false);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [savedNotes, setSavedNotes] = useState<DoctorNoteResponse[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveToast, setSaveToast] = useState(false);
    const [copied, setCopied] = useState(false);
    const [durationNotifShown, setDurationNotifShown] = useState(false);
    const [showDurationNotif, setShowDurationNotif] = useState(false);
    const patientJoinedRef = useRef(false);

    // ── Patient data (real) ──
    const [patient, setPatient] = useState<PatientResponse | null>(null);
    const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);

    // ── LiveKit state ──
    const [joinToken, setJoinToken] = useState<string | null>(null);
    const [roomName, setRoomName] = useState<string | null>(null);
    const [lkError, setLkError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function connect() {
            try {
                // Doctor starts the session
                const session = await startVideoSession(id);
                if (!cancelled) {
                    setJoinToken(session.join_token);
                    setRoomName(session.room_name);
                }
            } catch (err: any) {
                // Check the custom .status property we added in api.ts
                if (err?.status === 409) {
                    try {
                        const join = await getJoinToken(id);
                        if (!cancelled) {
                            setJoinToken(join.join_token);
                            setRoomName(join.room_name);
                        }
                    } catch (e2: any) {
                        if (!cancelled) setLkError(e2.message);
                    }
                } else {
                    if (!cancelled) setLkError(err.message);
                }
            }
        }
        connect();
        return () => { cancelled = true; };
    }, [id]);

    // ── Fetch real patient from appointment ──
    useEffect(() => {
        let cancelled = false;
        async function loadPatient() {
            try {
                const [appt, pts] = await Promise.all([
                    getAppointment(id),
                    getPatients(),
                ]);
                if (!cancelled) {
                    setAppointment(appt);
                    const found = pts.find(p => p.id === appt.patient_id);
                    if (found) setPatient(found);
                }
            } catch (e) {
                console.error('Failed to load patient for consultation:', e);
            }
        }
        loadPatient();
        return () => { cancelled = true; };
    }, [id]);

    // Build PrescriptionPatient from real data
    const prescriptionPatient: PrescriptionPatient | null = patient ? {
        id: patient.id,
        name: patient.full_name,
        condition: patient.existing_conditions?.[0] || '—',
        whatsappNumber: patient.whatsapp_number || undefined,
        dateOfBirth: patient.date_of_birth,
        gender: patient.gender,
    } : null;

    const patientName = patient?.full_name ?? 'Patient';

    const copyId = () => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Duration notification ──
    const durationMinutes = appointment?.duration_minutes || 30;
    useEffect(() => {
        if (!durationNotifShown && elapsedSeconds >= durationMinutes * 60) {
            setDurationNotifShown(true);
            setShowDurationNotif(true);
            const timeout = setTimeout(() => setShowDurationNotif(false), 10000);
            return () => clearTimeout(timeout);
        }
    }, [elapsedSeconds, durationMinutes, durationNotifShown]);


    // ── Load existing doctor notes when panel opens ──
    useEffect(() => {
        if (isPanelOpen && id) {
            getDoctorNotes(id)
                .then(setSavedNotes)
                .catch((e) => console.error('Failed to load notes:', e));
        }
    }, [isPanelOpen, id]);

    // ── Save a new doctor note ──
    const handleSaveNote = useCallback(async () => {
        if (!notes.trim() || isSaving) return;
        setIsSaving(true);
        try {
            const saved = await createDoctorNote(id, notes.trim());
            setSavedNotes((prev) => [...prev, saved]);
            setNotes("");
            setSaveToast(true);
            setTimeout(() => setSaveToast(false), 2500);
        } catch (e) {
            console.error('Failed to save note:', e);
        } finally {
            setIsSaving(false);
        }
    }, [id, notes, isSaving]);

    // ── Wrap in LiveKitRoom when token is ready ──
    const videoContent = (
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

                        {/* ── Remote Participant Video ── */}
                        <RemoteVideo patientJoinedRef={patientJoinedRef} />

                        {/* ── Local Camera PiP ── */}
                        <LocalPiP isVideoOff={isVideoOff} isMuted={isMuted} />

                        {/* ── Control Bar ── */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-2.5 rounded-2xl flex items-center gap-3 shadow-2xl z-50">

                            {/* Mic */}
                            <MicButton isMuted={isMuted} setIsMuted={setIsMuted} />

                            {/* Camera */}
                            <CameraButton isVideoOff={isVideoOff} setIsVideoOff={setIsVideoOff} />

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
                            <EndCallButton router={router} appointmentId={id} patientJoinedRef={patientJoinedRef} />
                        </div>

                        {/* ── Duration Notification Toast ── */}
                        <AnimatePresence>
                            {showDurationNotif && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-amber-900/90 backdrop-blur-xl border border-amber-700/50 text-amber-100 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-40 max-w-md"
                                >
                                    <Clock size={18} className="text-amber-300 shrink-0" />
                                    <p className="text-sm font-medium">
                                        {durationMinutes} minutes have elapsed for this consultation
                                    </p>
                                    <button
                                        onClick={() => setShowDurationNotif(false)}
                                        className="p-1 rounded-lg hover:bg-amber-800/50 transition-colors cursor-pointer shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                            {/* Panel Header */}
                            <div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
                                <FileText size={14} className="text-[var(--brand-primary)]" />
                                <span className="text-sm font-medium text-gray-900">Clinical Notes</span>
                            </div>

                            {/* Notes Panel */}
                            <div className="flex flex-col flex-1 overflow-hidden">
                                {/* Patient context */}
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{patientName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{patient?.existing_conditions?.[0] ?? '—'} • Video Consultation</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-semibold">
                                            {patientName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    </div>
                                </div>

                                {/* Saved Notes List */}
                                <div className="flex-1 overflow-y-auto">
                                    {savedNotes.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {savedNotes.map((note) => (
                                                <div key={note.id} className="px-4 py-3">
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1.5">
                                                        {new Date(note.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-8 text-center">
                                            <FileText size={20} className="text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">No notes yet. Add your first note below.</p>
                                        </div>
                                    )}
                                </div>

                                {/* New Note Input */}
                                <div className="border-t border-gray-100 shrink-0">
                                    <textarea
                                        className="w-full resize-none focus:outline-none text-gray-700 p-4 text-sm placeholder-gray-400"
                                        placeholder="Type a consultation note..."
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                e.preventDefault();
                                                handleSaveNote();
                                            }
                                        }}
                                    />
                                    <div className="px-3 pb-3 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400">⌘+Enter to save</span>
                                        <button
                                            onClick={handleSaveNote}
                                            disabled={!notes.trim() || isSaving}
                                            className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer flex items-center gap-2"
                                        >
                                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                            Save Note
                                        </button>
                                    </div>
                                </div>

                                {/* Save Toast */}
                                <AnimatePresence>
                                    {saveToast && (
                                        <motion.div
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 10, opacity: 0 }}
                                            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-lg flex items-center gap-1.5 z-50"
                                        >
                                            <Check size={12} />
                                            Note saved
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Overlay Sheets ── */}
            <PatientProfileSheet
                patient={patient}
                isOpen={isChartOpen}
                onClose={() => setIsChartOpen(false)}
                onNewPrescription={() => { setIsChartOpen(false); setIsPrescriptionOpen(true); }}
            />
            <NewPrescriptionSheet
                isOpen={isPrescriptionOpen}
                onClose={() => setIsPrescriptionOpen(false)}
                patient={prescriptionPatient}
                onPrescriptionCreated={() => { }}
            />
        </>
    );

    // If no token yet, show loading; otherwise wrap in LiveKitRoom
    if (lkError) {
        return (
            <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-lg font-medium">Failed to join call</p>
                    <p className="text-slate-500 text-sm mt-2">{lkError}</p>
                    <button onClick={() => router.push("/dashboard")} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!joinToken) {
        return (
            <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 mt-4 text-sm">Connecting to video session...</p>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            serverUrl={LIVEKIT_URL}
            token={joinToken}
            connect={true}
            video={true}
            audio={true}
            style={{ height: "100vh", width: "100vw" }}
        >
            <RoomAudioRenderer />
            {videoContent}
        </LiveKitRoom>
    );
}

/* ══════════════════════════════════════════════════════════════════════
 * LiveKit sub-components — must be children of <LiveKitRoom>
 * ══════════════════════════════════════════════════════════════════════ */

function RemoteVideo(props: { patientJoinedRef: React.MutableRefObject<boolean> }) {
    const remoteTracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: true }
    );
    const remoteParticipants = useRemoteParticipants();
    const remote = remoteParticipants[0];

    // Track if patient ever joined (lifted to parent via ref)
    const { patientJoinedRef } = props;
    useEffect(() => {
        if (remoteParticipants.length > 0) {
            patientJoinedRef.current = true;
        }
    }, [remoteParticipants.length, patientJoinedRef]);

    const remoteTrack = remoteTracks.find(
        (t) => t.participant.isLocal === false && t.source === Track.Source.Camera
    );

    const isCameraOn = remote?.isCameraEnabled ?? false;
    const isMicOn = remote?.isMicrophoneEnabled ?? true;

    // Remote has joined but camera is off
    if (remote && !isCameraOn) {
        return (
            <div className="flex flex-col items-center relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    <VideoOff size={40} className="text-slate-400" />
                </div>
                <p className="text-slate-300 font-medium mt-5 text-sm">Patient turned off their camera</p>
                {!isMicOn && (
                    <div className="absolute top-0 right-0 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                        <MicOff size={14} className="text-white" />
                    </div>
                )}
            </div>
        );
    }

    // Remote has joined and camera is on
    if (remoteTrack?.publication?.track) {
        return (
            <div className="w-full h-full absolute inset-0 bg-slate-950 flex items-center justify-center">
                <VideoTrack
                    trackRef={remoteTrack}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
                {!isMicOn && (
                    <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center z-10">
                        <MicOff size={16} className="text-white" />
                    </div>
                )}
            </div>
        );
    }

    // Remote not joined yet
    return (
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
            <p className="text-slate-500 text-xs mt-1">Patient has been notified</p>
        </div>
    );
}

function LocalPiP({ isVideoOff, isMuted }: { isVideoOff: boolean; isMuted: boolean }) {
    const localTracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false }
    );
    const localTrack = localTracks.find(
        (t) => t.participant.isLocal && t.source === Track.Source.Camera
    );

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute bottom-6 right-6 w-48 h-32 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden cursor-move z-10"
        >
            <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-b from-slate-700 to-slate-800">
                {!isVideoOff && localTrack?.publication?.track ? (
                    <VideoTrack
                        trackRef={localTrack}
                        style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scaleX(-1)" }}
                    />
                ) : isVideoOff ? (
                    <div className="flex flex-col items-center gap-2">
                        <VideoOff size={20} className="text-slate-500" />
                        <span className="text-slate-500 text-[10px]">Camera off</span>
                    </div>
                ) : (
                    <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-slate-300 text-[10px] text-center py-1">
                    You
                </div>
                {isMuted && (
                    <div className="absolute bottom-5 left-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center z-20">
                        <MicOff size={10} className="text-white" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function MicButton({ isMuted, setIsMuted }: { isMuted: boolean; setIsMuted: (v: boolean) => void }) {
    const { localParticipant } = useLocalParticipant();
    const toggle = useCallback(async () => {
        const next = !isMuted;
        setIsMuted(next);
        await localParticipant.setMicrophoneEnabled(!next);
    }, [isMuted, localParticipant, setIsMuted]);

    return (
        <button
            onClick={toggle}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isMuted ? "bg-red-500/20 text-red-400" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
            title={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
    );
}

function CameraButton({ isVideoOff, setIsVideoOff }: { isVideoOff: boolean; setIsVideoOff: (v: boolean) => void }) {
    const { localParticipant } = useLocalParticipant();
    const toggle = useCallback(async () => {
        const next = !isVideoOff;
        setIsVideoOff(next);
        await localParticipant.setCameraEnabled(!next);
    }, [isVideoOff, localParticipant, setIsVideoOff]);

    return (
        <button
            onClick={toggle}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isVideoOff ? "bg-red-500/20 text-red-400" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
            title={isVideoOff ? "Start Camera" : "Stop Camera"}
        >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
    );
}

function EndCallButton({ router, appointmentId, patientJoinedRef }: {
    router: ReturnType<typeof useRouter>;
    appointmentId: string;
    patientJoinedRef: React.MutableRefObject<boolean>;
}) {
    const { localParticipant } = useLocalParticipant();
    const handleEnd = useCallback(async () => {
        try {
            await localParticipant.setMicrophoneEnabled(false);
            await localParticipant.setCameraEnabled(false);
        } catch { /* ignore */ }

        router.push("/dashboard");
    }, [localParticipant, router]);

    return (
        <button
            onClick={handleEnd}
            className="px-6 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
            <PhoneOff size={18} />
            End Call
        </button>
    );
}
