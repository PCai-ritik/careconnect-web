"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Spline from "@splinetool/react-spline";
import { Activity, Eye, EyeOff } from "lucide-react";

/* ─────────────────────── Animation Variants ─────────────────────── */

const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const staggerChild = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
};

/* ─────────────────────── Reusable Input ─────────────────────── */

function AnimatedInput({
    type,
    placeholder,
    value,
    onChange,
    extraPadding,
}: {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    extraPadding?: boolean;
}) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full outline-none placeholder:text-white/50"
            style={{
                height: 40,
                borderRadius: 8,
                backgroundColor: isFocused
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.08)",
                boxShadow: isFocused ? "0 0 0 2px rgba(255,255,255,0.3)" : "none",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 400,
                lineHeight: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: extraPadding ? "4px 44px 4px 16px" : "4px 16px",
                transition: "background-color 0.2s, box-shadow 0.2s",
            }}
        />
    );
}

/* ─────────────────────── Component ─────────────────────── */

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black font-spline">
            {/* ── Full-screen Spline 3D background ── */}
            <div className="absolute inset-y-0 right-0 w-[80%] z-0 pointer-events-none">
                <Spline scene="https://prod.spline.design/LeL9on7xW5kFLbw6/scene.splinecode" />
            </div>

            {/* ── Panels on top ── */}
            <div className="relative z-10 flex w-full h-full">
                {/* ── LEFT 40% — Card Panel (blurred Spline shows through) ── */}
                <div className="w-full lg:w-[40%] h-full flex items-center justify-center p-8 relative">
                    {/* Blur overlay behind the card area */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            backgroundColor: "rgba(0,0,0,0.45)",
                        }}
                    />

                    {/* Glass Card */}
                    <motion.div
                        className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl p-10 w-full max-w-[400px] flex flex-col items-center"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* ── Logo ── */}
                        <motion.div variants={staggerChild}>
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                                <Activity size={32} className="text-white" />
                            </div>
                        </motion.div>

                        {/* ── Heading ── */}
                        <motion.h1
                            className="text-center text-white mb-2"
                            variants={staggerChild}
                            style={{
                                fontSize: 24,
                                fontWeight: 500,
                                lineHeight: "28px",
                            }}
                        >
                            Welcome to CareConnect
                        </motion.h1>

                        {/* ── Subtitle ── */}
                        <motion.p
                            className="text-center text-white/70 mb-8"
                            variants={staggerChild}
                            style={{
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: "24px",
                            }}
                        >
                            Log in or register with your email.
                        </motion.p>

                        {/* ── Google Button ── */}
                        <motion.button
                            className="w-full flex items-center justify-center gap-2 cursor-pointer"
                            variants={staggerChild}
                            whileHover={{
                                backgroundColor: "#4338CA",
                                y: -1,
                                boxShadow: "0 4px 16px rgba(79,70,229,0.4)",
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                height: 40,
                                borderRadius: 8,
                                backgroundColor: "#4F46E5",
                                color: "#FFFFFF",
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: "16px",
                                border: "none",
                                padding: "4px 16px",
                                marginTop: 8,
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="currentColor" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="currentColor" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="currentColor" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="currentColor" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            Continue with Google
                        </motion.button>

                        {/* ── Divider ── */}
                        <motion.div
                            className="w-full"
                            variants={staggerChild}
                            style={{
                                height: 1,
                                backgroundColor: "rgba(255,255,255,0.12)",
                                margin: "24px 0",
                            }}
                        />

                        {/* ── Email Input ── */}
                        <motion.div className="w-full" variants={staggerChild}>
                            <AnimatedInput
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </motion.div>

                        {/* ── Password Input ── */}
                        <motion.div
                            className="w-full relative"
                            variants={staggerChild}
                            style={{ marginTop: 8 }}
                        >
                            <AnimatedInput
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                extraPadding
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: 4,
                                    color: "rgba(255,255,255,0.5)",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </motion.div>

                        {/* ── Continue Button ── */}
                        <motion.button
                            className="w-full cursor-pointer"
                            variants={staggerChild}
                            whileHover={{
                                backgroundColor: "rgba(255,255,255,0.18)",
                                y: -1,
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                height: 40,
                                borderRadius: 8,
                                backgroundColor: "rgba(255,255,255,0.1)",
                                color: "#FFFFFF",
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: "16px",
                                border: "1px solid rgba(255,255,255,0.1)",
                                padding: "4px 16px",
                                marginTop: 8,
                            }}
                        >
                            Continue
                        </motion.button>
                    </motion.div>
                </div>

                {/* ── RIGHT 60% — Spline shows through (with lighter blur) ── */}
                <div className="hidden lg:block w-[60%] h-full relative">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            backgroundColor: "rgba(0,0,0,0.15)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
