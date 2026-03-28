import React, { useId } from 'react';
import { motion } from 'motion/react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, showText = false, light = false }) => {
    // useId ensures each Logo instance has unique SVG gradient IDs — prevents ID conflicts
    const uid = useId().replace(/:/g, '');
    const gradMain = `lg_main_${uid}`;
    const gradArrow = `lg_arrow_${uid}`;
    const filtShadow = `lg_shadow_${uid}`;

    // Colors
    const barColorA = light ? "#FFFFFF" : "#3B82F6";   // blue-500 / white
    const barColorB = light ? "#CBD5E1" : "#1D4ED8";   // slate-300 / blue-700
    const arrowColorA = light ? "rgba(255,255,255,0.55)" : "#60A5FA"; // blue-400
    const arrowColorB = light ? "#FFFFFF" : "#2563EB"; // white / blue-600
    const shadowFlood = light ? "#000" : "#1E40AF";
    const shadowOpacity = light ? "0.12" : "0.30";

    return (
        <div className={`flex items-center gap-3 ${className} group cursor-pointer`}>
            {/* ─── Mark ─── */}
            <div
                className="relative flex items-center justify-center shrink-0"
                style={{ width: size, height: size }}
            >
                {/* Hover glow */}
                <div
                    className="absolute inset-[-30%] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                        background: `radial-gradient(circle, ${
                            light ? 'rgba(255,255,255,0.25)' : 'rgba(37,99,235,0.15)'
                        }, transparent 70%)`,
                        filter: 'blur(8px)',
                    }}
                />

                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" fill="none">
                    <defs>
                        <linearGradient id={gradMain} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={barColorA} />
                            <stop offset="100%" stopColor={barColorB} />
                        </linearGradient>
                        <linearGradient id={gradArrow} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={arrowColorA} />
                            <stop offset="100%" stopColor={arrowColorB} />
                        </linearGradient>
                        <filter id={filtShadow} x="-15%" y="-15%" width="130%" height="130%">
                            <feDropShadow dx="0" dy="3" stdDeviation="4"
                                floodColor={shadowFlood} floodOpacity={shadowOpacity} />
                        </filter>
                    </defs>

                    {/* ── E letterform ── */}

                    {/* Vertical spine */}
                    <motion.rect
                        x="14" y="13" width="14" height="74" rx="5"
                        fill={`url(#${gradMain})`}
                        filter={`url(#${filtShadow})`}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: '21px 13px' }}
                    />

                    {/* Top bar */}
                    <motion.rect
                        x="14" y="13" width="58" height="14" rx="5"
                        fill={`url(#${gradMain})`}
                        filter={`url(#${filtShadow})`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: '14px 20px' }}
                    />

                    {/* Middle bar (shorter — creates the E notch) */}
                    <motion.rect
                        x="14" y="43" width="44" height="14" rx="5"
                        fill={`url(#${gradMain})`}
                        filter={`url(#${filtShadow})`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: '14px 50px' }}
                    />

                    {/* Bottom bar */}
                    <motion.rect
                        x="14" y="73" width="58" height="14" rx="5"
                        fill={`url(#${gradMain})`}
                        filter={`url(#${filtShadow})`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: '14px 80px' }}
                    />

                    {/* ── Logistics arrow (shoots right out of middle bar) ── */}
                    {/* Arrow shaft */}
                    <motion.line
                        x1="58" y1="50"
                        x2="86" y2="50"
                        stroke={`url(#${gradArrow})`}
                        strokeWidth="7"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
                    />
                    {/* Arrow head */}
                    <motion.polyline
                        points="77,41 86,50 77,59"
                        stroke={`url(#${gradArrow})`}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.82, ease: 'easeOut' }}
                    />
                </svg>
            </div>

            {/* ─── Optional wordmark ─── */}
            {showText && (
                <div className="flex flex-col -space-y-0.5 transform group-hover:translate-x-1 transition-transform duration-500 ease-out">
                    <span
                        className="font-black text-2xl tracking-tighter leading-none"
                        style={{ color: light ? '#FFFFFF' : '#0F172A' }}
                    >
                        Evri
                    </span>
                    <span
                        className="text-[9px] font-bold uppercase tracking-[0.35em]"
                        style={{ color: light ? 'rgba(255,255,255,0.65)' : '#64748B' }}
                    >
                        Logistics
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
