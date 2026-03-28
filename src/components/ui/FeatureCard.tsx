import { ReactNode } from 'react';
import { motion } from 'motion/react';

export function FeatureCard({ icon, title, desc }: { icon: ReactNode, title: string, desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-card border border-dim shadow-[0_10px_30px_rgba(0,0,0,0.05)]  text-left hover:bg-slate-500/5 transition-all group backdrop-blur-md"
        >
            <div className="text-blue-500 mb-4 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300">{icon}</div>
            <h3 className="text-main font-extrabold mb-1.5 tracking-wide">{title}</h3>
            <p className="text-sm text-dim font-light leading-relaxed">{desc}</p>
        </motion.div>
    );
}
