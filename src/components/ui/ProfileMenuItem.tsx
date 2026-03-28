import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export function ProfileMenuItem({ icon, label, sublabel, onClick }: { icon: ReactNode, label: string, sublabel?: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center justify-between p-4 bg-transparent rounded-xl hover:bg-slate-500/5 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
                </div>
                <div className="flex flex-col text-left">
                    <span className="font-bold text-main">{label}</span>
                    {sublabel && <span className="text-xs text-dim">{sublabel}</span>}
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-dim" />
        </button>
    );
}
