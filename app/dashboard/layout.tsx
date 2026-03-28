import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Smartphone } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* ── Mobile Hard Gate (phones only, no escape) ── */}
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center md:hidden">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
                >
                    <Smartphone size={36} className="text-white" />
                </div>

                {/* Headline */}
                <h1 className="text-2xl font-bold text-gray-900 mt-6 tracking-tight">
                    Desktop Optimized
                </h1>
                <p className="text-gray-500 mt-3 mb-8 max-w-sm text-sm leading-relaxed">
                    This clinical dashboard is strictly designed for larger screens.
                    To manage patients and appointments on the go, please download our Provider App.
                </p>

                {/* App store buttons */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    {/* Apple App Store */}
                    <button className="bg-gray-900 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 text-sm cursor-pointer hover:bg-gray-800 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        Download on the App Store
                    </button>

                    {/* Google Play */}
                    <button className="bg-white text-gray-900 border border-gray-200 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M3.18 23.76c.35.2.74.24 1.12.12l12.4-7.15-2.68-2.68-10.84 9.71zM.27 1.5C.1 1.87 0 2.29 0 2.76v18.49c0 .47.1.9.27 1.26l.07.06 10.36-10.36v-.24L.34 1.44l-.07.06zM20.22 10.53l-2.72-1.57-3 3 3 3 2.74-1.58c.78-.45.78-1.4-.02-1.85zM4.3.12L16.7 7.27l-2.68 2.68L3.18.24C3.56.12 3.95.16 4.3.32v-.2z" />
                        </svg>
                        Get it on Google Play
                    </button>
                </div>
            </div>

            {/* ── Dashboard (hidden on mobile, visible md+) ── */}
            <div className="hidden md:flex min-h-screen bg-[#F8FAFC] font-spline">
                <Sidebar />

                <div className="flex-1 ml-64 flex flex-col">
                    <Header />

                    <main className="flex-1 mt-16 p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
