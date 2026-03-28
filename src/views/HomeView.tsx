import { ArrowRight, Clock3, Globe2, Package, Plane, ShieldCheck, Sparkles, Truck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../types';

const IMAGES = {
    warehouse: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80&w=2000',
    delivery: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=2000',
    packages: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2000'
};

const STATS = [
    { title: 'On-Time Delivery', value: '99.8%', desc: 'Industry-leading reliability for every route.' },
    { title: 'Global Reach', value: '150+', desc: 'Countries served by our integrated network.' },
    { title: 'Active Shipments', value: '2.4M', desc: 'Handled with precision every single day.' },
];

const HIGHLIGHTS = [
    { title: 'Smart Routing', desc: 'AI-optimized lanes that reduce delays and keep every parcel on schedule.' },
    { title: 'Live Visibility', desc: 'Real-time checkpoints with proactive updates from pickup to delivery.' },
    { title: 'Secure Handling', desc: 'Tamper-aware tracking with audited custody and verified handoffs.' },
];

const STEPS = [
    { title: 'Create Shipment', desc: 'Generate a tracking code and define route, cargo, and priority in seconds.' },
    { title: 'Monitor Transit', desc: 'Follow vehicle movement and milestones with clear, human-friendly updates.' },
    { title: 'Confirm Delivery', desc: 'Receive final confirmation and access secure documentation instantly.' },
];

const INDUSTRIES = [
    'E-commerce',
    'Healthcare',
    'Electronics',
    'Fashion',
    'Industrial',
    'Food & Cold Chain',
];

export function HomeView({ onNavigate, onLogoClick, isAdmin }: { onNavigate: (page: Page) => void, onLogoClick: () => void, isAdmin: boolean }) {
    return (
        <div className="relative min-h-screen overflow-hidden font-sans bg-white selection:bg-blue-500/30">
            {/* Extremely subtle ambient glows for premium feel */}
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-blue-50/50 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-slate-50/80 blur-[100px] pointer-events-none" />

            <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-32 space-y-32">
                
                {/* Hero Section */}
                <section className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-8"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Defining Modern Logistics
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-slate-900 leading-[1.05]">
                            Precision at <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">every mile.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
                            Experience the pinnacle of supply chain visibility. We blend cutting-edge technology with world-class infrastructure to move your products flawlessly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate('search')}
                                className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:bg-slate-800 transition-all"
                            >
                                Track your parcel <ArrowRight className="w-4 h-4" />
                            </motion.button>
                            <button
                                onClick={() => onNavigate(isAdmin ? 'shipment' : 'profile')}
                                className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                {isAdmin ? 'Dashboard Access' : 'View Services'}
                            </button>
                        </div>
                    </motion.div>

                    {/* Premium Image Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative h-[600px] w-full"
                    >
                        <div className="absolute top-0 right-0 w-[80%] h-[60%] rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-100 z-10 transform hover:scale-[1.02] transition-transform duration-500">
                            <img src={IMAGES.delivery} alt="Delivery Fleet" className="w-full h-full object-cover object-center" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Global Fleet</p>
                                <p className="text-lg font-bold">Zero-emission vehicles</p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-[55%] h-[50%] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/15 border border-white z-20 transform -translate-y-8 hover:scale-[1.02] transition-transform duration-500">
                            <img src={IMAGES.packages} alt="Premium Packaging" className="w-full h-full object-cover" />
                        </div>

                        <div className="absolute bottom-12 right-4 w-[35%] h-[35%] rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/10 border border-white z-30 transform hover:scale-[1.02] transition-transform duration-500">
                            <img src={IMAGES.warehouse} alt="Automated Warehouse" className="w-full h-full object-cover" />
                        </div>
                    </motion.div>
                </section>

                {/* Refined Stats Section */}
                <section>
                    <div className="grid md:grid-cols-3 gap-8 border-y border-slate-100 py-16 layout-grid">
                        {STATS.map((stat, idx) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: idx * 0.15, duration: 0.7 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-4 bg-slate-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">{stat.title}</p>
                                <p className="text-5xl font-display font-bold tracking-tighter text-slate-900 mb-4">{stat.value}</p>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[250px]">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Value Highlights */}
                <section className="grid lg:grid-cols-3 gap-8">
                    {HIGHLIGHTS.map((item, idx) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ delay: idx * 0.15, duration: 0.6 }}
                            className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">{item.title}</p>
                            <p className="text-lg font-bold text-slate-900 mb-3">{item.title}</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </section>

                {/* How It Works */}
                <section className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-10 md:p-14 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">How It Works</p>
                            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-900">
                                Transparent logistics, end to end.
                            </h2>
                        </div>
                        <button
                            onClick={() => onNavigate('search')}
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-500"
                        >
                            Start Tracking <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {STEPS.map((step, idx) => (
                            <div key={step.title} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black mb-4">
                                    {idx + 1}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Industries Served */}
                <section className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
                    <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Industries Served</p>
                        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-900">
                            Built for complex supply chains.
                        </h2>
                        <p className="text-base text-slate-500 leading-relaxed">
                            Whether you ship time-sensitive medical goods or high-value electronics, Evri delivers the visibility,
                            compliance, and reliability your customers expect.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {INDUSTRIES.map(item => (
                                <span key={item} className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-widest bg-white">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Compliance Ready</p>
                                <p className="text-xs text-slate-500">Audit-friendly logs and secure documentation.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Optimized Fleet</p>
                                <p className="text-xs text-slate-500">Ground, air, and sea networks managed in one view.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                <Clock3 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">24/7 Visibility</p>
                                <p className="text-xs text-slate-500">Instant updates for every milestone.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="rounded-[2.5rem] bg-slate-900 text-white p-10 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl shadow-slate-900/15">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-3">Ready to Ship</p>
                        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                            Launch your next delivery with Evri.
                        </h2>
                        <p className="text-sm text-blue-100/80 mt-3 max-w-xl">
                            Track, verify, and deliver with confidence. Start a shipment or monitor an existing code in seconds.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => onNavigate('search')}
                            className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
                        >
                            Track a Parcel <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onNavigate(isAdmin ? 'shipment' : 'profile')}
                            className="px-8 py-4 rounded-2xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all"
                        >
                            {isAdmin ? 'Create Shipment' : 'Manage Profile'}
                        </button>
                    </div>
                </section>
                
            </main>
        </div>
    );
}
