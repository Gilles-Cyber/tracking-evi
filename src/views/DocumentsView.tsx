import { useState } from 'react';
import { ArrowLeft, ShieldCheck, FileText, Download, Eye, File, X, Search, Filter, MoreVertical, FileArchive, FileBadge, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export function DocumentsView({ onNavigate }: { onNavigate: (page: Page) => void }) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewDoc, setPreviewDoc] = useState<any | null>(null);

    const docs = [
        { id: '1', title: 'Facture #INV-2024-001', type: 'invoice', size: '1.2 MB', date: 'Hier, 10:30', status: 'verified' },
        { id: '2', title: 'Certificat d\'Assurance - EVR-9821', type: 'certificate', size: '450 KB', date: '12 Mar 2024', status: 'verified' },
        { id: '3', title: 'Bordereau de Livraison - EVR-7742', type: 'bol', size: '2.1 MB', date: '10 Mar 2024', status: 'verified' },
        { id: '4', title: 'Rapport d\'Inspection Douanière', type: 'customs', size: '3.4 MB', date: '05 Mar 2024', status: 'verified' },
        { id: '5', title: 'Déclaration d\'Origine', type: 'customs', size: '820 KB', date: '01 Mar 2024', status: 'verified' },
        { id: '6', title: 'Devis Préliminaire #Q-882', type: 'invoice', size: '1.5 MB', date: '28 Fév 2024', status: 'verified' },
    ];

    const filteredDocs = docs.filter(d =>
        (activeTab === 'all' || d.type === activeTab || (activeTab === 'customs' && d.type === 'certificate')) &&
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'invoice': return <FileText className="w-5 h-5" />;
            case 'customs': return <FileBadge className="w-5 h-5" />;
            case 'certificate': return <ShieldCheck className="w-5 h-5" />;
            case 'bol': return <FileArchive className="w-5 h-5" />;
            default: return <File className="w-5 h-5" />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-bg-app text-main font-sans pb-24 selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-bg-app"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <header className="flex flex-col pt-6 pb-2 px-6 border-b border-dim sticky top-0 bg-bg-app/80 backdrop-blur-2xl z-30 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => onNavigate('profile')} className="p-2 -ml-2 text-dim hover:text-main transition-colors rounded-full hover:bg-slate-500/5">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-extrabold tracking-tight text-main">{t('documents')}</h1>
                    <button className="p-2 -mr-2 text-dim hover:text-main transition-colors rounded-full hover:bg-slate-500/5">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('rechercher_doc')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-500/5 border border-dim rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-main placeholder:text-dim/80 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner backdrop-blur-md"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {['all', 'invoice', 'customs', 'bol'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTab === tab
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'bg-slate-500/5 text-dim border-dim hover:bg-slate-500/10 hover:text-main'
                                }`}
                        >
                            {tab === 'all' ? t('all_status') : tab === 'invoice' ? t('factures') : tab === 'customs' ? t('douane_certifs') : t('bordereaux')}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-4 relative z-10">
                {/* Security Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-950/30 p-5 rounded-[2rem] border border-emerald-500/20 mb-6 flex gap-4 items-center shadow-[0_10px_30px_rgba(16,185,129,0.05)] backdrop-blur-xl"
                >
                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-inner">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-extrabold text-sm text-emerald-400 flex items-center gap-2 tracking-tight">
                            {t('digital_vault')} <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </p>
                        <p className="text-xs text-emerald-200/60 leading-relaxed font-medium mt-1">
                            {t('vault_desc')}
                        </p>
                    </div>
                </motion.div>

                {/* Document List */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredDocs.length > 0 ? filteredDocs.map((d, i) => (
                            <motion.div
                                key={d.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                className="group bg-[#1E88C8]/60 p-4 rounded-2xl border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:border-white/10 hover:-translate-y-1 transition-all cursor-pointer flex items-center gap-4 backdrop-blur-xl"
                                onClick={() => setPreviewDoc(d)}
                            >
                                <div className={`p-3.5 rounded-2xl transition-colors border shadow-sm ${d.type === 'invoice' ? 'bg-blue-50/50 text-blue-500 border-blue-100 group-hover:bg-blue-50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]' :
                                    d.type === 'customs' ? 'bg-amber-50/50 text-amber-500 border-amber-100 group-hover:bg-amber-50 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                                        d.type === 'certificate' ? 'bg-emerald-50/50 text-emerald-500 border-emerald-100 group-hover:bg-emerald-50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                                            'bg-indigo-50/50 text-indigo-500 border-indigo-100 group-hover:bg-indigo-50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                    }`}>
                                    {getIcon(d.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-main pr-4 leading-tight">{d.title}</h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-500/5 border border-dim px-2 py-0.5 rounded-md uppercase tracking-widest leading-none flex items-center h-[18px]">{d.size}</span>
                                        <span className="text-[9px] font-bold text-dim uppercase tracking-widest px-1">{d.date}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                                    <button
                                        className="p-2 text-dim hover:text-main hover:bg-slate-500/5 rounded-xl transition-colors hidden sm:block border border-transparent hover:border-dim"
                                        onClick={(e) => { e.stopPropagation(); setPreviewDoc(d); }}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-colors border border-transparent hover:border-blue-500/20"
                                        onClick={(e) => { e.stopPropagation(); /* download logic */ }}
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-2 text-dim hover:text-main hover:bg-slate-500/5 rounded-xl transition-colors sm:hidden border border-transparent"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-500/5 border border-dim mb-4 text-dim">
                                    <Search className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-main mb-1">{t('no_doc_found')}</h3>
                                <p className="text-sm text-dim">{t('try_changing_search')}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Document Preview Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xl"
                        onClick={() => setPreviewDoc(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-3xl bg-card border border-dim rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-dim bg-slate-500/5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl border border-white/10 shadow-inner ${previewDoc.type === 'invoice' ? 'bg-blue-500/20 text-blue-400' :
                                        previewDoc.type === 'customs' ? 'bg-amber-500/20 text-amber-400' :
                                            previewDoc.type === 'certificate' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-cyan-500/20 text-cyan-400'
                                        }`}>
                                        {getIcon(previewDoc.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-main tracking-tight sm:text-lg">{previewDoc.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] text-dim font-bold bg-slate-500/5 px-2 py-0.5 rounded uppercase tracking-widest border border-dim">PDF</span>
                                            <span className="text-xs text-dim font-bold tracking-wider">{previewDoc.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500/50 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                                        <Download className="w-4 h-4" /> {t('download')}
                                    </button>
                                    <button
                                        onClick={() => setPreviewDoc(null)}
                                        className="p-2.5 bg-slate-500/5 border border-dim text-dim hover:text-main hover:bg-slate-500/10 rounded-xl transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Document Mock Preview Content */}
                            <div className="flex-1 bg-slate-50 p-4 sm:p-8 overflow-y-auto min-h-[40vh] sm:min-h-[60vh] flex justify-center items-start border-t border-dim shadow-inner">
                                {/* Simulated PDF Paper - Using dark theme for seamless look */}
                                <div className="bg-white border border-dim w-full max-w-2xl min-h-[800px] shadow-[0_0_30px_rgba(0,0,0,0.05)] rounded-md p-8 sm:p-12 mb-8 mx-auto relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-bl-[100px] pointer-events-none"></div>
                                    {/* Mock Document Header */}
                                    <div className="flex justify-between items-start border-b border-dim pb-6 mb-8">
                                        <div>
                                            <h1 className="text-2xl font-black text-main tracking-tighter mix-blend-multiply opacity-90">Evri<span className="text-blue-500">Logistics</span></h1>
                                            <p className="text-xs text-slate-500 mt-2 font-mono tracking-widest uppercase">{t('official_doc')}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md text-[10px] font-bold border border-emerald-500/20 mb-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                <CheckCircle className="w-3 h-3" /> VERIFIED ORIGIN
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{previewDoc.date}</p>
                                        </div>
                                    </div>

                                    {/* Mock Document Content Skeletons */}
                                    <div className="space-y-6">
                                        <div className="h-4 bg-white/10 rounded w-1/3 mb-8"></div>
                                        <div className="space-y-4">
                                            <div className="h-2 bg-white/5 rounded w-full"></div>
                                            <div className="h-2 bg-white/5 rounded w-full"></div>
                                            <div className="h-2 bg-white/5 rounded w-5/6"></div>
                                        </div>

                                        <div className="mt-12 border border-white/10 rounded-lg overflow-hidden bg-white/[0.02]">
                                            <div className="bg-white/5 h-10 border-b border-white/10"></div>
                                            <div className="p-5 space-y-5">
                                                <div className="flex justify-between items-center"><div className="h-2 bg-white/10 rounded w-1/4"></div><div className="h-2 bg-white/10 rounded w-1/6"></div></div>
                                                <div className="flex justify-between items-center"><div className="h-2 bg-white/10 rounded w-1/3"></div><div className="h-2 bg-white/10 rounded w-1/6"></div></div>
                                                <div className="flex justify-between items-center"><div className="h-2 bg-white/10 rounded w-1/5"></div><div className="h-2 bg-white/10 rounded w-1/6"></div></div>
                                                <div className="pt-5 border-t border-white/10 flex justify-between items-center"><div className="h-4 bg-white/20 rounded w-1/6"></div><div className="h-4 bg-white/20 rounded w-1/4"></div></div>
                                            </div>
                                        </div>

                                        <div className="mt-12 space-y-4">
                                            <div className="h-2 bg-white/5 rounded w-full"></div>
                                            <div className="h-2 bg-white/5 rounded w-3/4"></div>
                                        </div>
                                    </div>

                                    {/* Mock Document Footer */}
                                    <div className="mt-24 pt-8 border-t border-dim flex justify-between items-end text-[10px] text-slate-500 uppercase tracking-widest">
                                        <p>{t('confidential_doc_desc')}</p>
                                        <p className="font-mono text-slate-600">{previewDoc.id}-EVR-VAL</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile action bar sticky to bottom */}
                            <div className="sm:hidden p-4 border-t border-dim bg-card/95 backdrop-blur-md">
                                <button className="w-full flex justify-center items-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500/50 text-white font-bold rounded-xl active:scale-95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                    <Download className="w-5 h-5" /> {t('download')} PDF
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
