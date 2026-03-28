import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Clock, LayoutDashboard, Settings, Map as MapIcon, Activity, X, CheckCircle, Package, Plane, Ship, ChevronRight, ChevronDown, Menu, Loader2, Wind, User, Mail, Phone, Globe, Plus, LogOut, Truck, MapPin, Search, Calendar, Info, Navigation, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/ui/Logo';
import { Page, Shipment } from '../types';
import { AdminStatCard } from '../components/ui/AdminStatCard';
import { AdminNavItem } from '../components/ui/AdminNavItem';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminViewProps {
    onNavigate: (page: Page) => void;
    shipments: Shipment[];
    loading: boolean;
    setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
    onLogout: () => void;
}

const statusOptions: Shipment['status'][] = ['Transit', 'Paused', 'Delayed', 'Customs Hold', 'Delivered', 'Alert', 'Pending', 'Spoiled'];

export function AdminView({ onNavigate, shipments, loading, setShipments, onLogout }: AdminViewProps) {
    const { t, language, setLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const [simulatingId, setSimulatingId] = useState<string | null>(null);
    const simInterval = React.useRef<NodeJS.Timeout | null>(null);
    
    // User Management states
    const [profiles, setProfiles] = useState<any[]>([]);
    const [profilesLoading, setProfilesLoading] = useState(false);


    const filteredShipments = filterStatus === 'All' ? shipments : shipments.filter(s => s.status === filterStatus);

    const handleSaveShipment = async () => {
        if (!selectedShipment) return;
        setSaving(true);
        setSaveError(null);

        try {
            const { error } = await supabase.from('shipments').update({
                status: selectedShipment.status,
                vehicle_type: selectedShipment.vehicle_type,
                progress: selectedShipment.progress,
                admin_message: selectedShipment.admin_message,
                cargo_type: selectedShipment.cargo_type,
                weight: selectedShipment.weight,
                priority: selectedShipment.priority,
                sender_name: selectedShipment.sender_name,
                sender_email: selectedShipment.sender_email,
                sender_phone: selectedShipment.sender_phone,
                dimensions: selectedShipment.dimensions,
                hazardous: selectedShipment.hazardous,
                estimated_arrival: selectedShipment.estimated_arrival || null,
            }).eq('id', selectedShipment.id);

            if (error) throw error;

            // Update local state immediately
            setShipments(prev => prev.map(s => s.id === selectedShipment.id ? selectedShipment : s));
            setSelectedShipment(null);
        } catch (err: any) {
            setSaveError(t('save_error') + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleSimulation = (id: string) => {
        if (simulatingId === id) {
            if (simInterval.current) clearInterval(simInterval.current);
            setSimulatingId(null);
        } else {
            setSimulatingId(id);
            simInterval.current = setInterval(async () => {
                setShipments(prev => {
                    const shipmentList = [...prev];
                    const shipment = shipmentList.find(s => s.id === id);
                    if (!shipment) return prev;
                    
                    const nextProgress = Math.min(shipment.progress + 1, 100);
                    
                    // Sync to DB
                    supabase.from('shipments')
                        .update({ progress: nextProgress })
                        .eq('id', id)
                        .then();

                    if (nextProgress >= 100) {
                        if (simInterval.current) clearInterval(simInterval.current);
                        setSimulatingId(null);
                    }

                    const updated = prev.map(s => s.id === id ? { ...s, progress: nextProgress } : s);
                    // Update current selected shipment too for live preview
                    if (selectedShipment && selectedShipment.id === id) {
                        setSelectedShipment({ ...selectedShipment, progress: nextProgress });
                    }
                    return updated;
                });
            }, 3000);
        }
    };

    React.useEffect(() => {
        return () => {
            if (simInterval.current) clearInterval(simInterval.current);
        };
    }, []);

    const fetchProfiles = async () => {
        setProfilesLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setProfilesLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'users') {
            fetchProfiles();
        }
    }, [activeTab]);

    const getVehicleIcon = (type: string, className: string = "w-5 h-5") => {
        if (type === 'air') return <Plane className={className} />;
        if (type === 'sea') return <Ship className={className} />;
        return <Truck className={className} />;
    };

    const getStatusTranslation = (status: string) => {
        const key = status.toLowerCase() as any;
        return t(key) || status;
    };


    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col font-sans selection:bg-blue-500/30 bg-bg-app text-main transition-colors duration-300">



            <header className="flex items-center bg-card/80 backdrop-blur-xl border-b border-dim py-4 px-6 justify-between fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        className="text-main hover:text-blue-500 transition-colors p-2 rounded-xl hover:bg-slate-500/10 relative" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="w-5 h-5" />
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute left-0 mt-4 w-48 bg-card border border-dim rounded-2xl shadow-2xl py-2 overflow-hidden z-[60]"
                                >
                                    <button onClick={() => onNavigate('home')} className="w-full text-left px-4 py-3 text-sm font-bold text-main hover:bg-slate-500/10 transition-colors flex items-center gap-2">
                                        <Logo size={16} /> {t('home_view')}
                                    </button>
                                    <button onClick={() => { setActiveTab('users'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center gap-2">
                                        <User className="w-4 h-4" /> {t('users')}
                                    </button>
                                    <button onClick={() => onNavigate('shipment')} className="w-full text-left px-4 py-3 text-sm font-bold text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> {t('ship')}
                                    </button>
                                    <div className="border-t border-dim my-1"></div>
                                    <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                                        <LogOut className="w-4 h-4" /> {t('logout')}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                    <div className="flex items-center gap-2">
                        <Logo size={32} />
                        <h2 className="text-main text-lg font-bold tracking-tight">Evri<span className="text-blue-500 font-normal">{language === 'es' ? ' Admin' : ' Admin'}</span></h2>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => onNavigate('shipment')}
                        className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" /> {t('ship')}
                    </button>
                    <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500  text-xs font-bold gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        {t('system_health')}
                    </div>
                    
                    <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="p-2 rounded-full bg-slate-500/5 text-dim hover:text-main transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pl-3">
                        <Globe className="w-4 h-4 text-blue-500" /> {language === 'en' ? 'ES' : 'EN'}
                    </button>

                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-dim hover:border-blue-500 transition-colors cursor-pointer">
                        <img className="w-full h-full object-cover" src="https://picsum.photos/seed/admin/100/100" alt="Admin" referrerPolicy="no-referrer" />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 lg:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32 lg:pb-8 mt-20">
                {/* USERS TAB Content */}
                {activeTab === 'users' && (
                    <div className="col-span-full space-y-8 min-h-[600px]">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-main uppercase tracking-tighter flex items-center gap-3">
                                <User className="w-6 h-6 text-blue-500" />
                                {t('user_management')}
                            </h3>
                            <button onClick={fetchProfiles} className="p-3 bg-card border border-dim rounded-2xl hover:bg-slate-500/10 transition-colors">
                                <Activity className={`w-5 h-5 ${profilesLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="rounded-3xl border border-dim bg-card overflow-hidden shadow-sm">
                             <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-dim text-[10px] uppercase tracking-widest font-bold bg-slate-500/10 ">
                                        <th className="px-6 py-4">{t('user')}</th>
                                        <th className="px-6 py-4">{t('contact')}</th>
                                        <th className="px-6 py-4">{t('last_activity')}</th>
                                        <th className="px-6 py-4">{t('creation_date')}</th>
                                        <th className="px-6 py-4 text-right">{t('action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profilesLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-dim">
                                                <td colSpan={5} className="px-6 py-4"><div className="h-4 w-full skeleton rounded" /></td>
                                            </tr>
                                        ))
                                    ) : profiles.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-20 text-dim">{t('no_users_found')}</td></tr>
                                    ) : (
                                        profiles.map(p => (
                                            <tr key={p.id} className="border-b border-dim hover:bg-slate-500/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 overflow-hidden">
                                                            {p.photo_url ? <img src={p.photo_url} alt="" /> : <User className="w-full h-full p-2 text-blue-500" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-main">{p.name || (language === 'es' ? 'Anonimo' : 'Anonymous')}</p>
                                                            <p className="text-[10px] text-dim uppercase tracking-widest">ID: {p.session_id.slice(-8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-main">{p.email || 'N/A'}</p>
                                                    <p className="text-[10px] text-dim">{p.phone || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-main font-bold">{new Date(p.last_active).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-dim uppercase">{new Date(p.last_active).toLocaleTimeString()}</p>
                                                </td>
                                                <td className="px-6 py-4 text-dim text-xs">
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-dim">N/A</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                             </table>
                        </div>
                    </div>
                )}

                {/* DASHBOARD TAB - BENTO GRID REDESIGN */}
                {activeTab === 'dashboard' && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(140px,auto)]">
                        
                        {/* 1. Control Center Hero (2x2) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                            className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative rounded-[2rem] overflow-hidden bg-slate-900 text-white shadow-2xl shadow-blue-900/10 flex flex-col justify-between p-8"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(16,185,129,0.1),transparent_50%)]" />
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                            
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="inline-flex flex-col mb-4">
                                        <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter mb-2">{t('control_center')}</h1>
                                        <p className="text-slate-400 font-medium text-sm lg:text-base max-w-[280px]">{t('control_center_desc')}</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 items-center gap-4">
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-blue-400/30 border-dashed" />
                                        <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('system_health_label')}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                                            <span className="text-xs font-bold text-emerald-400 tracking-tight">{t('active_status_label')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex gap-4 mt-8">
                                <button onClick={() => setFilterStatus('Alert')} className="px-5 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-sm tracking-wide hover:bg-red-500/30 transition-colors flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> View Alerts
                                </button>
                                <button onClick={() => setFilterStatus('Transit')} className="px-5 py-3 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-sm tracking-wide hover:bg-white/20 transition-colors">
                                    Track Active
                                </button>
                            </div>
                        </motion.div>

                        {/* 2. Stat Cards (1x1 each) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Package className="w-20 h-20 text-blue-600" /></div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Package className="w-5 h-5" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('total_shipments')}</p>
                            <p className="text-3xl font-display font-bold text-slate-800 tracking-tight">{shipments.length}</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-20 h-20 text-emerald-500" /></div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"><TrendingUp className="w-5 h-5" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('in_transit')}</p>
                            <p className="text-3xl font-display font-bold text-slate-800 tracking-tight">{shipments.filter(s => s.status === 'Transit').length}</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock className="w-20 h-20 text-orange-500" /></div>
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><Clock className="w-5 h-5" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('delayed')}</p>
                            <p className="text-3xl font-display font-bold text-slate-800 tracking-tight">{shipments.filter(s => s.status === 'Delayed' || s.status === 'Alert').length}</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-[2rem] bg-red-50 border border-red-100 shadow-sm p-6 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertTriangle className="w-20 h-20 text-red-600" /></div>
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">{t('spoiled')}</p>
                            <p className="text-3xl font-display font-bold text-red-700 tracking-tight">{shipments.filter(s => s.status === 'Spoiled' || s.status === 'Paused').length}</p>
                        </motion.div>

                        {/* 3. Volume Matrix (2x2) */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="col-span-1 md:col-span-2 row-span-2 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                    {t('volume_matrix')}
                                </h3>
                                <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest uppercase">Live Data</div>
                            </div>
                            <div className="flex-1 flex items-end justify-between gap-2 lg:gap-4 mt-auto">
                                {statusOptions.slice(0, 8).map((status, i) => {
                                    const count = shipments.filter(s => s.status === status).length;
                                    const maxCount = Math.max(...statusOptions.map(opt => shipments.filter(s => s.status === opt).length), 1);
                                    const height = Math.max((count / maxCount) * 100, 12);
                                    return (
                                        <div key={status} className="relative flex-1 group flex flex-col justify-end items-center h-full min-h-[120px]">
                                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white shadow-xl px-2 py-1 rounded-lg border border-slate-100 z-10 pointer-events-none">
                                                {count} {status}
                                            </div>
                                            <motion.div 
                                                initial={{ height: 0 }} 
                                                animate={{ height: `${height}%` }} 
                                                transition={{ duration: 1.5, delay: i * 0.05, type: 'spring', bounce: 0.3 }} 
                                                className={`w-full max-w-[40px] rounded-t-xl relative overflow-hidden ${count > 0 ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-100'}`}
                                            >
                                                {count > 0 && <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />}
                                            </motion.div>
                                            <span className="text-[9px] text-slate-400 mt-3 font-bold uppercase truncate w-full text-center tracking-wider">{getStatusTranslation(status)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* 5. Shipments Table (Full Width) */}
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-full rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-4">
                            <div className="p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1"><Package className="w-5 h-5 text-blue-500" /> {t('live_shipments')}</h3>
                                    <p className="text-sm text-slate-400 font-medium">Manage and monitor all active deliveries in real-time.</p>
                                </div>
                                <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 shadow-inner">
                                    {['All', 'Transit', 'Pending', 'Paused', 'Spoiled', 'Delivered', 'Alert'].map(status => (
                                        <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${filterStatus === status ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                                            {status === 'All' ? t('all_status') : getStatusTranslation(status)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-100">
                                            <th className="px-6 py-4">{t('id_driver')}</th>
                                            <th className="px-6 py-4">{t('route')}</th>
                                            <th className="px-6 py-4">{t('vehicle')}</th>
                                            <th className="px-6 py-4">{t('status')}</th>
                                            <th className="px-6 py-4 text-right">{t('value_label')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence>
                                            {loading ? (
                                                Array.from({ length: 5 }).map((_, i) => (
                                                    <tr key={`skeleton-${i}`}>
                                                        <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                                                        <td className="px-6 py-5"><div className="h-4 w-32 bg-slate-100 rounded animate-pulse" /></td>
                                                        <td className="px-6 py-5"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse" /></td>
                                                        <td className="px-6 py-5"><div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" /></td>
                                                        <td className="px-6 py-5 text-right"><div className="h-4 w-12 bg-slate-100 rounded ml-auto animate-pulse" /></td>
                                                    </tr>
                                                ))
                                            ) : filteredShipments.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">{t('not_found')}</td></tr>
                                            ) : (
                                                filteredShipments.map((shipment) => (
                                                    <motion.tr key={shipment.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => { setSelectedShipment({ ...shipment }); setSaveError(null); }}>
                                                        <td className="px-6 py-5">
                                                            <p className="font-bold text-slate-800 mb-0.5 group-hover:text-blue-500 transition-colors">{shipment.id}</p>
                                                            <p className="text-xs text-slate-400 font-medium">{shipment.driver}</p>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <span className="font-bold text-slate-700">{shipment.origin.split(',')[0]}</span>
                                                                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                                                                <span className="font-bold text-slate-700">{shipment.dest.split(',')[0]}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                                {getVehicleIcon(shipment.vehicle_type, "w-4 h-4")}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                                                ${shipment.status === 'Transit' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                                    shipment.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                                    shipment.status === 'Alert' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                                    shipment.status === 'Spoiled' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                                        'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                                {shipment.status === 'Spoiled' && <Wind className="w-3 h-3 mr-1.5" />}
                                                                {getStatusTranslation(shipment.status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right flex items-center justify-end gap-4">
                                                            <span className="text-sm font-black text-slate-800">{shipment.value}</span>
                                                            <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 flex items-center justify-center shadow-sm transition-all"><ChevronRight className="w-4 h-4" /></button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* SETTINGS TAB (Mobile Only) */}
                {activeTab === 'settings' && (
                    <div className="lg:hidden space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-card border border-dim shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.05]">
                            <Settings className="w-24 h-24 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black text-main mb-8 flex items-center gap-3">
                            <Settings className="w-6 h-6 text-blue-500" />
                            {t('config_label')}
                        </h3>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                                className="w-full flex items-center justify-between p-6 rounded-3xl bg-slate-500/5 border border-dim hover:bg-slate-500/10 transition-all text-main"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                        <Globe className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase text-dim tracking-widest mb-1">{t('language_region')}</p>
                                        <p className="text-lg font-bold">{language === 'es' ? 'Espanol' : 'English'}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-dim" />
                            </button>

                            {/* Settings content without redundant logout */}
                        </div>
                    </div>
                </div>
            )}
            </main>

            {/* REDESIGNED MANAGEMENT MODAL */}
            <AnimatePresence>
                {selectedShipment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-bg-app/80 backdrop-blur-md " onClick={() => setSelectedShipment(null)} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="relative w-full max-w-4xl bg-card border border-dim rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Left Side: Controls */}
                            <div className="w-full p-6 overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-main flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-blue-500" />
                                        {t('manage')}
                                    </h3>
                                    <button onClick={() => setSelectedShipment(null)} className="text-dim hover:text-main p-2 hover:bg-slate-500/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl bg-slate-500/10  border border-dim space-y-4">
                                        <div className="flex items-center gap-3 mb-2 pb-3 border-b border-dim/50">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                {getVehicleIcon(selectedShipment.vehicle_type, "w-5 h-5 text-blue-500")}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-dim uppercase tracking-[0.2em] mb-0.5">{t('shipment_id_label')}</p>
                                                <span className="text-sm font-black text-main tracking-tight uppercase">{selectedShipment.id}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] text-dim uppercase font-black tracking-widest mb-1">{t('full_name')}</p>
                                                <p className="text-sm font-bold text-main truncate">{selectedShipment.sender_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-dim uppercase font-black tracking-widest mb-1">{t('phone')}</p>
                                                <p className="text-sm font-bold text-main">{selectedShipment.sender_phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-slate-500/5 border border-dim space-y-4">
                                        <p className="text-[10px] font-black text-dim uppercase tracking-[0.2em] mb-2">{t('sender_contact_label')}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input 
                                                    type="text" 
                                                    value={selectedShipment.sender_name || ''} 
                                                    onChange={(e) => setSelectedShipment({ ...selectedShipment, sender_name: e.target.value })} 
                                                    placeholder={t('full_name')}
                                                    className="w-full bg-slate-500/5 border border-dim rounded-xl px-4 py-3 text-sm font-bold text-main focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <input 
                                                    type="text" 
                                                    value={selectedShipment.sender_phone || ''} 
                                                    onChange={(e) => setSelectedShipment({ ...selectedShipment, sender_phone: e.target.value })} 
                                                    placeholder={t('phone')}
                                                    className="w-full bg-slate-500/5 border border-dim rounded-xl px-4 py-3 text-sm font-bold text-main focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-full">
                                                <input 
                                                    type="email" 
                                                    value={selectedShipment.sender_email || ''} 
                                                    onChange={(e) => setSelectedShipment({ ...selectedShipment, sender_email: e.target.value })} 
                                                    placeholder="Email"
                                                    className="w-full bg-slate-500/5 border border-dim rounded-xl px-4 py-3 text-sm font-bold text-main focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-slate-500/5 border border-dim space-y-4">
                                        <p className="text-[10px] font-black text-dim uppercase tracking-[0.2em] mb-2">{t('cargo_details_label')}</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[9px] font-black text-dim uppercase tracking-wider mb-1">Poids (KG)</label>
                                                <input 
                                                    type="number" 
                                                    value={selectedShipment.weight || ''} 
                                                    onChange={(e) => setSelectedShipment({ ...selectedShipment, weight: Number(e.target.value) })} 
                                                    className="w-full bg-slate-500/5 border border-dim rounded-xl px-4 py-3 text-sm font-bold text-main focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black text-dim uppercase tracking-wider mb-1">Type</label>
                                                <select 
                                                    value={selectedShipment.cargo_type || 'Electronics'} 
                                                    onChange={(e) => setSelectedShipment({ ...selectedShipment, cargo_type: e.target.value })} 
                                                    className="w-full bg-slate-500/5 border border-dim rounded-xl px-4 py-3 text-sm font-bold text-main focus:border-blue-500 outline-none "
                                                >
                                                    <option value="Electronics">Electronics</option>
                                                    <option value="Medical">Medical</option>
                                                    <option value="Industrial">Industrial</option>
                                                    <option value="Luxury">Luxury Goods</option>
                                                </select>
                                            </div>
                                            <div className="col-span-full">
                                                <label className="block text-[9px] font-black text-dim uppercase tracking-wider mb-1">Dimensions (LxWxH)</label>
                                                <input 
                                                    type="text" 
                                                    value={selectedShipment.dimensions || ''} 
                                                    onChange={(e) => setSelectedShipment({ ...selectedShipment, dimensions: e.target.value })} 
                                                    placeholder="120x80x100"
                                                    className="w-full bg-slate-500/5 border border-dim rounded-xl px-4 py-3 text-sm font-bold text-main focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-dim uppercase tracking-[0.2em] mb-3">{t('status')}</label>
                                        <select 
                                            value={selectedShipment.status} 
                                            onChange={(e) => setSelectedShipment({ ...selectedShipment, status: e.target.value as any })} 
                                            className="w-full bg-slate-500/5 border border-dim rounded-2xl px-5 py-4 text-sm font-black text-main focus:outline-none focus:border-blue-500 outline-none  shadow-inner transition-all"
                                        >
                                            {statusOptions.map(s => (
                                                <option key={s} value={s} className="bg-card text-main font-bold">
                                                    {s === 'Spoiled' ? 'ðŸ’¨ ' + t('spoiled_status') : getStatusTranslation(s)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-500/5 border border-dim rounded-2xl">
                                        <div>
                                            <p className="text-[10px] font-black text-dim uppercase tracking-widest">{t('hazardous_materials_label')}</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedShipment({ ...selectedShipment, hazardous: !selectedShipment.hazardous })}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${selectedShipment.hazardous ? 'bg-red-500' : 'bg-dim/30'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: selectedShipment.hazardous ? 26 : 2 }}
                                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                            />
                                        </button>
                                    </div>

                                    {/* Optional Arrival Date */}
                                    <div className="p-5 rounded-2xl bg-slate-500/5 border border-dim space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-dim uppercase tracking-widest">{t('est_arrival_date_label')}</p>
                                                <p className="text-[9px] text-dim/60 mt-0.5">{t('optional_arrival')}</p>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedShipment({ ...selectedShipment, estimated_arrival: selectedShipment.estimated_arrival ? undefined : new Date().toISOString().split('T')[0] })}
                                                className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${selectedShipment.estimated_arrival ? 'bg-blue-500' : 'bg-dim/30'}`}
                                            >
                                                <motion.div 
                                                    animate={{ x: selectedShipment.estimated_arrival ? 26 : 2 }}
                                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                                />
                                            </button>
                                        </div>
                                        {selectedShipment.estimated_arrival && (
                                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                                                <input
                                                    type="date"
                                                    value={selectedShipment.estimated_arrival}
                                                    onChange={(e) => setSelectedShipment({ ...selectedShipment, estimated_arrival: e.target.value })}
                                                    className="w-full bg-bg-app border border-blue-500/40 rounded-xl px-4 py-3 text-sm font-bold text-main focus:border-blue-500 outline-none  shadow-inner"
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-dim uppercase tracking-[0.2em] mb-3">{t('vehicle_type_label')}</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {['ground', 'air', 'sea'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setSelectedShipment({ ...selectedShipment, vehicle_type: type as any })}
                                                    className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${selectedShipment.vehicle_type === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 z-10' : 'bg-slate-500/5 border-dim text-dim hover:text-main hover:border-slate-500/20'}`}
                                                >
                                                    {getVehicleIcon(type, "w-6 h-6")}
                                                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">{type === 'ground' ? 'Terre' : type === 'air' ? 'Air' : 'Mer'}</span>
                                                </button>
                                            ))}
                                            <div className="py-4 rounded-2xl border-2 border-dim text-dim bg-slate-500/5 flex flex-col items-center justify-center gap-2">
                                                <ChevronDown className="w-6 h-6" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{language === 'es' ? 'Plus' : 'More'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5 border-t border-dim pt-5">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[11px] font-black text-dim uppercase tracking-[0.1em]">{t('progress_label')}</label>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-black text-blue-500 tracking-tighter">{selectedShipment.progress}%</span>
                                                <button 
                                                    onClick={() => handleToggleSimulation(selectedShipment.id)}
                                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${simulatingId === selectedShipment.id ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-slate-500/10 text-dim border border-dim hover:bg-slate-500/20'}`}
                                                >
                                                    {simulatingId === selectedShipment.id ? (language === 'es' ? 'Stop' : 'Stop') : (language === 'es' ? 'Go Sim' : 'Go Sim')}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="px-2">
                                            <input type="range" min="0" max="100" value={selectedShipment.progress} onChange={(e) => setSelectedShipment({ ...selectedShipment, progress: parseInt(e.target.value) })} className="w-full accent-blue-600 h-2 bg-slate-500/10 rounded-full appearance-none cursor-pointer" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-dim uppercase tracking-widest mb-2">{t('msg_to_recipient')}</label>
                                        <textarea value={selectedShipment.admin_message || ''} onChange={(e) => setSelectedShipment({ ...selectedShipment, admin_message: e.target.value })} placeholder={language === 'es' ? 'Mensaje importante...' : 'Important update...'} className="w-full bg-slate-500/5 border border-dim rounded-xl px-4 py-3 text-sm font-medium text-main focus:border-blue-500 resize-none h-24 outline-none placeholder:text-dim/50"></textarea>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-dim flex gap-3">
                                    <button onClick={() => setSelectedShipment(null)} className="flex-1 px-4 py-3 rounded-xl font-bold text-dim hover:text-main hover:bg-slate-500/5 transition-colors border border-dim text-sm">{t('cancel')}</button>
                                    <button onClick={handleSaveShipment} disabled={saving} className="flex-[2] px-4 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        {t('save_db')}
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: LIVE PREVIEW - HIDDEN ON MOBILE */}
                            <div className="hidden">
                                <div className="p-6 border-b border-dim bg-card/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase text-dim tracking-widest">{t('live_preview_label')}</span>
                                    </div>
                                    <button onClick={() => setSelectedShipment(null)} className="hidden lg:block text-dim hover:text-main transition-colors"><X className="w-6 h-6" /></button>
                                </div>

                                <div className="flex-1 p-4 lg:p-10 overflow-y-auto space-y-10 scale-[0.9] lg:scale-1 origin-top">
                                    {/* MIRRORING TrackingView Summary Bar */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-5 rounded-2xl bg-card border border-dim shadow-sm flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-dim uppercase tracking-wider">{t('status')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedShipment.status === 'Transit' ? 'bg-blue-500' : selectedShipment.status === 'Delivered' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                                <span className="text-sm font-black text-main">{getStatusTranslation(selectedShipment.status)}</span>
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-card border border-dim shadow-sm flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-dim uppercase tracking-wider">{t('progress_label')}</span>
                                            <span className="text-sm font-black text-main">{selectedShipment.progress}%</span>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-card border border-dim shadow-sm flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-dim uppercase tracking-wider">{t('vehicle_type_label')}</span>
                                            <div className="flex items-center gap-2 text-main font-black">
                                                {getVehicleIcon(selectedShipment.vehicle_type, "w-4 h-4 text-blue-600")}
                                                <span className="text-sm uppercase tracking-tighter">{selectedShipment.vehicle_type === 'ground' ? 'Truck' : selectedShipment.vehicle_type === 'air' ? 'Air' : 'Ship'}</span>
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-card border border-dim shadow-sm flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-dim uppercase tracking-wider">{t('est_arrival_short')}</span>
                                            <span className={`text-sm font-black ${selectedShipment.estimated_arrival ? 'text-blue-500' : 'text-dim'}`}>
                                                {selectedShipment.estimated_arrival 
                                                    ? new Date(selectedShipment.estimated_arrival).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' })
                                                    : '---'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Line Mirror */}
                                    <div className="bg-card rounded-[2.5rem] p-8 border border-dim shadow-xl relative overflow-hidden">
                                        <div className="flex justify-between mb-12 relative z-10 px-2 lg:px-4">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-blue-600/10 border-2 border-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                                                    <Package className="w-5 h-5 lg:w-7 lg:h-7 text-blue-600 font-black" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-main">{selectedShipment.origin?.split(',')[0] || t('origin')}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all ${selectedShipment.progress >= 100 ? 'bg-emerald-600 border-2 border-emerald-600 shadow-emerald-500/20' : 'bg-slate-500/5 border-2 border-dim shadow-inner'} shadow-lg`}>
                                                    <MapPin className={`w-5 h-5 lg:w-7 lg:h-7 ${selectedShipment.progress >= 100 ? 'text-white' : 'text-dim'}`} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-main">{selectedShipment.dest?.split(',')[0] || t('destination')}</span>
                                            </div>
                                        </div>

                                        <div className="relative h-2.5 lg:h-3.5 bg-slate-500/10 rounded-full mx-6 lg:mx-10 mb-8 overflow-visible ring-1 ring-slate-500/5">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${selectedShipment.progress}%` }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer bg-[length:200%_100%]" />
                                            </motion.div>
                                            <motion.div 
                                                animate={{ left: `${selectedShipment.progress}%` }} 
                                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                                            >
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-40 animate-pulse scale-150" />
                                                    <div className="relative w-8 h-8 lg:w-11 lg:h-11 bg-white  rounded-full border-4 border-blue-600 shadow-xl flex items-center justify-center -rotate-12 transform hover:rotate-0 transition-transform">
                                                        {getVehicleIcon(selectedShipment.vehicle_type, "w-4 h-4 lg:w-5 lg:h-5 text-blue-600")}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Admin Message Mirror */}
                                    {selectedShipment.admin_message && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 group-hover:from-blue-600/15 group-hover:to-indigo-600/15 transition-all" />
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600" />
                                            <div className="p-6 flex gap-4 items-start relative z-10">
                                                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                                    <Info className="w-5 h-5 font-black" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-blue-600  tracking-widest mb-1">{t('carrier_update_label')}</p>
                                                    <p className="text-sm font-bold text-main leading-relaxed italic">"{selectedShipment.admin_message}"</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Premium Fixed Mobile Nav - Non-Floating */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-2xl border-t border-dim px-2 pt-2 pb-6 flex justify-around items-center z-50">
                <AdminNavItem 
                    icon={<LayoutDashboard className="w-6 h-6" />} 
                    label={language === 'es' ? 'Panel' : 'Dash'} 
                    active={activeTab === 'dashboard'} 
                    onClick={() => setActiveTab('dashboard')} 
                />
                <AdminNavItem 
                    icon={<TrendingUp className="w-6 h-6" />} 
                    label={language === 'es' ? 'Stats' : 'Analytic'} 
                    active={activeTab === 'analytics'} 
                    onClick={() => setActiveTab('analytics')} 
                />
                
                {/* Center "Add" Button */}
                <div className="relative -top-6">
                    <button 
                        onClick={() => onNavigate('shipment')}
                        className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40 border-4 border-bg-app scale-110 active:scale-95 transition-all"
                    >
                        <Plus className="w-7 h-7 font-black" />
                    </button>
                </div>

                <AdminNavItem 
                    icon={<Settings className="w-6 h-6" />} 
                    label={language === 'es' ? 'Ajustes' : 'Settings'} 
                    active={activeTab === 'settings'} 
                    onClick={() => setActiveTab('settings')} 
                />
            </nav>
        </div>
    );
}




