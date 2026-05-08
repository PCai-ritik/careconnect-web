"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Spline from "@splinetool/react-spline";
import { Activity, Eye, EyeOff, Loader2 } from "lucide-react";
import { login, registerDoctor } from "@/lib/auth";
import { applyDefaultBranding } from "@/lib/theme";

/* ─────────────────────── Animation Variants ─────────────────────── */

const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
};

const staggerChild = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const fadeSlide = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

/* ─────────────────────── Shared ─────────────────────── */

const inputClass =
    "w-full h-10 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:bg-gray-50 focus:ring-2 focus:ring-[var(--brand-primary)]/15 rounded-lg px-4 text-sm transition-all outline-none";

/* ─────────────────────── Component ─────────────────────── */

type View = "login" | "register";

export default function LoginPage() {
    const [currentView, setCurrentView] = useState<View>("login");
    const [splineLoaded, setSplineLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        applyDefaultBranding();
    }, []);

    const router = useRouter();

    /* Login state */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    /* Register state */
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [showRegPassword, setShowRegPassword] = useState(false);

    /* Shared state */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ── Login Handler ── */
    const handleLogin = async () => {
        if (!email || !password) { setError("Please fill in all fields"); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await login(email, password);
            if (res.role === "DOCTOR") {
                router.push("/dashboard");
            } else {
                setError("This portal is for doctors only. Please use the mobile app.");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Register Handler ── */
    const handleRegister = async () => {
        if (!regName || !regEmail || !regPassword) { setError("Please fill in all fields"); return; }
        if (regPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        setError(null);
        try {
            await registerDoctor({
                email: regEmail,
                password: regPassword,
                full_name: regName,
            });
            router.push("/doctor-onboarding");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden font-spline">
            {/* ────────── LEFT PANEL (50%) ────────── */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-8 relative">
                <AnimatePresence mode="wait">
                    {/* ═══════════════ LOGIN VIEW ═══════════════ */}
                    {currentView === "login" && (
                        <motion.div key="login" {...fadeSlide} className="w-full max-w-[360px] flex flex-col items-center">
                            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full flex flex-col items-center">
                                {/* Logo */}
                                <motion.div variants={staggerChild} className="flex flex-col items-center mb-10">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)] flex items-center justify-center mb-3">
                                        <Activity size={32} className="text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">CareConnect</span>
                                    <span className="text-xs text-[var(--brand-primary)] font-medium mt-0.5">For Doctors</span>
                                </motion.div>

                                {/* Email */}
                                <motion.div variants={staggerChild} className="w-full">
                                    <input type="email" placeholder="Email" value={email}
                                        onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                                </motion.div>

                                {/* Password */}
                                <motion.div variants={staggerChild} className="w-full mt-2">
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                                            onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-11`} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Error Display */}
                                {error && currentView === "login" && (
                                    <motion.p variants={staggerChild} className="text-sm text-red-500 text-center w-full">
                                        {error}
                                    </motion.p>
                                )}

                                {/* Continue → /dashboard */}
                                <motion.button variants={staggerChild}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="w-full bg-[var(--brand-primary)] text-white shadow-sm rounded-lg px-4 py-3 text-sm font-medium mt-6 cursor-pointer transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Continue"}
                                </motion.button>

                                {/* Divider */}
                                <motion.div variants={staggerChild} className="flex items-center gap-4 my-6 w-full">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </motion.div>

                                {/* Register → switch to sign-up form */}
                                <motion.button variants={staggerChild}
                                    whileHover={{ backgroundColor: "rgba(79,70,229,0.05)" }} whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={() => setCurrentView("register")}
                                    className="w-full border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-lg px-4 py-3 text-sm font-medium cursor-pointer transition-all"
                                    style={{ backgroundColor: "#FFFFFF" }}>
                                    Register
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ═══════════════ REGISTER VIEW ═══════════════ */}
                    {currentView === "register" && (
                        <motion.div key="register" {...fadeSlide} className="w-full max-w-[360px] flex flex-col items-center">
                            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full flex flex-col items-center">
                                {/* Logo */}
                                <motion.div variants={staggerChild} className="flex flex-col items-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--brand-primary)] flex items-center justify-center mb-3">
                                        <Activity size={28} className="text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">Create your account</span>
                                    <span className="text-xs text-gray-400 mt-0.5">Join as a CareConnect Doctor</span>
                                </motion.div>

                                {/* Full Name */}
                                <motion.div variants={staggerChild} className="w-full">
                                    <input type="text" placeholder="Full Name" value={regName}
                                        onChange={(e) => setRegName(e.target.value)} className={inputClass} />
                                </motion.div>

                                {/* Email */}
                                <motion.div variants={staggerChild} className="w-full mt-2">
                                    <input type="email" placeholder="Email" value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)} className={inputClass} />
                                </motion.div>

                                {/* Password */}
                                <motion.div variants={staggerChild} className="w-full mt-2">
                                    <div className="relative">
                                        <input type={showRegPassword ? "text" : "password"} placeholder="Password (min 6 chars)" value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)} className={`${inputClass} pr-11`} />
                                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                            {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Error Display */}
                                {error && currentView === "register" && (
                                    <motion.p variants={staggerChild} className="text-sm text-red-500 text-center w-full">
                                        {error}
                                    </motion.p>
                                )}

                                {/* Continue → /doctor-onboarding */}
                                <motion.button variants={staggerChild}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="w-full bg-[var(--brand-primary)] text-white shadow-sm rounded-lg px-4 py-3 text-sm font-medium mt-6 cursor-pointer transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Continue"}
                                </motion.button>

                                {/* Divider */}
                                <motion.div variants={staggerChild} className="flex items-center gap-4 my-6 w-full">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </motion.div>

                                {/* Sign In Instead → switch back to login */}
                                <motion.button variants={staggerChild}
                                    whileHover={{ backgroundColor: "rgba(79,70,229,0.05)" }} whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={() => setCurrentView("login")}
                                    className="w-full border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-lg px-4 py-3 text-sm font-medium cursor-pointer transition-all"
                                    style={{ backgroundColor: "#FFFFFF" }}>
                                    Sign In Instead
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ────────── RIGHT PANEL (50%) — Spline 3D ────────── */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[var(--brand-primary)]">
                {mounted && (
                    <div style={{ pointerEvents: "none" }} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${splineLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <Spline
                            scene="https://prod.spline.design/LeL9on7xW5kFLbw6/scene.splinecode"
                            onLoad={() => setSplineLoaded(true)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
