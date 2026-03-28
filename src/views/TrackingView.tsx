import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    MapPin, Box, Truck, Clock, AlertTriangle, CheckCircle2, Star, Share2, Info, 
    ChevronRight, Wind, Globe, ArrowLeft, ArrowRight, Edit2, Plane, Ship,
    ShieldCheck, Loader2, Fingerprint, Lock, Shield, FileText, Download, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Shipment } from '../types';
import Logo from '../components/ui/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';

interface TrackingViewProps {
    onNavigate: (page: Page) => void;
    onLogoClick: () => void;
    shipmentId?: string;
    shipments: Shipment[];
}

export function TrackingView({ onNavigate, onLogoClick, shipmentId, shipments }: TrackingViewProps) {
    const { t, language, toggleLanguage } = useLanguage();
    const { notify } = useNotification();
    const { id } = useParams<{ id: string }>();
    const activeId = shipmentId || id;
    const activeShipment = shipments.find(s => s.id === activeId) || shipments[0];
    const [alertsOpen, setAlertsOpen] = useState(true);
    const [showManifest, setShowManifest] = useState(false);
    const [verifying, setVerifying] = useState(false);

    if (!activeShipment) return <div className="min-h-screen flex items-center justify-center bg-bg-app text-main font-bold">{t('shipment_not_found')}</div>;

    const isTransit = activeShipment.status === 'Transit';
    const isErrorState = activeShipment.status === 'Alert' || activeShipment.status === 'Customs Hold' || activeShipment.status === 'Delayed' || activeShipment.status === 'Spoiled';

    const accent = isErrorState
        ? {
            bg: 'bg-red-500',
            bgLight: 'bg-red-500/10',
            text: 'text-red-500',
            border: 'border-red-500',
            borderLight: 'border-red-500/20'
        }
        : {
            bg: 'bg-blue-600',
            bgLight: 'bg-blue-600/10',
            text: 'text-blue-600',
            border: 'border-blue-600',
            borderLight: 'border-blue-600/20'
        };

    const timelineSteps = [
        {
            label: t('from'),
            title: t('package_received_by'),
            subtitle: activeShipment.origin,
            time: null,
            status: 'done',
            icon: <Box className="w-5 h-5 text-white" />,
        },
        {
            label: t(activeShipment.status.toLowerCase() as any) || activeShipment.status,
            title: t('at_facility_desc'),
            subtitle: activeShipment.origin,
            time: new Date().toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            status: 'active',
            icon: activeShipment.vehicle_type === 'air' ? <Plane className="w-5 h-5 text-white" /> : activeShipment.vehicle_type === 'sea' ? <Ship className="w-5 h-5 text-white" /> : <Truck className="w-5 h-5 text-white" />,
        },
        {
            label: t('to'),
            title: t('scheduled_delivery_date'),
            subtitle: activeShipment.dest,
            time: activeShipment.estimated_arrival 
                ? new Date(activeShipment.estimated_arrival).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' })
                : activeShipment.date || t('pending'),
            status: 'pending',
            icon: <MapPin className="w-5 h-5 text-white" />,
        },
    ];

    return (
        <div className="min-h-screen bg-bg-app font-sans transition-colors duration-300">

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border-b border-dim px-4 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => onNavigate('home')} 
                        className="p-2 rounded-full hover:bg-slate-500/10 text-dim group transition-colors"
                        title={t('back')}
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { onNavigate('home'); onLogoClick(); }}>
                        <Logo size={28} />
                        <span className="font-extralight text-xl tracking-tight text-main hidden sm:block">
                            <span className={`font-bold ${accent.text}`}>Evri</span>
                            <span className="ml-1 text-dim font-light">{t('tracking')}</span>
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 font-semibold">
                    <button 
                        onClick={() => onNavigate('tracking' as any)} 
                        className={`${accent.text} transition-colors hidden lg:block hover:underline text-sm`}
                    >
                        {t('track_another_shipment')}
                    </button>
                    
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-main transition-all border border-dim flex items-center gap-1.5"
                    >
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase hidden md:block">{language === 'en' ? 'FR' : 'EN'}</span>
                    </button>
                </div>
            </motion.header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-16 space-y-6">

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-card rounded-2xl shadow-xl border border-dim overflow-hidden"
                >
                    {/* Summary Bar */}
                    <div className="p-6 md:p-10 border-b border-dim">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {/* EDD */}
                            <div>
                                <p className="text-[10px] font-extrabold text-dim uppercase tracking-[0.2em] mb-2">{t('scheduled_delivery_date')}</p>
                                <h1 className="text-5xl font-extralight text-main tracking-tighter">
                                    {activeShipment.estimated_arrival 
                                        ? new Date(activeShipment.estimated_arrival).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' })
                                        : activeShipment.date || t('pending')}
                                </h1>
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dim text-[11px] font-bold text-dim uppercase tracking-widest">
                                    {isErrorState ? <AlertTriangle className="w-3 h-3 text-red-500" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                    {isErrorState ? t('alert') : t('on_time')}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="sm:border-x sm:border-dim px-0 sm:px-8">
                                <p className="text-[10px] font-extrabold text-dim uppercase tracking-[0.2em] mb-2">{t('status')}</p>
                                <motion.div
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-4 mt-1"
                                >
                                    <span className="text-2xl font-light text-main">
                                        {t(activeShipment.status.toLowerCase() as any) || activeShipment.status}
                                    </span>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${accent.bg} shadow-lg`}>
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </div>
                                </motion.div>
                                <p className="text-xs text-dim mt-4 flex items-center gap-1.5 uppercase tracking-widest">
                                    <Clock className="w-3.5 h-3.5" />
                                    {t('updated_recently')}
                                </p>
                            </div>

                            {/* Tracking ID */}
                            <div>
                                <p className="text-[10px] font-extrabold text-dim uppercase tracking-[0.2em] mb-2">{t('tracking_id')}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xl font-mono font-medium text-main tracking-wider select-all">
                                        {activeShipment.id}
                                    </span>
                                    <button className={`${accent.text} p-1.5 rounded-full hover:${accent.bgLight} transition-colors border border-current/20`}>
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button className="text-dim p-1.5 rounded-full hover:bg-slate-500/10 transition-colors border border-dim">
                                        <Star className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-dim mt-2 font-medium">{activeShipment.driver}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 md:px-10 py-4 border-b border-dim bg-slate-500/5">
                        <div className="flex justify-between text-[11px] font-bold text-dim uppercase tracking-widest mb-2">
                            <span className={accent.text}>{activeShipment.origin}</span>
                            <span>{activeShipment.progress}% {t('complete')}</span>
                            <span className="text-right">{activeShipment.dest}</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-500/10  rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${activeShipment.progress}%` }}
                                className={`h-full ${accent.bg}`}
                            ></motion.div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row">

                        {/* Left: Alerts */}
                        <div className="w-full lg:w-[42%] p-6 md:p-8 lg:border-r border-dim">
                            {/* Alert Banner (admin message) */}
                            <AnimatePresence>
                                {activeShipment.admin_message && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`p-5 rounded-2xl ${accent.bgLight} border ${accent.borderLight} flex gap-4 items-start bg-card shadow-sm mb-6`}
                                    >
                                        <div className={`p-2 rounded-xl ${accent.bg} text-white shrink-0`}>
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black ${accent.text} uppercase tracking-widest mb-1`}>{t('carrier_update')}</p>
                                            <p className="text-main text-sm font-medium leading-relaxed">{activeShipment.admin_message}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="border border-dim rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setAlertsOpen(!alertsOpen)}
                                    className="w-full px-6 py-5 flex items-center justify-between bg-card hover:bg-slate-500/5 transition-colors"
                                >
                                    <h2 className="text-xl font-light text-main flex items-center gap-2">
                                        {t('alerts')} <span className="text-sm font-bold text-dim ml-1">(1)</span>
                                    </h2>
                                    <ChevronRight className={`w-6 h-6 text-dim transition-transform duration-300 ${alertsOpen ? '-rotate-90' : 'rotate-90'}`} />
                                </button>
                                <AnimatePresence>
                                    {alertsOpen && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 py-5 border-t border-dim bg-slate-500/5  space-y-4">
                                                <div className="border border-dim rounded-xl p-5 flex items-start gap-4 bg-card">
                                                    <Info className="w-6 h-6 text-dim shrink-0 mt-0.5" />
                                                    <p className="text-dim text-[15px] leading-relaxed">
                                                        {t('no_edd_available')}
                                                    </p>
                                                </div>

                                                {/* Neural Route Analyzer Card */}
                                                {isTransit && (
                                                    <div className="relative group">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                                        <div className="relative bg-card border border-blue-500/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
                                                            <div className="flex items-center justify-between mb-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                                        <Globe className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '10s' }} />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t('neural_route_analyzer')}</h3>
                                                                        <p className="text-[9px] font-bold text-dim uppercase">{t('active_prediction_engine')}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[9px] font-black text-emerald-500">98.4% {t('confidence')}</span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                                <div className="p-3 bg-slate-500/5 rounded-xl border border-dim">
                                                                    <p className="text-[9px] font-bold text-dim uppercase mb-1">{t('environmental_lift')}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <Wind className="w-3 h-3 text-sky-400" />
                                                                        <span className="text-xs font-black text-main">42 KM/H ({t('tailwind')})</span>
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 bg-slate-500/5 rounded-xl border border-dim">
                                                                    <p className="text-[9px] font-bold text-dim uppercase mb-1">{t('incidence_risk')}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                                                        <span className="text-xs font-black text-main">{t('optimal')} (0.02%)</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex justify-between text-[10px] font-bold text-dim">
                                                                    <span>{t('logistics_stream_progress')}</span>
                                                                    <span className="text-blue-500">{t('processing')}</span>
                                                                </div>
                                                                <div className="h-1 bg-slate-500/10 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        animate={{ x: ['-100%', '100%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                                        className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <p className="mt-4 text-[10px] leading-relaxed text-dim/70 italic border-l-2 border-blue-500/20 pl-3">
                                                                "{t('ai_prediction_msg')}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right: Timeline */}
                        <div className="w-full lg:w-[58%] p-8 md:p-10 bg-card relative">
                            {/* Vertical connector line */}
                            <div className="absolute left-[4.25rem] top-12 bottom-12 w-[4px] rounded-full overflow-hidden bg-slate-500/10  pointer-events-none">
                                <motion.div
                                    initial={{ height: '0%' }}
                                    animate={{ height: '40%' }}
                                    className={`w-full ${accent.bg}`}
                                ></motion.div>
                            </div>

                            <div className="space-y-12">
                                {/* Step 1: FROM */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex gap-6 items-start"
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 ${accent.border} bg-card z-10 flex items-center justify-center shadow-md shrink-0 mt-0.5`}>
                                        <div className={`w-3 h-3 rounded-full ${accent.bg}`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-dim uppercase tracking-[0.2em] mb-1">{t('from')}</p>
                                        <p className="text-[13px] font-extrabold text-main uppercase tracking-wide">{t('package_received_by')}</p>
                                        <p className="text-sm text-dim mt-0.5">{activeShipment.origin}</p>
                                    </div>
                                </motion.div>

                                {/* Step 2: IN TRANSIT */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex gap-6 items-start"
                                >
                                    <div className={`w-10 h-10 rounded-full border-2 ${accent.border} ${accent.bg} z-10 flex items-center justify-center shadow-lg shrink-0 -ml-1`}>
                                        <div className="animate-pulse">
                                            {activeShipment.vehicle_type === 'air' ? <Plane className="w-5 h-5 text-white" /> : activeShipment.vehicle_type === 'sea' ? <Ship className="w-5 h-5 text-white" /> : <Truck className="w-5 h-5 text-white" />}
                                        </div>
                                    </div>
                                    <div className={`flex-1 ${accent.bgLight} border ${accent.borderLight} rounded-xl p-5 -mt-1 shadow-sm`}>
                                        <p className={`text-[12px] font-extrabold ${accent.text} uppercase tracking-widest mb-1`}>
                                            {t(activeShipment.status.toLowerCase() as any) || activeShipment.status}
                                        </p>
                                        <p className="text-main font-semibold text-[15px]">{t('at_facility_desc')}</p>
                                        <p className="text-main/80 text-[13px] mt-0.5 uppercase tracking-wide font-medium">{activeShipment.origin || 'FACILITY'}</p>
                                        <p className="text-dim text-[12px] mt-2 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date().toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                        
                                        {activeShipment.status === 'Spoiled' && (
                                            <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600  text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <Wind className="w-4 h-4 animate-bounce" /> {t('spoiled_status')}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Step 3: OUT FOR DELIVERY */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex gap-6 items-center"
                                >
                                    <div className="w-4 h-4 rounded-full bg-slate-500/20  z-10 ml-2 shrink-0 border-2 border-card shadow-sm"></div>
                                    <p className="text-[11px] font-extrabold text-dim uppercase tracking-[0.2em]">{t('out_for_delivery_step')}</p>
                                </motion.div>

                                {/* Step 4: TO */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex gap-6 items-start"
                                >
                                    <div className="w-4 h-4 rounded-full bg-slate-500/20  z-10 ml-2 mt-1.5 shrink-0 border-2 border-card shadow-sm"></div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-dim uppercase tracking-[0.2em] mb-1">{t('to')}</p>
                                        <p className="text-[12px] italic text-dim mb-0.5">{t('scheduled_delivery_date')}</p>
                                        <p className="text-[15px] text-dim font-light">
                                            {activeShipment.estimated_arrival 
                                                ? new Date(activeShipment.estimated_arrival).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' })
                                                : activeShipment.date || t('pending')}
                                        </p>
                                        <p className="text-sm text-main font-semibold mt-1">{activeShipment.dest}</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* View Modification Button */}
                            <button className="absolute bottom-6 right-6 p-3 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-dim transition-all group">
                                <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >                    <button 
                        onClick={() => {
                            setVerifying(true);
                            setShowManifest(true);
                            setTimeout(() => setVerifying(false), 2500);
                        }}
                        className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 ${accent.border} ${accent.text} font-semibold hover:${accent.bgLight} transition-all bg-card shadow-sm group relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        {t('docs_douane')}
                    </button>
                    <button 
                        onClick={() => onNavigate('support' as any)}
                        className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl border border-dim text-dim font-semibold hover:bg-slate-500/5 transition-all bg-card shadow-sm"
                    >
                        {t('support_protocol')}
                    </button>
                </motion.div>

                {/* Quantum Manifest Modal */}
                <AnimatePresence>
                    {showManifest && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={() => setShowManifest(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                            />
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-4xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                            >
                                {/* Left Side: Document Preview (Simplified) */}
                                <div className="w-full md:w-1/2 bg-slate-100  p-8 flex flex-col">
                                    <div className="flex justify-between items-center mb-8">
                                        <Logo size={40} />
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t('digital_manifest')}</p>
                                            <p className="text-[10px] font-bold text-dim uppercase">GX-{activeId?.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-dim uppercase tracking-widest">{t('shipment_origin')}</p>
                                            <p className="text-sm font-black text-main uppercase">{activeShipment.origin}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-dim uppercase tracking-widest">{t('consignee_destination')}</p>
                                            <p className="text-sm font-black text-main uppercase">{activeShipment.dest}</p>
                                        </div>
                                        <div className="pt-4 border-t border-dim/20 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-dim uppercase">{t('net_weight')}</p>
                                                <p className="text-xs font-black">{activeShipment.weight || 100} KG</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-dim uppercase">{t('cargo_code')}</p>
                                                <p className="text-xs font-black">{activeShipment.cargo_type || 'EL-40'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 p-4 rounded-xl bg-slate-500/5 border border-dim/10 border-dashed relative">
                                            <p className="text-[8px] font-mono text-dim leading-tight opacity-50">
                                                LOG_INIT: SHA-256 ENCRYPTION STARTING...<br/>
                                                VERIFYING BLOCKCHAIN NODE 04...<br/>
                                                ACCESS_GRANTED: LEVEL_7_AUTH_REQUIRED
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between text-main/40">
                                        <div className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                        </div>
                                        <p className="text-[9px] font-mono">GLOBAL_XN_CORE_V4</p>
                                    </div>
                                </div>

                                {/* Right Side: Security Controls */}
                                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-card border-l border-dim relative">
                                    <div className="absolute top-8 right-8">
                                        <button onClick={() => setShowManifest(false)} className="p-2 rounded-full hover:bg-slate-500/10 text-dim transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {verifying ? (
                                            <motion.div 
                                                key="verifying"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.1 }}
                                                className="text-center space-y-6"
                                            >
                                                <div className="relative">
                                                    <Fingerprint className="w-20 h-20 text-blue-500 mx-auto" />
                                                    <motion.div 
                                                        animate={{ y: [0, 80, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                        className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400/60 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tighter text-main mb-1 uppercase">{t('biometric_scan')}</h3>
                                                    <p className="text-xs text-dim font-bold tracking-widest uppercase animate-pulse">{t('verifying_identity')}</p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="ready"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center space-y-8 w-full"
                                            >
                                                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
                                                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black tracking-tighter text-main uppercase">{t('quantum_secured')}</h3>
                                                    <p className="text-xs text-dim leading-relaxed">{t('quantum_secured_desc')}</p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 w-full">
                                                    <button className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                                                        <Download className="w-4 h-4" /> {t('download_signed_pdf')}
                                                    </button>
                                                    <button className="w-full flex items-center justify-center gap-3 py-4 border border-dim text-main rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-500/5 transition-colors">
                                                        <FileText className="w-4 h-4" /> {t('share_secure_link')}
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 pt-4 border-t border-dim">
                                                    <div className="flex items-center gap-1.5">
                                                        <Lock className="w-3 h-3 text-emerald-500" />
                                                        <span className="text-[8px] font-bold text-dim uppercase">{t('end_to_end_encrypted')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Cpu className="w-3 h-3 text-blue-500" />
                                                        <span className="text-[8px] font-bold text-dim uppercase">{t('hardware_signed')}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
