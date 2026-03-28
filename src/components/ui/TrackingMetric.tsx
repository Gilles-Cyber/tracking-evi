import { ReactNode } from 'react';

export function TrackingMetric({ icon, label, value, hint, tone }: { icon: ReactNode, label: string, value: string, hint: string, tone: 'sky' | 'emerald' | 'amber' }) {
    const toneClasses = {
        sky: 'bg-sky-50 text-sky-600 border-sky-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClasses[tone]}`}>
                    {icon}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
            </div>
            <div className="mt-3">
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{hint}</p>
            </div>
        </div>
    );
}
