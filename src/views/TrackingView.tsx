import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    MapPin, Box, Truck, Clock, AlertTriangle, CheckCircle2, Star, Share2, Info, 
    ChevronRight, Wind, Globe, ArrowLeft, ArrowRight, Edit2, Plane, Ship, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Shipment } from '../types';
import Logo from '../components/ui/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { ShipmentMap } from '../components/ui/ShipmentMap';

interface TrackingViewProps {
    onNavigate: (page: Page) => void;
    onLogoClick: () => void;
    shipmentId?: string;
    shipments: Shipment[];
}

export function TrackingView({ onNavigate, onLogoClick, shipmentId, shipments }: TrackingViewProps) {
    const { t, language, toggleLanguage } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const activeId = shipmentId || id;
    const activeShipment = shipments.find(s => s.id === activeId) || shipments[0];
    const [alertsOpen, setAlertsOpen] = useState(true);
    const [renderProgress, setRenderProgress] = useState(activeShipment?.progress || 0);

    if (!activeShipment) return <div className="min-h-screen flex items-center justify-center bg-bg-app text-main font-bold">{t('shipment_not_found')}</div>;

    useEffect(() => {
        setRenderProgress((prev) => {
            if (Math.abs(prev - activeShipment.progress) < 0.2) return activeShipment.progress;
            return prev;
        });
    }, [activeShipment.id, activeShipment.progress]);

    useEffect(() => {
        const target = Number(activeShipment.progress) || 0;
        const timer = window.setInterval(() => {
            setRenderProgress((prev) => {
                const delta = target - prev;
                if (Math.abs(delta) < 0.15) return target;
                return prev + delta * 0.18;
            });
        }, 60);

        return () => window.clearInterval(timer);
    }, [activeShipment.progress]);

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

    const mapAccent = isErrorState
        ? {
            trace: '#ef4444',
            bg: 'bg-red-500',
            border: 'border-red-400',
            glow: 'shadow-[0_0_28px_rgba(239,68,68,0.45)]'
        }
        : {
            trace: '#38bdf8',
            bg: 'bg-blue-500',
            border: 'border-sky-300',
            glow: 'shadow-[0_0_28px_rgba(56,189,248,0.45)]'
        };

    const routePhase = renderProgress >= 100
        ? (language === 'es' ? 'Entrega completada' : 'Delivery completed')
        : renderProgress >= 70
            ? (language === 'es' ? 'Aproximación final' : 'Final approach')
            : renderProgress >= 35
                ? (language === 'es' ? 'Corredor principal' : 'Main corridor')
                : (language === 'es' ? 'Salida de origen' : 'Origin departure');

    const routeWaypoints = (activeShipment.route_waypoints || []).filter(Boolean);
    const routeStops = [activeShipment.origin, ...routeWaypoints, activeShipment.dest].filter(Boolean);

    const telemetry = [
        {
            label: language === 'es' ? 'Vehículo' : 'Vehicle',
            value: activeShipment.vehicle_type === 'air'
                ? (language === 'es' ? 'Aeronave' : 'Aircraft')
                : activeShipment.vehicle_type === 'sea'
                    ? (language === 'es' ? 'Buque' : 'Vessel')
                    : (language === 'es' ? 'Camión' : 'Truck')
        },
        {
            label: language === 'es' ? 'Cobertura' : 'Coverage',
            value: `${Math.max(8, Math.round(renderProgress * 1.12))}%`
        },
        {
            label: language === 'es' ? 'Phase' : 'Phase',
            value: routePhase
        },
        {
            label: language === 'es' ? 'Stops' : 'Stops',
            value: String(routeStops.length)
        },
    ];

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
            time: new Date().toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            status: 'active',
            icon: activeShipment.vehicle_type === 'air' ? <Plane className="w-5 h-5 text-white" /> : activeShipment.vehicle_type === 'sea' ? <Ship className="w-5 h-5 text-white" /> : <Truck className="w-5 h-5 text-white" />,
        },
        {
            label: t('to'),
            title: t('scheduled_delivery_date'),
            subtitle: activeShipment.dest,
            time: activeShipment.estimated_arrival 
                ? new Date(activeShipment.estimated_arrival).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'long' })
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
                        onClick={toggleLanguage}
                        className="p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-main transition-all border border-dim flex items-center gap-1.5"
                    >
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase hidden md:block">{language === 'en' ? 'ES' : 'EN'}</span>
                    </button>
                </div>
            </motion.header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-16 pb-32 space-y-6">

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
                                        ? new Date(activeShipment.estimated_arrival).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' })
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
                            <span>{Math.round(renderProgress)}% {t('complete')}</span>
                            <span className="text-right">{activeShipment.dest}</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-500/10  rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${renderProgress}%` }}
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
                                            {new Date().toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
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
                                                ? new Date(activeShipment.estimated_arrival).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'long' })
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

                {/* Live Route Map */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-[2rem] border border-dim bg-card shadow-xl"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,136,200,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(15,114,166,0.08),transparent_35%)] pointer-events-none" />

                    <div className="relative z-10 p-6 md:p-8 border-b border-dim">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/5 border border-dim text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {language === 'es' ? 'Mapa en vivo' : 'Live route map'}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-main">
                                    {language === 'es' ? 'Simulation temps réel du trajet' : 'Real-time route simulation'}
                                </h2>
                                <p className="text-sm text-dim mt-2 max-w-2xl">
                                    {language === 'es'
                                        ? 'Le véhicule affiché suit la configuration choisie par l’administrateur et la progression actuelle de l’expédition.'
                                        : 'The vehicle below follows the transport mode selected by the admin and the current shipment progress.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:min-w-[520px]">
                                {telemetry.map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-dim bg-slate-500/5 px-4 py-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dim mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-main">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 grid lg:grid-cols-[minmax(0,1.6fr)_360px]">
                        <div className="p-4 md:p-6">
                            <div className="relative h-[320px] md:h-[460px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                                <ShipmentMap
                                    origin={activeShipment.origin}
                                    dest={activeShipment.dest}
                                    waypoints={routeWaypoints}
                                    progress={renderProgress}
                                    simMode={activeShipment.vehicle_type}
                                    isSpoiled={activeShipment.status === 'Spoiled'}
                                    accent={mapAccent}
                                />

                                <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-md">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        {language === 'es' ? 'Signal' : 'Signal'}
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-white">{routePhase}</p>
                                </div>

                                <div className="pointer-events-none absolute right-4 bottom-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-md">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        {language === 'es' ? 'Progreso' : 'Progress'}
                                    </p>
                                    <p className="mt-1 text-lg font-black text-white">{Math.round(renderProgress)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t lg:border-t-0 lg:border-l border-dim p-6 md:p-8 bg-slate-500/5">
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-dim bg-card p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600 mb-2">
                                        {language === 'es' ? 'Route intelligence' : 'Route intelligence'}
                                    </p>
                                    <p className="text-sm font-bold text-main">
                                        {language === 'es'
                                            ? 'Le mouvement du véhicule est calculé à partir du pourcentage de progression et du type de transport défini dans le dashboard admin.'
                                            : 'Vehicle movement is derived from shipment progress and the transport mode configured in the admin dashboard.'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-dim bg-card p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dim mb-3">
                                        {language === 'es' ? 'Live corridor' : 'Live corridor'}
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-dim">{activeShipment.origin}</span>
                                            <span className={`font-black ${accent.text}`}>{Math.round(renderProgress)}%</span>
                                            <span className="text-dim text-right">{activeShipment.dest}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-500/10 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${renderProgress}%` }}
                                                transition={{ duration: 1.1, ease: 'easeOut' }}
                                                className={`h-full ${accent.bg}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-dim bg-card p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dim mb-3">
                                        {language === 'es' ? 'Route nodes' : 'Route nodes'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {routeStops.map((stop, index) => (
                                            <span
                                                key={`${stop}-${index}`}
                                                className={`px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.16em] ${
                                                    index === 0 || index === routeStops.length - 1
                                                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-600'
                                                        : 'border-dim bg-slate-500/5 text-dim'
                                                }`}
                                            >
                                                {stop.split(',')[0].trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-dim bg-card p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dim">
                                                {language === 'es' ? 'Integrity' : 'Integrity'}
                                            </p>
                                            <p className="text-sm font-bold text-main">
                                                {language === 'es' ? 'Position surveillée' : 'Position monitored'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-dim leading-relaxed">
                                        {language === 'es'
                                            ? 'Les changements de statut, l’avancement et le véhicule sélectionné se reflètent directement dans cette carte pour une sensation de suivi plus réelle.'
                                            : 'Status changes, progress updates, and the selected vehicle are reflected directly on this map for a more realistic tracking experience.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Bottom Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    <button 
                        onClick={() => onNavigate('tracking' as any)}
                        className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl border border-dim text-dim font-semibold hover:bg-slate-500/5 transition-all bg-card shadow-sm"
                    >
                        {t('track_another_shipment')}
                    </button>
                </motion.div>

            </main>
        </div>
    );
}


