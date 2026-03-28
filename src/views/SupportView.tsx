import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Phone, Video, MoreVertical, ShieldCheck, CheckCircle2, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, ChatMessage } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

import { getSessionId } from '../utils/session';

export function SupportView({ onNavigate }: { onNavigate: (page: Page) => void }) {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const sessionId = getSessionId();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase.from('profiles').select('name').eq('session_id', sessionId).limit(1);
            if (data && data.length > 0 && data[0].name) {
                setUserName(data[0].name);
            }
        };
        fetchProfile();
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch initial messages and set up subscription
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('support_messages')
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                if (data) setMessages(data);
                
                // Mark messages from admin as read
                await supabase
                    .from('support_messages')
                    .update({ is_read: true })
                    .eq('session_id', sessionId)
                    .eq('sender_type', 'admin')
                    .eq('is_read', false);

            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const channel = supabase
            .channel(`chat_${sessionId}`)
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `session_id=eq.${sessionId}` },
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                    
                    // Mark as read if it's from admin and we are in the view
                    if (newMsg.sender_type === 'admin') {
                        supabase
                            .from('support_messages')
                            .update({ is_read: true })
                            .eq('id', newMsg.id)
                            .then();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return;

        const text = inputValue.trim();
        setInputValue('');
        setIsSending(true);

        try {
            const { error } = await supabase.from('support_messages').insert([{
                text: text,
                sender_type: 'user',
                session_id: sessionId,
                is_read: false
            }]);

            if (error) throw error;
        } catch (err) {
            console.error('Error sending message:', err);
            setInputValue(text); // Restore input on error
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col min-h-screen bg-bg-app text-main font-sans relative overflow-hidden selection:bg-blue-500/30">
            {/* Background elements for depth */}
            <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
            <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-50/80 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Premium Header */}
            <header className="flex items-center justify-between p-4 sm:p-6 border-b border-dim sticky top-0 bg-bg-app/80 backdrop-blur-xl z-20 shadow-sm">
                <div className="flex items-center justify-between w-full">
                    <button onClick={() => onNavigate('profile')} className="p-2 -ml-2 text-dim hover:text-main hover:bg-slate-500/5 rounded-full transition-colors border border-transparent hover:border-dim">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t('chat_with_agent')}</p>
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 max-w-3xl mx-auto w-full space-y-6">
                
                {/* Security encryption notice */}
                <div className="flex justify-center mb-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest shadow-inner">
                        <ShieldCheck className="w-3 h-3" /> {t('encryption_notice')}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('sec_init')}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 text-center px-10">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                            <User className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black text-main mb-2">{t('chat_welcome')} {userName || ''} !</h3>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex flex-col ${m.sender_type === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[85%] md:max-w-[75%] rounded-[1.5rem] px-5 py-3.5 shadow-sm border ${m.sender_type === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm border-blue-500/30 shadow-[0_5px_15px_rgba(59,130,246,0.2)]'
                                    : 'bg-card backdrop-blur-md border border-dim text-main rounded-bl-sm overflow-hidden relative'
                                    }`}>
                                    {m.sender_type !== 'user' && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-slate-500/5 to-transparent pointer-events-none"></div>
                                    )}
                                    <p className="text-[15px] leading-relaxed relative z-10">{m.text}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 mt-1.5 px-2 ${m.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatTime(m.created_at)}</span>
                                    {m.sender_type === 'user' && (
                                        <CheckCircle2 className={`w-3.5 h-3.5 ${m.is_read ? 'text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full' : 'text-slate-600'}`} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="fixed bottom-20 md:bottom-0 left-0 w-full bg-bg-app/90 backdrop-blur-xl border-t border-dim p-4 pb-8 sm:pb-4 z-30">
                <div className="max-w-3xl mx-auto relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('write_message')}
                        disabled={loading}
                        className="w-full bg-slate-500/5 text-main border border-dim focus:border-blue-500/50 rounded-full py-4 pl-6 pr-16 outline-none transition-all placeholder:text-dim/60 font-medium shadow-inner backdrop-blur-md disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isSending || loading}
                        className={`absolute right-2 p-3 rounded-full flex items-center justify-center transition-all ${inputValue.trim() && !isSending
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-100 active:scale-90 hover:brightness-110'
                            : 'bg-slate-500/5 text-dim scale-90 cursor-not-allowed border border-dim'
                            }`}
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </button>
                </div>
                <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-3">{t('priority_support')}</p>
            </div>
        </div>
    );
}


