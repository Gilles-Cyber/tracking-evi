import { ReactNode } from 'react';
import { motion } from 'motion/react';

export function MapButton({ icon }: { icon: ReactNode }) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-slate-950/80 backdrop-blur-md p-2 rounded-full text-white hover:bg-slate-900 transition-all shadow-lg border border-white/20"
        >
            <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
        </motion.button>
    );
}
