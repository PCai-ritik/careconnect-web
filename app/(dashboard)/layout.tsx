import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-row h-full">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Header />
                <main className="flex-1 p-8 bg-doctor-background overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
