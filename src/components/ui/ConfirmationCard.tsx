import { ReactNode } from 'react';

export function ConfirmationCard({ icon, title, value }: { icon: ReactNode, title: string, value: string }) {
    return (
        <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-50">
            {icon}
            <div>
                <p className="text-[10px] uppercase text-slate-500">{title}</p>
                <p className="font-bold text-sm">{value}</p>
            </div>
        </div>
    );
}
