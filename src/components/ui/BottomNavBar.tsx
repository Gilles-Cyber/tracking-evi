import { Home, Send, Clock, User, Settings, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface BottomNavBarProps {
  currentPage: string;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

export function BottomNavBar({ currentPage, onNavigate, isAdmin }: BottomNavBarProps) {
  const { unreadCount } = useNotification();
  const { t } = useLanguage();
  const navItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'suivi', icon: Send, label: t('tracking') },
    { id: 'support', icon: MessageSquare, label: t('help_support') },
    { id: 'profil', icon: User, label: t('profile') },
  ];


  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-dim bg-card/95 backdrop-blur-2xl pointer-events-auto">
      <motion.nav 
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="flex items-center justify-around h-20 ring-1 ring-white/5"
      >
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className="relative flex flex-col items-center justify-center py-2 px-4 group flex-1"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-500/10 rounded-2xl border border-blue-500/10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-blue-500 scale-110' : 'text-dim group-hover:text-main'
                  }`} 
                />
                {item.id === 'support' && unreadCount > 0 && !isAdmin && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-blue-600 text-white text-[8px] font-black rounded-full border border-card flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                {item.id === 'admin' && unreadCount > 0 && isAdmin && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-red-600 text-white text-[8px] font-black rounded-full border border-card flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <span className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 transition-all duration-300 ${
                isActive ? 'text-blue-500 opacity-100' : 'text-dim opacity-70'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="active-dot"
                  className="absolute -top-1 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                />
              )}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
