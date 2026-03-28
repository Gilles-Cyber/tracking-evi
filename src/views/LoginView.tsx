import { useState, useEffect } from 'react';
import { Globe, Eye, EyeOff, ArrowRight, Fingerprint, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export function LoginView({ onNavigate }: { onNavigate: (page: Page) => void }) {
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authStep, setAuthStep] = useState(0);

    const handleLogin = () => {
        setIsAuthenticating(true);
        // Simulate auth steps
        setTimeout(() => setAuthStep(1), 800); // Verifying credentials
        setTimeout(() => setAuthStep(2), 1600); // 2FA check
        setTimeout(() => {
            onNavigate('home');
        }, 2200);
    };

    return (
        <div className="relative flex min-h-screen bg-bg-app font-sans overflow-hidden text-main">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <main className="relative z-10 flex-1 flex flex-col justify-center items-center w-full max-w-md mx-auto p-6 sm:p-8">

                <AnimatePresence mode="wait">
                    {!isAuthenticating ? (
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="w-full space-y-8"
                        >
                            <div className="text-center group">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(59,130,246,0.5)] border border-white/20"
                                >
                                    <Globe className="w-12 h-12 text-white" />
                                </motion.div>
                                <h1 className="text-4xl font-black tracking-tighter text-main mb-2">Evri</h1>
                                <p className="text-blue-500  font-medium tracking-wide font-bold">{t('secure_logistics')}</p>
                            </div>

                            <div className="bg-card/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-dim shadow-2xl space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5 focus-within:text-blue-500 text-dim transition-colors">
                                        <label className="text-[10px] font-bold uppercase tracking-widest ml-1">{t('official_email')}</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="jean.durand@premium.com"
                                                className="w-full bg-bg-app/50 border border-dim rounded-2xl px-5 py-4 text-sm focus:border-blue-500 focus:bg-card outline-none transition-all text-main placeholder:text-dim/50 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 focus-within:text-blue-500 text-dim transition-colors">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest">{t('access_code')}</label>
                                            <button className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">{t('forgot_code')}</button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••••••••••"
                                                className="w-full bg-bg-app/50 border border-dim rounded-2xl px-5 py-4 text-sm focus:border-blue-500 focus:bg-card outline-none transition-all text-main placeholder:text-dim/50 font-mono tracking-widest shadow-inner"
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-dim hover:text-main transition-colors p-1"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogin}
                                    className="w-full flex items-center justify-between bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] group"
                                >
                                    <span className="tracking-widest uppercase text-sm">{t('unlock')}</span>
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white text-white group-hover:text-blue-600 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </motion.button>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <div className="h-px flex-1 bg-dim/10"></div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-dim">{t('or_use')}</span>
                                <div className="h-px flex-1 bg-dim/10"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogin} className="flex items-center justify-center gap-2 bg-card/40 border border-dim rounded-2xl py-4 hover:bg-slate-500/10 transition-all backdrop-blur-md">
                                    <Fingerprint className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-main">{t('biometrics')}</span>
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogin} className="flex items-center justify-center gap-2 bg-card/40 border border-dim rounded-2xl py-4 hover:bg-slate-500/10 transition-all backdrop-blur-md">
                                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-main">{t('hardware_key')}</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="auth-loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center space-y-8"
                        >
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Simulated biometric scanning animation */}
                                <motion.div
                                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-transparent border-t-emerald-400 opacity-80"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-2 rounded-full border-b-2 border-l-2 border-transparent border-b-blue-500 opacity-60"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <Fingerprint className="w-12 h-12 text-main/80" />
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-main font-bold text-xl tracking-tight">{t('authenticating')}</h3>
                                <div className="h-4 relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {authStep === 0 && <motion.p key="step0" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="text-blue-500 text-sm font-mono absolute inset-0 text-center">{t('secure_link')}</motion.p>}
                                        {authStep === 1 && <motion.p key="step1" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="text-emerald-500 text-sm font-mono absolute inset-0 text-center">{t('verifying_creds')}</motion.p>}
                                        {authStep === 2 && <motion.p key="step2" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="text-indigo-500 text-sm font-mono absolute inset-0 text-center">{t('decrypting_token')}</motion.p>}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
