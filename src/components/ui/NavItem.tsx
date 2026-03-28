import { ReactNode } from 'react';

export function NavItem({ icon, label, active = false, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-blue-600 ' : 'text-slate-400  hover:text-slate-600 '
                }`}
        >
            <div className="w-6 h-6 flex items-center justify-center">
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </button>
    );
}
