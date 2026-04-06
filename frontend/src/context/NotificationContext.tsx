import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell, TrendingDown, ShieldCheck, Zap, Clock, AlertCircle } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: any;
  color: string;
  bg: string;
  category: string;
  unread: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (note: Omit<Notification, 'id' | 'timestamp' | 'unread'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: Notification[] = [
  { 
    id: '1', 
    title: "EMI Reduced", 
    desc: "Your EMI for April was reduced by 12% due to lower revenue flow.", 
    time: "2h ago", 
    icon: TrendingDown, 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    category: "Financial",
    unread: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  { 
    id: '2', 
    title: "ESG Verification Success", 
    desc: "Your quarterly energy audit has been verified. Score updated.", 
    time: "1d ago", 
    icon: ShieldCheck, 
    color: "text-indigo-primary", 
    bg: "bg-indigo-primary/10",
    category: "Compliance",
    unread: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const addNotification = (note: Omit<Notification, 'id' | 'timestamp' | 'unread'>) => {
    const newNote: Notification = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      unread: true,
      timestamp: new Date()
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  // Simulate live notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const chance = Math.random();
      if (chance > 0.8) {
        const liveNotes = [
          { title: "New ESG Insight", desc: "Your carbon footprint decreased by 5% this month.", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10", category: "ESG" },
          { title: "Market Update", desc: "Lender interest rates for sustainable SMEs dropped by 0.25%.", icon: Zap, color: "text-cyan-accent", bg: "bg-cyan-accent/10", category: "Market" },
          { title: "Repayment Success", desc: "Your automated EMI payment was successful.", icon: Clock, color: "text-indigo-primary", bg: "bg-indigo-primary/10", category: "Financial" }
        ];
        const randomNote = liveNotes[Math.floor(Math.random() * liveNotes.length)];
        addNotification({ ...randomNote, time: "Just now" });
      }
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
