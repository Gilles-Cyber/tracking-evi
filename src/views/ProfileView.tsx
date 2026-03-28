import { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
    ArrowLeft, Settings, History, Headphones, ChevronRight,
    User, Package, Navigation, Camera, Save, Loader2, Trash2, X, Edit3, MapPin, Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Shipment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
    onNavigate: (page: Page) => void;
    sessionId?: string;
    shipments?: Shipment[];
}

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    photo_url?: string;
}

export function ProfileView({ onNavigate, sessionId, shipments = [] }: ProfileViewProps) {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', phone: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!sessionId) { setLoading(false); return; }
            try {
                const { data, error } = await supabase
                    .from('profiles').select('*').eq('session_id', sessionId).single();
                if (error && error.code !== 'PGRST116') throw error;
                if (data) setProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '', photo_url: data.photo_url });
            } catch (err) { console.error('Error fetching profile:', err); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [sessionId]);

    const handleSave = async () => {
        if (!sessionId) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').upsert(
                { session_id: sessionId, ...profile, last_active: new Date().toISOString() },
                { onConflict: 'session_id' }
            );
            if (error) throw error;
            setShowModal(false);
        } catch (err) { console.error('Error saving profile:', err); }
        finally { setSaving(false); }
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !sessionId) return;
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${sessionId}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('profile-photos').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
            setProfile(prev => ({ ...prev, photo_url: publicUrl }));
            await supabase.from('profiles').upsert(
                { session_id: sessionId, ...profile, photo_url: publicUrl, last_active: new Date().toISOString() },
                { onConflict: 'session_id' }
            );
        } catch (err) { console.error('Error uploading image:', err); alert(t('upload_error')); }
        finally { setUploading(false); }
    };

    const handleResetProfile = async () => {
        if (!sessionId || !confirm(t('delete_confirm'))) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').delete().eq('session_id', sessionId);
            if (error) throw error;
            setProfile({ name: '', email: '', phone: '', photo_url: undefined });
            setShowModal(false);
        } catch (err) { console.error('Error deleting profile:', err); }
        finally { setSaving(false); }
    };

    const quickLinks = [
        { icon: Navigation, label: t('tracking'), color: 'text-blue-500', bg: 'bg-blue-50', onClick: () => onNavigate('search') },
        { icon: Package, label: t('ship'), color: 'text-indigo-500', bg: 'bg-indigo-50', onClick: () => onNavigate('shipment') },
        { icon: History, label: t('history_title'), color: 'text-violet-500', bg: 'bg-violet-50', onClick: () => onNavigate('historique') },
        { icon: Headphones, label: t('support_protocol'), color: 'text-emerald-500', bg: 'bg-emerald-50', onClick: () => onNavigate('support') },
    ];

    const menuItems = [
        { icon: History, label: t('historique_label'), sub: t('history_title'), onClick: () => onNavigate('history') },
        { icon: Settings, label: t('settings'), sub: t('settings'), onClick: () => onNavigate('settings') },
    ];

    const displayName = profile.name || t('client_session');
    const initials = displayName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || 'E';

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-slate-900 font-sans">
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />

            {/* Sticky Header */}
            <header className="flex items-center bg-white/90 px-4 py-3 sticky top-0 z-50 border-b border-slate-100 backdrop-blur-xl">
                <button onClick={() => onNavigate('home')} className="text-slate-500 hover:text-slate-900 flex size-10 shrink-0 items-center justify-center transition-colors rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-slate-900 text-base font-black flex-1 text-center tracking-tight">{t('profile')}</h1>
                <button onClick={() => onNavigate('settings')} className="text-slate-500 hover:text-slate-900 flex size-10 items-center justify-center transition-colors rounded-full hover:bg-slate-100">
                    <Settings className="w-5 h-5" />
                </button>
            </header>

            <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-8 pb-28 space-y-6">

                {/* ── Hero card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/20"
                >
                    {/* Blobs */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-400/20 pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-5">
                        {/* Avatar */}
                        <div
                            className="relative group cursor-pointer shrink-0"
                            onClick={() => !uploading && fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center border-2 border-white/30 shadow-lg">
                                {uploading ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : profile.photo_url ? (
                                    <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-black text-white">{initials}</span>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Name & info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-black tracking-tight truncate">{displayName}</h2>
                            <div className="flex flex-col gap-0.5 mt-1.5">
                                {profile.email && (
                                    <p className="text-xs text-white/75 font-medium flex items-center gap-1.5 truncate">
                                        <Mail className="w-3 h-3 shrink-0" /> {profile.email}
                                    </p>
                                )}
                                {profile.phone && (
                                    <p className="text-xs text-white/75 font-medium flex items-center gap-1.5">
                                        <Phone className="w-3 h-3 shrink-0" /> {profile.phone}
                                    </p>
                                )}
                                {!profile.email && !profile.phone && (
                                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                                        ID: {sessionId?.slice(-8).toUpperCase() || 'EVR-USER'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Edit button */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="shrink-0 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center transition-all"
                        >
                            <Edit3 className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
                        {[
                            { label: t('shipments'), value: shipments.length },
                            { label: t('transit'), value: shipments.filter(s => s.status === 'Transit').length },
                            { label: t('delivered'), value: shipments.filter(s => s.status === 'Delivered').length },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/15 rounded-2xl px-3 py-2.5 text-center border border-white/20">
                                <p className="text-xl font-black leading-none">{stat.value}</p>
                                <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Quick access grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">{t('quick_access')}</p>
                    <div className="grid grid-cols-4 gap-3">
                        {quickLinks.map((link, i) => {
                            const Icon = link.icon;
                            return (
                                <motion.button
                                    key={i}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={link.onClick}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${link.color}`} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider text-center leading-tight">{link.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── Recent shipments ── */}
                {shipments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14 }}
                    >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">{t('recent_shipments')}</p>
                        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-50">
                            {shipments.slice(0, 3).map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => onNavigate('tracking' as Page)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Package className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-900 truncate">{s.id}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3" /> {s.origin} → {s.dest}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                        s.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                        s.status === 'Transit' ? 'bg-blue-50 text-blue-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>{s.status}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Menu items ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">{t('account')}</p>
                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-50">
                        {menuItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={i}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                                        <Icon className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-[15px] text-slate-800">{item.label}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.25em] pb-2">
                    Evri Logistics · v4.2.0
                </p>
            </main>

            {/* ── Edit Profile Modal ── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                            onClick={() => !saving && setShowModal(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="relative w-full max-w-lg bg-white border border-slate-100 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-7 space-y-6">
                                {/* Modal header */}
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('profile_details')}</h3>
                                    <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Avatar picker */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-blue-50 shrink-0 flex items-center justify-center border border-slate-100">
                                        {uploading ? (
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        ) : profile.photo_url ? (
                                            <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-blue-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{profile.name || t('client_session')}</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 mt-0.5"
                                        >
                                            {t('change_photo')}
                                        </button>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="space-y-4">
                                    {[
                                        { label: t('full_name'), key: 'name' as const, type: 'text', placeholder: 'John Doe' },
                                        { label: t('email_address'), key: 'email' as const, type: 'email', placeholder: 'john@example.com' },
                                        { label: t('phone_number'), key: 'phone' as const, type: 'tel', placeholder: '+1 234 567 890' },
                                    ].map(field => (
                                        <div key={field.key} className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={profile[field.key]}
                                                onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 font-semibold focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="space-y-2.5 pt-1">
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleSave}
                                        disabled={saving || uploading}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {t('save_changes')}
                                    </motion.button>
                                    <button
                                        onClick={handleResetProfile}
                                        disabled={saving || uploading}
                                        className="w-full py-3 text-red-500 hover:bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> {t('delete_profile')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
