import { ReactNode } from 'react';

export function AdminStatCard({ label, value, icon, isAlert = false }: { label: string, value: string, icon: ReactNode, isAlert?: boolean }) {
    return (
        <div className="flex flex-col gap-1 rounded-2xl p-4 bg-card border border-dim shadow-sm">
            <p className="text-dim text-[10px] font-semibold uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline justify-between">
                <p className={`${isAlert ? 'text-red-500' : 'text-main'} text-2xl font-black`}>{value}</p>
                <div className="text-blue-500">{icon}</div>
            </div>
        </div>
    );
}
