import { ReactNode } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export function TimelineItem({ status, title, location, date, time, isLast, activeContent }: {
    status: 'completed' | 'active' | 'pending',
    title: string,
    location: string,
    date: string,
    time: string,
    isLast: boolean,
    activeContent?: ReactNode
}) {
    return (
        <div className={`relative pl-10 ${!isLast ? 'pb-10' : ''}`}>
            {!isLast && <div className="absolute left-[0.4375rem] top-2 bottom-0 w-0.5 bg-blue-100"></div>}
            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 ${status === 'completed' ? 'bg-blue-600 border-blue-100' :
                status === 'active' ? 'bg-blue-600 ring-4 ring-blue-100 border-transparent' :
                    'bg-slate-200 border-transparent'
                }`}></div>

            <div className={`flex flex-col gap-4 ${status === 'active' ? 'p-5 bg-blue-50 rounded-xl border border-blue-100' : ''} ${status === 'pending' ? 'opacity-50' : ''}`}>
                <div className="flex flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className={`text-base font-bold ${status === 'active' ? 'text-blue-600' : 'text-slate-900'}`}>{title}</h3>
                            {status === 'active' && <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded uppercase">En cours</span>}
                        </div>
                        <p className="text-xs text-slate-500">{location}</p>
                        {status === 'completed' && (
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-blue-600 font-semibold">
                                <CheckCircle className="w-3 h-3" /> Terminé
                            </div>
                        )}
                        {status === 'pending' && (
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                                <Clock className="w-3 h-3" /> En attente
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-medium text-slate-400 block">{date}</span>
                        <span className={`text-xs font-bold ${status === 'active' ? 'text-blue-600 text-lg' : 'text-slate-900'}`}>{time}</span>
                    </div>
                </div>
                {activeContent}
            </div>
        </div>
    );
}
