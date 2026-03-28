import { ReactNode } from 'react';

export function ProfileStatCard({ label, value, trend, icon }: { label: string, value: string, trend?: string, icon: ReactNode }) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-card border border-dim shadow-sm hover:bg-slate-500/5 transition-colors">
            <div className="flex items-center justify-between">
                <p className="text-dim text-sm font-medium">{label}</p>
                {icon}
            </div>
            <div className="flex items-baseline gap-2">
                <p className="text-main text-2xl font-bold">{value}</p>
                {trend && <p className="text-emerald-600  text-xs font-bold">{trend}</p>}
            </div>
        </div>
    );
}
