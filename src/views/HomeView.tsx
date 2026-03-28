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
                
            </main>
        </div>
    );
}
