import { ArrowLeft, Globe, Zap, HelpCircle, ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export function SettingsView({ onNavigate }: { onNavigate: (page: Page) => void }) {
    const { t, language, setLanguage } = useLanguage();

    return (
        <div className="flex flex-col min-h-screen bg-bg-app font-sans pb-24 text-main selection:bg-blue-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[120px]"></div>
            </div>

            <header className="flex items-center p-6 border-b border-dim sticky top-0 bg-bg-app/80 backdrop-blur-xl z-20">
                <button
                    onClick={() => onNavigate('profile')}
                    className="p-2 text-dim hover:text-main hover:bg-slate-500/5 rounded-full transition-colors border border-transparent hover:border-dim"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="flex-1 text-center font-black text-xl tracking-tight">{t('settings_title')}</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 p-4 sm:p-6 space-y-8 max-w-2xl mx-auto w-full relative z-10">
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" /> {t('preferences_app')}
                    </h3>
                    <div className="bg-card backdrop-blur-xl rounded-3xl border border-dim shadow-sm overflow-hidden divide-y divide-dim">
                        <SettingRow
                            icon={<Globe />}
                            label={t('language_region')}
                            action={
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLanguage(language === 'en' ? 'fr' : 'en');
                                    }}
                                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    {language === 'en' ? 'English (EN)' : 'Français (FR)'}
                                </button>
                            }
                            onClick={() => { }}
                        />
                        <SettingRow
                            icon={<Zap />}
                            label={t('appearance')}
                            action={<span className="text-xs font-bold text-blue-600 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-500/30">{t('dark_mode')}</span>}
                            onClick={() => { }}
                        />
                        <SettingRow
                            icon={<HelpCircle />}
                            label={t('about_legal')}
                            action={<span className="text-[10px] font-mono font-bold text-dim bg-slate-500/5 px-2 py-1 rounded border border-dim uppercase">v4.2.0-EVR</span>}
                            onClick={() => { }}
                        />
                    </div>
                </section>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate('login')}
                    className="w-full flex items-center justify-center gap-2 p-4 mt-8 bg-gradient-to-r from-red-600/10 to-transparent border border-red-500/20 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 hover:border-red-500/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                >
                    <LogOut className="w-5 h-5" /> {t('secure_logout')}
                </motion.button>
            </main>
        </div>
    );
}

function SettingRow({ icon, label, desc, action, onClick }: any) {
    const isInteractive = !!onClick;
    const content = (
        <div className={`flex items-center justify-between p-4 ${isInteractive ? 'hover:bg-slate-500/5 cursor-pointer active:bg-slate-500/10' : ''} transition-colors group relative overflow-hidden`}>
            {isInteractive && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-2.5 rounded-xl bg-slate-500/5 text-dim group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors border border-dim">
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-main">{label}</span>
                    {desc && <span className="text-[11px] font-medium text-dim mt-0.5">{desc}</span>}
                </div>
            </div>
            <div className="relative z-10">
                {action ? action : isInteractive && <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />}
            </div>
        </div>
    );

    return isInteractive ? <div onClick={onClick} className="block">{content}</div> : content;
}
