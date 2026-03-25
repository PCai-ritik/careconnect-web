'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Calendar, Users, Settings } from 'lucide-react';

const navLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Appointments', icon: Calendar, route: '/appointments' },
    { label: 'Patients', icon: Users, route: '/patients' },
    { label: 'Profile', icon: Settings, route: '/profile' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30">
            {/* Brand Header */}
            <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-100">
                <Activity className="h-6 w-6 text-doctor-primary" />
                <span className="text-lg font-bold tracking-tight text-gray-900">
                    CareConnect
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
                {navLinks.map(({ label, icon: Icon, route }) => {
                    const isActive = pathname === route || pathname.startsWith(route + '/');

                    return (
                        <Link
                            key={route}
                            href={route}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-indigo-50 text-doctor-primary'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
