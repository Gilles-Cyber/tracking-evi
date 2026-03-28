import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Home, Navigation, Package, User, Search, ArrowRight, Shield, Clock, 
  MapPin, CheckCircle, Smartphone, Settings, LogOut, ChevronRight,
  Plus, Bell, Info, MessageSquare
} from 'lucide-react';
import { Page, Shipment } from './types';

// Views
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { TrackingView } from './views/TrackingView';
import { ConfirmationView } from './views/ConfirmationView';
import { AdminView } from './views/AdminView';
import { ShipmentView } from './views/ShipmentView';
import { ProfileView } from './views/ProfileView';
import { BottomNavBar } from './components/ui/BottomNavBar';
import { useNotification } from './contexts/NotificationContext';
import { HistoryView } from './views/HistoryView';
import { DocumentsView } from './views/DocumentsView';
import { SupportView } from './views/SupportView';
import { SettingsView } from './views/SettingsView';
import { SplashScreen } from './views/SplashScreen';
import { LoginView } from './views/LoginView';
import Logo from './components/ui/Logo';

// Components
import { NavItem } from './components/ui/NavItem';

// Contexts
import { useLanguage } from './contexts/LanguageContext';

import { getSessionId } from './utils/session';

const PageTransition = ({ children, currentPage }: { children: React.ReactNode, currentPage: string }) => (
  <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex-1 flex flex-col relative ${currentPage === 'admin' ? '' : 'pt-16 md:pt-0'}`}
  >
      <div className="flex-1 w-full max-w-7xl mx-auto md:pb-0">
          {children}
      </div>
  </motion.div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  const [logoClicks, setLogoClicks] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [lastCreatedShipmentId, setLastCreatedShipmentId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('gxn_admin') === 'true');

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  const sessionId = getSessionId();

  // Helper to determine active page from path
  const getPathname = () => {
    const p = location.pathname.split('/')[1];
    if (p === 'suivi') return 'search';
    if (p === 'expedier') return 'shipment';
    if (p === 'profil') return 'profile';
    return p || 'home';
  };
  const currentPage = getPathname();

  const { notify, unreadCount, clearUnread } = useNotification();

  useEffect(() => {
    async function fetchShipments() {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*');
        if (error) throw error;
        if (data) {
          const formattedData: Shipment[] = data.map((item: any) => ({
            ...item,
            progress: Number(item.progress),
          }));
          setShipments(formattedData);
        }
      } catch (err: any) {
        console.error('Error fetching shipments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchShipments();

    // Realtime subscription with status change alerts
    const subscription = supabase
      .channel('shipments_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shipments' }, (payload) => {
        const newShipment = payload.new as Shipment;
        const oldShipment = payload.old as any;
        
        // Only notify if it belongs to this session OR if the user is currently tracking it
        const pathParts = window.location.pathname.split('/');
        const activeTrackId = pathParts[1] === 'suivi' ? pathParts[2] : null;

        if (newShipment.session_id === sessionId || newShipment.id === activeTrackId) {
            // Only notify if Status or Admin Message changed
            if (newShipment.status !== oldShipment?.status || newShipment.admin_message !== oldShipment?.admin_message) {
                notify(
                    newShipment.status === 'Alert' ? 'error' : 'info',
                    `${t('shipment_update')}: ${newShipment.id}`,
                    `${t('new_status')}: ${newShipment.status}. ${t('admin_msg')}: ${newShipment.admin_message || t('none')}`
                );
            }
        }
        fetchShipments();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shipments' }, () => {
        fetchShipments();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'shipments' }, () => {
        fetchShipments();
      })
      .subscribe();

    // Chat Realtime subscription
    const chatSubscription = supabase
      .channel('global_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
        const newMsg = payload.new as any;
        
        // Notification for User
        if (newMsg.sender_type === 'admin' && newMsg.session_id === sessionId) {
          // If not currently on the support page
          if (window.location.pathname !== '/support') {
            notify('info', t('new_message_from_support'), newMsg.text);
          }
        }
        
        // Notification for Admin
        if (newMsg.sender_type === 'user' && isAdmin) {
          // If not currently on the admin page or not on the messages tab
          // Note: Checking activeTab from App.tsx is tricky without moving state up, 
          // but we can at least check if we are not on the /admin route or just notify anyway.
          if (window.location.pathname !== '/admin') {
            notify('warning', t('new_support_msg'), `${t('from')}: ${newMsg.session_id.slice(-8)}`);
          }
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(subscription); 
      supabase.removeChannel(chatSubscription);
    };
  }, [sessionId, notify, isAdmin, t]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (page: Page | string) => {
    if (page === 'support' || (isAdmin && page === 'admin')) {
      clearUnread();
    }
    const routes: Record<string, string> = {
      home: '/',
      search: '/suivi',
      tracking: '/suivi',
      shipment: '/expedier',
      admin: '/admin',
      profile: '/profil',
      history: '/historique',
      documents: '/documents',
      support: '/support',
      settings: '/settings',
      login: '/login'
    };
    if (typeof page === 'string' && routes[page]) {
      navigate(routes[page]);
    } else {
      navigate(page as string);
    }
  };

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    if (newClicks >= 7) {
      setIsAdmin(true);
      localStorage.setItem('gxn_admin', 'true');
      navigate('/admin');
      setLogoClicks(0);
    } else {
      setLogoClicks(newClicks);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('gxn_admin');
    navigate('/');
  };

  useEffect(() => {
    const timer = setTimeout(() => setLogoClicks(0), 2000);
    return () => clearTimeout(timer);
  }, [logoClicks]);

  const handleTrack = (id: string) => {
    setNotFoundError(false);
    const upper = id.trim().toUpperCase();
    const found = shipments.find(s => s.id.toUpperCase() === upper);
    if (found) {
      navigate(`/suivi/${found.id}`);
    } else {
      setNotFoundError(true);
    }
  };

  const handleShipmentCreated = (newId: string) => {
    setLastCreatedShipmentId(newId);
    navigate(`/confirmation/${newId}`);
  };



  return (
    <div className="flex flex-col min-h-screen relative font-sans selection:bg-blue-500/30 text-main bg-bg-app">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <Routes>
            <Route path="/" element={<PageTransition currentPage={currentPage}><HomeView onNavigate={handleNavigate} onLogoClick={handleLogoClick} isAdmin={isAdmin} /></PageTransition>} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/suivi" element={<PageTransition currentPage={currentPage}><SearchView onNavigate={handleNavigate} onLogoClick={handleLogoClick} onTrack={handleTrack} shipments={shipments} notFoundError={notFoundError} /></PageTransition>} />
            <Route path="/suivi/:id" element={<PageTransition currentPage={currentPage}><TrackingView onNavigate={handleNavigate} onLogoClick={handleLogoClick} shipments={shipments} /></PageTransition>} />
            <Route path="/confirmation/:id" element={<PageTransition currentPage={currentPage}><ConfirmationView onNavigate={handleNavigate} onTrack={(id) => navigate(`/suivi/${id}`)} /></PageTransition>} />
            <Route path="/admin" element={<PageTransition currentPage={currentPage}>{isAdmin ? <AdminView onNavigate={handleNavigate} shipments={shipments} loading={loading} setShipments={setShipments} onLogout={handleLogout} /> : <Navigate to="/" replace />}</PageTransition>} />
            <Route path="/expedier" element={<PageTransition currentPage={currentPage}>{isAdmin ? <ShipmentView onNavigate={handleNavigate} sessionId={sessionId} onShipmentCreated={handleShipmentCreated} /> : <Navigate to="/" replace />}</PageTransition>} />
            <Route path="/profil" element={<PageTransition currentPage={currentPage}><ProfileView onNavigate={handleNavigate} sessionId={sessionId} shipments={shipments} /></PageTransition>} />
            <Route path="/historique" element={<PageTransition currentPage={currentPage}><HistoryView onNavigate={handleNavigate} sessionId={sessionId} shipments={shipments} onTrack={(id) => navigate(`/suivi/${id}`)} /></PageTransition>} />
            <Route path="/documents" element={<PageTransition currentPage={currentPage}><DocumentsView onNavigate={handleNavigate} /></PageTransition>} />
            <Route path="/support" element={<PageTransition currentPage={currentPage}><SupportView onNavigate={handleNavigate} /></PageTransition>} />
            <Route path="/settings" element={<PageTransition currentPage={currentPage}><SettingsView onNavigate={handleNavigate} /></PageTransition>} />
            <Route path="/login" element={<PageTransition currentPage={currentPage}><LoginView onNavigate={handleNavigate} /></PageTransition>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </AnimatePresence>

      {/* Mobile Header Logo */}
      {!showSplash && currentPage !== 'admin' && currentPage !== 'search' && currentPage !== 'support' && currentPage !== 'tracking' && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-dim bg-card/80 backdrop-blur-xl px-6 flex items-center justify-between z-50">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
              navigate('/');
              handleLogoClick();
            }}
          >
            <Logo size={32} />
            <span className="font-black text-lg tracking-tighter">Evri</span>
          </motion.div>
          <div className="flex items-center gap-2">
            {logoClicks > 0 && (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={logoClicks}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"
              />
            )}
            <button
                onClick={toggleLanguage}
                className="p-2 rounded-full bg-slate-500/10 text-blue-500"
            >
                <Globe className="w-5 h-5" />
            </button>
            <button
                className="p-2 rounded-full bg-slate-500/10 text-slate-500 relative group"
                title={t('notifications')}
                onClick={() => { 
                    clearUnread(); 
                    if (isAdmin) {
                        navigate('/admin');
                    } else {
                        navigate('/support');
                    }
                }}
            >
                <Bell className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-black rounded-full border-2 border-card flex items-center justify-center animate-in zoom-in duration-300">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      {!showSplash && currentPage !== 'confirmation' && currentPage !== 'admin' && currentPage !== 'shipment' && currentPage !== 'profile' && currentPage !== 'search' && (
        <>
          <nav className="hidden md:flex fixed top-0 left-0 right-0 border-b border-dim bg-card/80 backdrop-blur-xl px-8 py-4 justify-between items-center z-50">
            <div className="flex items-center gap-3 cursor-pointer group relative" onClick={() => { navigate('/'); handleLogoClick(); }}>
              <Logo size={40} />
              <span className="font-black text-xl tracking-tighter group-hover:text-blue-500 transition-colors">Evri</span>
              {logoClicks > 0 && (
                <motion.div initial={{ scale: 0.8, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 }} className="absolute left-5 top-5 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-blue-500 rounded-full pointer-events-none" />
              )}
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => navigate('/')} className={`text-sm font-bold uppercase tracking-widest ${currentPage === 'home' ? 'text-blue-500' : 'text-slate-600  hover:text-blue-500 '} transition-colors`}>{t('home')}</button>
              <button onClick={() => navigate('/suivi')} className={`text-sm font-bold uppercase tracking-widest ${currentPage === 'search' ? 'text-blue-500' : 'text-slate-600  hover:text-blue-500 '} transition-colors`}>{t('tracking')}</button>
              <button onClick={() => navigate('/profil')} className={`text-sm font-bold uppercase tracking-widest ${currentPage === 'profile' ? 'text-blue-500' : 'text-slate-600  hover:text-blue-500 '} transition-colors`}>{t('profile')}</button>
              
              <div className="flex items-center gap-2 ml-4">
                  <button
                      onClick={() => handleNavigate('support')}
                      className={`p-2 sm:p-2.5 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-main transition-all border border-dim group flex items-center gap-2 relative ${currentPage === 'support' ? 'text-blue-500 border-blue-500/50' : ''}`}
                      title={t('support')}
                  >
                      <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${currentPage === 'support' ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-500'}`} />
                      {!isAdmin && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-card animate-in zoom-in duration-300">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                  </button>

                  <button
                      className="p-2 sm:p-2.5 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-main transition-all border border-dim group flex items-center gap-2 relative"
                      title={t('notifications')}
                      onClick={() => {
                          clearUnread();
                          if (isAdmin) {
                              navigate('/admin');
                          } else {
                              navigate('/support');
                          }
                      }}
                  >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-hover:text-blue-500" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-card animate-in zoom-in duration-300">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                  </button>

                  <button
                      onClick={toggleLanguage}
                      className="p-2 sm:p-2.5 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-main transition-all border border-dim group flex items-center gap-2"
                      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
                  >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">
                          {language === 'en' ? 'ES' : 'EN'}
                      </span>
                  </button>

              </div>
            </div>
          </nav>
          <div className="hidden md:block h-20" />
        </>
      )}
      {!showSplash && currentPage !== 'admin' && (
        <BottomNavBar 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          isAdmin={isAdmin} 
        />
      )}
    </div>
  );
}




