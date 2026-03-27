import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-spline flex">
            <Sidebar />

            <div className="flex-1 ml-64 flex flex-col">
                <Header />

                <main className="flex-1 mt-16 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
