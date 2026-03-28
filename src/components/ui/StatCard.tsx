import { ReactNode } from 'react';
import { motion } from 'motion/react';

export function StatCard({ icon, title, value }: { icon: ReactNode, title: string, value: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-2xl border border-dim shadow-sm flex items-center gap-4"
        >
            <div className="bg-blue-500/10 p-3 rounded-xl">{icon}</div>
            <div>
                <p className="text-xs text-dim uppercase tracking-widest font-bold">{title}</p>
                <p className="text-lg font-black text-main">{value}</p>
            </div>
        </motion.div>
    );
}
