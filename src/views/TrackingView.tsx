import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
    MapPin, Box, Truck, Clock, AlertTriangle, CheckCircle2, Star, Share2, Info, 
    ChevronRight, Wind, Globe, ArrowLeft, ArrowRight, Edit2, Plane, Ship, ShieldCheck,
    Zap, Activity, Navigation, Radio, Target, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Shipment } from '../types';
import Logo from '../components/ui/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { ShipmentMap } from '../components/ui/ShipmentMap';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export function TrackingView({ onNavigate, onLogoClick, shipmentId, shipments }: TrackingViewProps) {
    const { t, language, toggleLanguage } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const activeId = shipmentId || id;
    const activeShipment = shipments.find(s => s.id === activeId) || shipments[0];
    
    const [renderProgress, setRenderProgress] = useState(0);
    const [telemetry, setTelemetry] = useState({ speed: 0, alt: 0, lat: 0, lng: 0 });

    // Simulate "Live Data Stream" sensation
    useEffect(() => {
        const timer = setInterval(() => {
            setTelemetry({
                speed: 840 + Math.random() * 20,
                alt: 32000 + Math.random() * 100,
                lat: 40.71 + Math.random() * 0.01,
                lng: -74.00 - Math.random() * 0.01
            });
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    // Smooth Progress easing
    useEffect(() => {
        const target = activeShipment?.progress || 0;
        const timeout = setTimeout(() => setRenderProgress(target), 500);
        return () => clearTimeout(timeout);
    }, [activeShipment?.progress]);

    if (!activeShipment) return null;

    const isError = ['Alert', 'Customs Hold', 'Delayed', 'Spoiled'].includes(activeShipment.status);
    const themeColor = isError ? 'text-rose-500' : 'text-blue-500';
    const themeBg = isError ? 'from-rose-600 to-red-600' : 'from-blue-600 to-indigo-600';

    return (
        <div className="min-h-screen bg-[#06070a] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1] 
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className={`absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-600/20`} 
                />
            </div>

            {/* HEADER */}
            <header className="sticky top-0 z-[100] border-b border-white/5 bg-[#06070a]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <motion.button 
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => onNavigate('home')} 
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400"
                        >
                            <ArrowLeft size={20} />
                        </motion.button>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
                            <Logo size={32} />
                            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                            <span className="font-black tracking-tighter text-xl text-white hidden sm:block italic">
                                EVRI<span className="text-blue-500">LIVE</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Status</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Synchronized</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>
                        <button onClick={toggleLanguage} className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold hover:bg-white/10 transition-all uppercase">
                            {language}
                        </button>
                    </div>
                </div>
            </header>

            <motion.main 
                variants={containerVariants} initial="hidden" animate="visible"
                className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12 space-y-8"
            >
                
                {/* HERO SECTION: DIGITAL TWIN CARD */}
                <motion.div variants={itemVariants} className="relative group">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${themeBg} rounded-[2.5rem] blur opacity-15 group-hover:opacity-25 transition duration-1000`} />
                    <div className="relative bg-[#0d1117] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        
                        {/* Status Header */}
                        <div className="px-8 py-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${themeBg} flex items-center justify-center shadow-lg`}>
                                    <Target className="w-6 h-6 text-white animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Global Airway Bill</span>
                                        <div className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500 uppercase">Priority</div>
                                    </div>
                                    <p className="font-mono text-xl font-bold text-white tracking-widest">{activeShipment.id}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                {['Share', 'Alert', 'Track'].map((btn) => (
                                    <button key={btn} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                        {btn === 'Share' && <Share2 size={18} />}
                                        {btn === 'Alert' && <Radio size={18} className="text-rose-500" />}
                                        {btn === 'Track' && <Activity size={18} className="text-blue-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Journey Summary */}
                        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Phase</p>
                                <div className="flex items-baseline gap-3">
                                    <h2 className={`text-4xl font-black italic tracking-tighter ${themeColor}`}>
                                        {activeShipment.status.toUpperCase()}
                                    </h2>
                                </div>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <Clock size={14} className="text-blue-500" />
                                    Updated {new Date().toLocaleTimeString()}
                                </p>
                            </div>

                            <div className="space-y-4 md:border-x md:border-white/5 md:px-12">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Destination</p>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-6 h-6 text-blue-500 shrink-0" />
                                    <h2 className="text-2xl font-bold text-white truncate">{activeShipment.dest}</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0d1117] flex items-center justify-center text-[8px] font-bold">PT</div>)}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Transit Nodes Active</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Arrival Probability</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white">
                                        {activeShipment.estimated_arrival ? 'ON TIME' : 'ESTIMATING...'}
                                    </h2>
                                </div>
                                <p className="text-xs font-bold text-slate-500">{activeShipment.estimated_arrival || 'Calculating dynamic window...'}</p>
                            </div>
                        </div>

                        {/* Fluid Progress Line */}
                        <div className="px-10 pb-10">
                            <div className="flex justify-between items-end mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Origin Point</span>
                                    <span className="text-sm font-bold text-white">{activeShipment.origin}</span>
                                </div>
                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="text-center bg-white/5 px-4 py-2 rounded-2xl border border-white/10"
                                >
                                    <span className={`text-2xl font-black tracking-tighter ${themeColor}`}>{Math.round(renderProgress)}%</span>
                                    <p className="text-[8px] font-black text-slate-500 uppercase">Journey completion</p>
                                </motion.div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Final Gateway</span>
                                    <span className="text-sm font-bold text-white">{activeShipment.dest.split(',')[0]}</span>
                                </div>
                            </div>
                            <div className="h-4 w-full bg-white/5 rounded-full p-1 border border-white/5 relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${renderProgress}%` }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 50 }}
                                    className={`h-full rounded-full bg-gradient-to-r ${themeBg} relative shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-12 bg-white/30 blur-md animate-pulse" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* INTERACTIVE TRACKING GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: Live Map with Radar Effect */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
                        <div className="relative group bg-[#0d1117] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl h-[550px]">
                            
                            {/* Scanning Overlay (CSS Animation) */}
                            <div className="absolute inset-0 pointer-events-none z-20">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                                <motion.div 
                                    animate={{ y: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    className="w-full h-[2px] bg-blue-500/30 blur-sm" 
                                />
                            </div>

                            <ShipmentMap
                                origin={activeShipment.origin}
                                dest={activeShipment.dest}
                                waypoints={(activeShipment.route_waypoints || []).filter(Boolean)}
                                progress={renderProgress}
                                simMode={activeShipment.vehicle_type}
                                isSpoiled={activeShipment.status === 'Spoiled'}
                                accent={isError ? {trace: '#f43f5e', bg: 'bg-rose-500', glow: 'shadow-rose-500/40'} : {trace: '#3b82f6', bg: 'bg-blue-500', glow: 'shadow-blue-500/40'}}
                            />

                            {/* Floating Telemetry HUD */}
                            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-4 z-30">
                                {[
                                    { label: 'Airspeed', val: `${Math.round(telemetry.speed)} km/h`, icon: Wind },
                                    { label: 'Altitude', val: `${Math.round(telemetry.alt)} ft`, icon: Navigation },
                                    { label: 'Coordinates', val: `${telemetry.lat.toFixed(3)}N, ${telemetry.lng.toFixed(3)}W`, icon: Globe }
                                ].map((stat, i) => (
                                    <motion.div 
                                        key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 + i*0.1 }}
                                        className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3"
                                    >
                                        <stat.icon size={16} className="text-blue-500" />
                                        <div>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-xs font-mono font-bold text-white">{stat.val}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Signal Indicator */}
                            <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 z-30">
                                <div className="flex items-end gap-0.5 h-3">
                                    {[1, 2, 3, 4].map(h => <div key={h} className={`w-0.5 rounded-full bg-blue-500 opacity-${h*20}`} style={{ height: `${h*25}%` }} />)}
                                </div>
                                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Live Link</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: High-Tech Timeline */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                        <div className="bg-[#0d1117] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Cpu size={14} className="text-blue-500" /> Processing Journey
                                </h3>
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            </div>

                            <div className="relative space-y-10 pl-8">
                                <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-blue-500 via-blue-500/20 to-transparent" />
                                
                                <div className="relative group/step">
                                    <div className="absolute -left-[35px] top-1 w-5 h-5 rounded-full border-4 border-[#0d1117] bg-slate-700 transition-colors group-hover/step:bg-blue-500" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{activeShipment.origin}</p>
                                    <p className="text-sm font-bold text-white uppercase">Dispatched from Facility</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[40px] -top-1 w-8 h-8 rounded-full border-4 border-[#0d1117] bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center z-10">
                                        <Truck size={14} className="text-white" />
                                    </div>
                                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">In Transit</p>
                                        <p className="text-base font-bold text-white mb-2">{activeShipment.status}</p>
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Currently navigating the logistics corridor. Optimized route selected for safety.</p>
                                    </div>
                                </div>

                                <div className="relative opacity-30">
                                    <div className="absolute -left-[35px] top-1 w-5 h-5 rounded-full border-4 border-[#0d1117] bg-slate-800" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Final Destination</p>
                                    <p className="text-sm font-bold text-white uppercase">Delivery Pending</p>
                                </div>
                            </div>
                        </div>

                        {/* Smart Info Card */}
                        <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-blue-500/20 rounded-[2rem] p-6">
                            <div className="flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <ShieldCheck className="text-blue-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Cargo Protected</p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">"Electronic seals and temperature sensors are active. This shipment is being monitored 24/7 by our security protocols."</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* FOOTER ACTIONS */}
                <motion.div variants={itemVariants} className="flex justify-center pb-12">
                    <button 
                        onClick={() => onNavigate('home')}
                        className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition-all"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Track Another Package
                    </button>
                </motion.div>

            </motion.main>
        </div>
    );
}