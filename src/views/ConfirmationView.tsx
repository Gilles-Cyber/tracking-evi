import { CheckCircle, Verified, Truck, Clock, Download, Lock, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationViewProps {
    onNavigate: (page: any) => void;
    trackingId?: string | null;
    onTrack: (id: string) => void;
}

export function ConfirmationView({ onNavigate, trackingId, onTrack }: ConfirmationViewProps) {
    const { id } = useParams<{ id: string }>();
    const { t } = useLanguage();
    const activeId = trackingId || id;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (activeId) {
            navigator.clipboard.writeText(activeId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg-app font-sans selection:bg-blue-500/30 overflow-hidden relative">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-card/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)]  overflow-hidden border border-dim relative z-10"
            >
                <div className="relative h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
                <div className="p-8 md:p-12 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="mb-8 relative inline-flex items-center justify-center w-28 h-28 mx-auto"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full border border-blue-500/30"></div>
                        <CheckCircle className="w-16 h-16 text-blue-500  drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] relative z-10" />
                    </motion.div>

                    <h1 className="text-3xl font-black mb-4 tracking-tight text-main">{t('secure_commission')}</h1>
                    <p className="text-lg text-dim font-medium mb-12">{t('protection_absolute')}</p>

                    {/* Tracking ID Box */}
                    <div className="bg-bg-app/50 rounded-[2rem] p-8 border border-dim shadow-inner mb-4">
                        <span className="block text-xs uppercase tracking-[0.2em] text-dim mb-3 font-bold">{t('tracking_ref')}</span>
                        <div className="font-mono text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600   tracking-wider font-bold drop-shadow-sm mb-4">
                            {activeId || 'EVR-XXXX-XX'}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-500/5 hover:bg-slate-500/10 border border-dim rounded-xl text-sm font-bold text-dim hover:text-main transition-all"
                        >
                            {copied ? <><Check className="w-4 h-4 text-emerald-500" /> {t('copied')}</> : <><Copy className="w-4 h-4" /> {t('copy_code')}</>}
                        </button>
                    </div>
                    <p className="text-xs text-dim mb-8">{t('tracking_access')}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
                        <div className="bg-slate-500/5 border border-dim rounded-2xl p-4 flex flex-col gap-2">
                            <div className="p-2 bg-blue-500/10 w-fit rounded-xl border border-blue-500/20"><Verified className="text-blue-500  w-5 h-5" /></div>
                            <div><p className="text-[10px] text-dim font-bold uppercase tracking-widest">{t('status')}</p><p className="text-main font-bold text-sm mt-0.5">{t('protected')}</p></div>
                        </div>
                        <div className="bg-slate-500/5 border border-dim rounded-2xl p-4 flex flex-col gap-2">
                            <div className="p-2 bg-indigo-500/10 w-fit rounded-xl border border-indigo-500/20"><Truck className="text-indigo-500  w-5 h-5" /></div>
                            <div><p className="text-[10px] text-dim font-bold uppercase tracking-widest">{t('operator')}</p><p className="text-main font-bold text-sm mt-0.5">Evri</p></div>
                        </div>
                        <div className="bg-slate-500/5 border border-dim rounded-2xl p-4 flex flex-col gap-2">
                            <div className="p-2 bg-amber-500/10 w-fit rounded-xl border border-amber-500/20"><Clock className="text-amber-500  w-5 h-5" /></div>
                            <div><p className="text-[10px] text-dim font-bold uppercase tracking-widest">{t('update_in_progress')}</p><p className="text-main font-bold text-sm mt-0.5">{t('real_time')}</p></div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <motion.button 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => activeId && onTrack(activeId)} 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] text-white font-black py-5 px-8 rounded-2xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] tracking-widest uppercase text-sm"
                        >
                            {t('access_live_tracking')}
                        </motion.button>
                        <button onClick={() => onNavigate('home')} className="text-dim hover:text-main transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 pt-2">
                            <Download className="w-4 h-4" /> {t('return_home')}
                        </button>
                    </div>
                </div>

                <div className="bg-bg-app/50 px-8 py-6 border-t border-dim flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-card to-bg-app border border-dim rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/10"></div>
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-main to-dim font-black text-xs relative z-10">EV</span>
                        </div>
                        <span className="font-extrabold tracking-tight text-main/80">Evri<span className="text-blue-500">Logistics</span></span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-emerald-500/80  font-bold uppercase tracking-[0.2em]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('encryption_note')}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
