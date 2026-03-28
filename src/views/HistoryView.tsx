import { ArrowLeft, Truck, Download, ChevronRight, CheckCircle, Package, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Page, Shipment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryViewProps {
    onNavigate: (page: Page) => void;
    sessionId?: string;
    shipments?: Shipment[];
    onTrack?: (id: string) => void;
}

export function HistoryView({ onNavigate, sessionId, shipments: liveShipments = [], onTrack }: HistoryViewProps) {
    const { t } = useLanguage();

    const getStatusTranslation = (status: string) => {
        switch (status) {
            case 'Transit': return t('transit');
            case 'Pending': return t('pending');
            case 'Paused': return t('paused');
            case 'Spoiled': return t('spoiled_status');
            case 'Delivered': return t('delivered');
            case 'Alert': return t('alert');
            default: return status;
        }
    };

    const historyShipments = liveShipments.filter(s => s.session_id === sessionId);

    // Sort by most recent
    const sortedShipments = [...historyShipments].reverse();

    return (
        <div className="flex flex-col min-h-screen bg-bg-app text-main font-sans selection:bg-blue-500/30 pb-24">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/5 to-transparent"></div>
            </div>

            <header className="flex items-center p-6 border-b border-dim sticky top-0 bg-card/80 backdrop-blur-xl z-20">
                <button
                    onClick={() => onNavigate('home')}
                    className="p-2 text-dim hover:text-main hover:bg-slate-500/5 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="flex-1 text-center font-bold text-xl tracking-tight text-main">{t('history')}</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 p-4 sm:p-6 space-y-8 max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide pt-2 w-full justify-center">
                    <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-500 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.1)] whitespace-nowrap">{t('all_history')}</button>
                    <button className="px-6 py-2.5 bg-card/50 text-dim border border-dim rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-500/10 hover:text-main transition-colors whitespace-nowrap">{t('in_transit')}</button>
                    <button className="px-6 py-2.5 bg-card/50 text-dim border border-dim rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-500/10 hover:text-main transition-colors whitespace-nowrap">{t('delivered')}</button>
                </div>

                {/* Grid Layout */}
                <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
                    {sortedShipments.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="p-4 bg-slate-500/5 rounded-3xl border border-dim inline-block mb-4">
                                <Package className="w-12 h-12 text-dim opacity-20" />
                            </div>
                            <p className="text-dim font-medium">{t('not_found')}</p>
                        </div>
                    ) : (
                        sortedShipments.map((s, i) => {
                            const isError = s.status === 'Alert' || s.status === 'Spoiled' || s.status === 'Delayed';
                            const isDone = s.status === 'Delivered';
                            const accentClass = isError ? 'text-red-500' : isDone ? 'text-emerald-500' : 'text-blue-500';
                            const bgAccent = isError ? 'bg-red-500/10' : isDone ? 'bg-emerald-500/10' : 'bg-blue-500/10';
                            
                            return (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onTrack && onTrack(s.id)}
                                    className="w-full group cursor-pointer"
                                >
                                    <div className="bg-card border border-dim rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-500 group-hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-4 rounded-2xl ${bgAccent} ${accentClass} border border-current/10 shadow-inner`}>
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-dim font-bold uppercase tracking-[0.2em] mb-1">{s.date || t('today')}</p>
                                                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border rounded-full bg-bg-app ${accentClass} border-current/20`}>
                                                    {getStatusTranslation(s.status)}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-main text-2xl mb-1 tracking-tight">{s.cargo_type || t('package')}</h3>
                                        <p className="text-sm font-bold text-dim font-mono tracking-widest mb-8 uppercase opacity-50">{s.id}</p>

                                        <div className="bg-bg-app/50 rounded-3xl p-6 border border-dim mb-6">
                                            <div className="flex justify-between items-center relative gap-8">
                                                <div className="flex flex-col gap-1.5 z-10">
                                                    <span className="text-[10px] uppercase font-bold text-dim tracking-widest">{t('origin')}</span>
                                                    <span className="text-sm font-bold text-main">{s.origin}</span>
                                                </div>
                                                
                                                <div className="flex-1 border-t-2 border-dashed border-dim relative h-0">
                                                    <div 
                                                        className={`absolute top-1/2 left-0 -translate-y-1/2 h-[2px] ${accentClass.replace('text', 'bg')} shadow-[0_0_10px_currentcolor] transition-all duration-1000`}
                                                        style={{ width: `${s.progress}%` }}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5 items-end z-10">
                                                    <span className="text-[10px] uppercase font-bold text-dim tracking-widest">{t('dest')}</span>
                                                    <span className="text-sm font-bold text-main">{s.dest}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-500/5 hover:bg-slate-500/10 text-main border border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                {t('details')} <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
