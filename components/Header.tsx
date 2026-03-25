import { Plus } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            {/* Left spacer — title can go here later */}
            <div />

            {/* Right side actions */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-doctor-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    New Action
                </button>

                {/* User avatar */}
                <div className="h-9 w-9 rounded-full bg-doctor-primary/10 flex items-center justify-center text-doctor-primary text-sm font-bold">
                    DR
                </div>
            </div>
        </header>
    );
}
