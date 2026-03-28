import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Move notify to the absolute top of the function body
  const notify = useCallback((type: NotificationType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, message, description }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const remove = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-[200] flex flex-col gap-3 w-full max-w-[calc(100vw-3rem)] sm:max-w-md pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className="bg-card/80 backdrop-blur-xl border border-dim rounded-2xl p-4 shadow-2xl flex gap-3 items-start relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className={`p-2 rounded-xl shrink-0 ${
                  n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                  n.type === 'error' ? 'bg-red-500/10 text-red-500' :
                  n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {n.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                   n.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                  n.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                  <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-main leading-tight">{n.message}</h4>
                  {n.description && <p className="text-xs text-dim mt-1 font-medium leading-relaxed">{n.description}</p>}
                </div>

                <button 
                  onClick={() => remove(n.id)}
                  className="p-1 hover:bg-slate-500/10 rounded-lg text-dim transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Progress bar */}
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-0.5 ${
                    n.type === 'success' ? 'bg-emerald-500' :
                    n.type === 'error' ? 'bg-red-500' :
                    n.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}

