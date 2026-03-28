import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export function SettingsItem({ icon, label, toggle = false, active = false, value }: { icon: ReactNode, label: string, toggle?: boolean, active?: boolean, value?: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-100 transition-all">
            <div className="flex items-center gap-4">
                <div className="text-blue-600">{icon}</div>
                <span className="text-sm font-bold text-blue-900">{label}</span>
            </div>
            {toggle ? (
                <div className={`w-10 h-5 rounded-full transition-colors relative ${active ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    {value && <span className="text-xs text-slate-500 font-bold">{value}</span>}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
            )}
        </div>
    );
}
