"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    LiveKitRoom,
    VideoTrack,
    useTracks,
    useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

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

/* ── Page ────────────────────────────────────────────────────────────── */

interface PatientJoinData {
    room_name: string;
    join_token: string;
    livekit_url: string;
}

export default function PatientJoinPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenParam = searchParams.get("token");
    const [joinData, setJoinData] = useState<PatientJoinData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const timer = useCallTimer();

    // Resolve the appointment id from the dynamic route
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    useEffect(() => {
        params.then(({ id }) => setAppointmentId(id));
    }, [params]);

    // Fetch join data from the public endpoint
    useEffect(() => {
        if (!appointmentId || !tokenParam) {
            setError("Missing appointment ID or token.");
            return;
        }
        let cancelled = false;
        async function fetchJoinData() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(
                    `${apiUrl}/appointments/${appointmentId}/join-patient?token=${encodeURIComponent(tokenParam!)}`,
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.detail || `HTTP ${res.status}`);
                }
                const data: PatientJoinData = await res.json();
                if (!cancelled) setJoinData(data);
            } catch (err: any) {
                if (!cancelled) setError(err.message);
            }
        }
        fetchJoinData();
        return () => { cancelled = true; };
    }, [appointmentId, tokenParam]);

    // ─── Error state ──
    if (error) {
        return (
            <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PhoneOff size={28} className="text-red-400" />
                    </div>
                    <p className="text-red-400 text-lg font-medium">Unable to join call</p>
                    <p className="text-slate-500 text-sm mt-2">{error}</p>
                </div>
            </div>
        );
    }

    // ─── Loading state ──
    if (!joinData) {
        return (
            <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 mt-4 text-sm">Joining video call...</p>
                </div>
            </div>
        );
    }

    // ─── Connected ──
    return (
        <LiveKitRoom
            serverUrl={joinData.livekit_url}
            token={joinData.join_token}
            connect={true}
            video={true}
            audio={true}
            style={{ height: "100vh", width: "100vw" }}
        >
            <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden font-sans">

                {/* ── Video Area ── */}
                <div className="flex-1 relative flex items-center justify-center bg-slate-900 m-4 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">

                    {/* Timer */}
                    <div className="absolute top-5 left-5 z-10">
                        <div className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md border border-red-500/20">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="font-mono font-medium">{timer}</span>
                        </div>
                    </div>

                    {/* Remote Doctor Video */}
                    <RemoteVideo />

                    {/* Local Camera PiP */}
                    <LocalPiP isVideoOff={isVideoOff} />

                    {/* ── Control Bar ── */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-2.5 rounded-2xl flex items-center gap-3 shadow-2xl z-50">

                        {/* Mic */}
                        <MicButton isMuted={isMuted} setIsMuted={setIsMuted} />

                        {/* Camera */}
                        <CameraButton isVideoOff={isVideoOff} setIsVideoOff={setIsVideoOff} />

                        <div className="w-px h-8 bg-slate-700" />

                        {/* End Call */}
                        <button
                            onClick={() => window.close()}
                            className="px-6 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <PhoneOff size={18} />
                            Leave
                        </button>
                    </div>
                </div>

                {/* Branding footer */}
                <div className="text-center py-3">
                    <p className="text-slate-600 text-xs">Powered by CareConnect</p>
                </div>
            </div>
        </LiveKitRoom>
    );
}

/* ══════════════════════════════════════════════════════════════════════
 * LiveKit sub-components — must be children of <LiveKitRoom>
 * ══════════════════════════════════════════════════════════════════════ */

function RemoteVideo() {
    const branding = useBranding();
    const remoteTracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: true }
    );
    const remoteTrack = remoteTracks.find(
        (t) => t.participant.isLocal === false && t.source === Track.Source.Camera
    );

    if (remoteTrack?.publication?.track) {
        return (
            <div className="w-full h-full absolute inset-0 bg-slate-950 flex items-center justify-center">
                <VideoTrack
                    trackRef={remoteTrack}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            </div>
        );
    }

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
            <p className="text-slate-300 font-medium mt-5 text-sm text-center max-w-sm px-4">
                {branding.white_label_config?.waiting_room_msg || "Waiting for doctor to join..."}
            </p>
        </div>
    );
}

function LocalPiP({ isVideoOff }: { isVideoOff: boolean }) {
    const localTracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false }
    );
    const localTrack = localTracks.find(
        (t) => t.participant.isLocal && t.source === Track.Source.Camera
    );

    return (
        <div className="absolute bottom-6 right-6 w-36 h-24 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden z-10">
            <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-b from-slate-700 to-slate-800">
                {!isVideoOff && localTrack?.publication?.track ? (
                    <VideoTrack
                        trackRef={localTrack}
                        style={{ width: "100%", height: "100%", objectFit: "contain", transform: "none" }}
                    />
                ) : isVideoOff ? (
                    <div className="flex flex-col items-center gap-1">
                        <VideoOff size={16} className="text-slate-500" />
                        <span className="text-slate-500 text-[10px]">Camera off</span>
                    </div>
                ) : (
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-slate-300 text-[10px] text-center py-1">
                    You
                </div>
            </div>
        </div>
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
