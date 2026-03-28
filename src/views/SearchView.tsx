import { useState } from 'react';
import { Scan, ArrowRight, Globe, ArrowLeft, Package, Truck, Ship, Plane, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Page, Shipment } from '../types';
import Logo from '../components/ui/Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchViewProps {
    onNavigate: (page: Page) => void;
    onLogoClick: () => void;
    onTrack: (id: string) => void;
    shipments: Shipment[];
    notFoundError?: boolean;
}

export function SearchView({ onNavigate, onLogoClick, onTrack, shipments, notFoundError }: SearchViewProps) {
    const [searchInput, setSearchInput] = useState('');
    const { t, language, toggleLanguage } = useLanguage();

    const trackingPlaceholder = language === 'fr' ? 'Entrez votre code de suivi' : 'Enter your tracking code';

    const laneItems = [
        { label: language === 'fr' ? 'Electronics' : 'Electronics', eta: 'ETA 2h', icon: Package },
        { label: language === 'fr' ? 'Camions express' : 'Express trucks', eta: 'ETA 5h', icon: Truck },
        { label: language === 'fr' ? 'Fret maritime' : 'Sea freight', eta: 'ETA 18h', icon: Ship },
        { label: language === 'fr' ? 'Cargo aerien' : 'Air cargo', eta: 'ETA 9h', icon: Plane },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans transition-colors duration-300 selection:bg-blue-500/30 text-main">
            <header className="flex items-center justify-between px-4 md:px-10 py-4 border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
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
                        <span className="font-extralight text-xl tracking-tight text-main hidden sm:block uppercase">
                            <span className="font-bold text-blue-600">Evri</span>
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
                        <span className="text-[10px] font-bold uppercase hidden md:block">{language === 'en' ? 'FR' : 'EN'}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 py-8 md:py-12 relative z-10 w-full max-w-6xl mx-auto">
                <div className="w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F72A6] to-[#1E88C8] border border-[#0F72A6] shadow-[0_20px_70px_rgba(15,114,166,0.22)] px-5 md:px-10 py-8 md:py-12 text-white"
                    >
                        <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-white/20 blur-2xl"></div>
                        <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-[#7AD3FF]/20 blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/30 mb-6 md:mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {language === 'fr' ? 'Choisissez Evri' : 'Choose Evri'}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-[1.05]">
                                {language === 'fr' ? 'Suivi premium' : 'Stunning tracking'}
                                <br />
                                <span className="text-[#DDF3FF]">{language === 'fr' ? 'pour chaque livraison' : 'for every delivery'}</span>
                            </h1>
                            <p className="text-sm md:text-base text-white/85 mb-8 max-w-2xl leading-relaxed">
                                {language === 'fr'
                                    ? "Entrez votre code Evri pour voir l'itineraire, le vehicule et les mises a jour en temps reel."
                                    : 'Enter your Evri code to instantly view route, vehicle and live delivery status.'}
                            </p>

                            <div className="w-full bg-white p-2 md:p-3 rounded-[1.5rem] border border-white/70 shadow-xl">
                                <form
                                    className="flex flex-col sm:flex-row gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (searchInput.trim()) {
                                            onTrack(searchInput.trim());
                                        }
                                    }}
                                >
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#1E88C8] group-focus-within:text-[#0F72A6] transition-colors">
                                            <Scan className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="w-full bg-[#F2F2F2] border-0 focus:ring-2 focus:ring-[#1E88C8]/40 rounded-2xl py-5 md:py-6 pl-14 pr-4 text-[#333333] placeholder:text-[#A0A0A0] font-bold tracking-wide text-sm md:text-base outline-none transition-all"
                                            placeholder={trackingPlaceholder}
                                            type="text"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-[#0F72A6] hover:bg-[#1E88C8] text-white font-extrabold tracking-widest uppercase text-sm px-8 py-5 md:py-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg border border-[#0F72A6] group overflow-hidden relative"
                                        type="submit"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                                        <span className="relative">{t('initialize')}</span>
                                        <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </form>
                            </div>

                            <div className="mt-6 overflow-hidden rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm">
                                <motion.div
                                    animate={{ x: ['0%', '-50%'] }}
                                    transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                                    className="flex w-max"
                                >
                                    {[...laneItems, ...laneItems].map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={`${item.label}-${index}`} className="flex items-center gap-3 px-4 py-3 border-r border-white/20 min-w-[220px]">
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-wider">{item.label}</p>
                                                    <p className="text-[10px] text-white/80">{item.eta}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {notFoundError && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center"
                        >
                            {t('not_found_code')}
                        </motion.div>
                    )}

                    <div className="mt-6 rounded-2xl border border-[#1E88C8]/20 bg-[#F2F2F2] p-6">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0F72A6] mb-4">
                            {language === 'fr' ? 'Pourquoi Evri' : 'Why Evri'}
                        </p>
                        <div className="grid gap-3 md:grid-cols-3">
                            {[t('superior_speed'), t('global_reach'), t('enhanced_security')].map((point) => (
                                <div key={point} className="flex items-center gap-2 text-[#333333] text-sm font-semibold">
                                    <CheckCircle2 className="w-4 h-4 text-[#1E88C8]" />
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
