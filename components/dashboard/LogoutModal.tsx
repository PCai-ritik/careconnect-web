"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, X } from "lucide-react";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
    const router = useRouter();

    const handleConfirm = () => {
        onClose();
        router.push("/login");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="logout-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="logout-modal-card"
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <AlertTriangle size={22} className="text-red-500" />
                        </div>

                        {/* Text */}
                        <h2 className="text-lg font-bold text-gray-900">Sign Out</h2>
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                            Are you sure you want to log out of your account?
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                            >
                                <LogOut size={15} />
                                Log Out
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
