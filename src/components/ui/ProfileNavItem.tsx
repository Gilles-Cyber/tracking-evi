import { ReactNode } from 'react';

export function ProfileNavItem({ icon, label, active = false, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-1 flex-col items-center justify-end gap-1 ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <div className="flex h-8 items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
        </button>
    );
}
