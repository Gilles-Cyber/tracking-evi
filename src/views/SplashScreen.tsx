import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import Logo from '../components/ui/Logo';
import { useLanguage } from '../contexts/LanguageContext';

export function SplashScreen() {
    const { t } = useLanguage();
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 800);
        const t2 = setTimeout(() => setPhase(2), 2000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
        >
            {/* Elegant Background Accents */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,114,166,0.03),transparent_50%),radial-gradient(circle_at_50%_100%,rgba(15,114,166,0.03),transparent_50%)]" />
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(#0F72A6 1px, transparent 1px), linear-gradient(90deg, #0F72A6 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

            <div className="relative flex items-center justify-center mb-16">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.02, 1] }}
                    transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                    className="absolute w-56 h-56 rounded-full border border-slate-100 shadow-[0_0_60px_rgba(15,114,166,0.05)]"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute w-40 h-40 rounded-full border border-dashed border-slate-200"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                >
                    <Logo size={80} />
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center z-10 flex flex-col items-center"
            >
                <div className="overflow-hidden mb-6">
                    <motion.h1 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-4xl font-display font-bold tracking-tighter text-slate-800"
                    >
                        Evri
                    </motion.h1>
                </div>
            </motion.div>

            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-[2px] bg-slate-100 rounded-full mt-16 overflow-hidden z-10 relative"
            >
                <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                />
            </motion.div>
        </motion.div>
    );
}
