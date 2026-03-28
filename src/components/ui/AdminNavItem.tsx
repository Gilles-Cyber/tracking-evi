import { ReactNode } from 'react';

export function AdminNavItem({ icon, label, active = false, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button onClick={onClick} className={`flex flex-1 flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-dim hover:text-blue-600'} transition-colors`}>
            <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
            <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
        </button>
    );
}
