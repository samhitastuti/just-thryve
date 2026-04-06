import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Moon, 
  Sun,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/UI';
import { cn } from '../lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  key?: React.Key;
}

const NavItem = ({ to, icon: Icon, label, active, collapsed }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
      active 
        ? "bg-indigo-primary/10 text-indigo-primary shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
        : "text-slate-muted hover:bg-white/5 hover:text-slate-soft"
    )}
  >
    <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110", active && "text-indigo-primary")} />
    {!collapsed && (
      <span className="font-medium tracking-wide">{label}</span>
    )}
    {active && (
      <motion.div 
        layoutId="active-nav"
        className="absolute left-0 h-6 w-1 rounded-r-full bg-indigo-primary"
      />
    )}
  </Link>
);

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/apply', icon: FileText, label: 'Apply for Loan' },
    { to: '/dashboard/offers', icon: Zap, label: 'Loan Offers' },
    { to: '/dashboard/repayments', icon: CreditCard, label: 'Repayments' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { to: '/dashboard/esg', icon: Globe, label: 'ESG Insights' },
    { to: '/dashboard/audit', icon: ShieldCheck, label: 'Audit Logs' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-app-bg font-sans text-app-text">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-indigo-primary/10 blur-[120px] dark:opacity-100 opacity-30" 
        />
        <motion.div 
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 bottom-0 h-[600px] w-[600px] rounded-full bg-cyan-accent/5 blur-[120px] dark:opacity-100 opacity-30" 
        />
        {/* Cursor Glow */}
        <div 
          className="absolute h-[400px] w-[400px] rounded-full bg-indigo-primary/5 blur-[100px] transition-transform duration-300 ease-out"
          style={{ 
            transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)`,
          }}
        />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-border-subtle bg-app-bg/50 backdrop-blur-xl transition-all duration-500 md:block",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-between px-2">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-primary to-cyan-accent shadow-lg shadow-indigo-500/20">
                <Zap className="h-6 w-6 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold tracking-tight text-app-text"
                >
                  JUST THRYVE
                </motion.span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                collapsed={isSidebarCollapsed}
              />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto space-y-4 pt-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex w-full items-center justify-center rounded-xl bg-white/5 py-2 text-slate-muted transition-colors hover:bg-white/10 hover:text-slate-soft"
            >
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-muted transition-all hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          "relative z-10 min-h-screen transition-all duration-500",
          "md:pl-64",
          isSidebarCollapsed && "md:pl-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border-subtle bg-app-bg/50 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-app-text">
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-xl font-bold tracking-tight text-app-text">JUST THRYVE</span>
          </div>

          {/* Search Bar */}
          <div className="hidden max-w-md flex-1 md:block">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-muted transition-colors group-focus-within:text-indigo-primary" />
              <input
                type="text"
                placeholder="Search analytics, loans, or SMEs..."
                className="h-11 w-full rounded-2xl bg-white/5 pl-10 pr-4 text-sm text-app-text outline-none border border-border-subtle transition-all focus:border-indigo-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-indigo-primary/10"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-muted transition-all hover:bg-white/10 hover:text-slate-soft"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-indigo-primary ring-2 ring-navy-deep" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 z-50 overflow-hidden rounded-2xl border border-border-subtle bg-app-bg shadow-2xl shadow-black/50"
                    >
                      <div className="flex items-center justify-between border-b border-border-subtle bg-white/5 p-4">
                        <h3 className="text-sm font-bold text-app-text">Notifications</h3>
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] font-bold text-indigo-primary uppercase tracking-wider hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((note) => (
                            <div 
                              key={note.id}
                              onClick={() => {
                                markAsRead(note.id);
                                setIsNotificationsOpen(false);
                              }}
                              className={cn(
                                "group flex cursor-pointer items-start gap-3 border-b border-border-subtle p-4 transition-colors hover:bg-white/5",
                                note.unread && "bg-indigo-primary/5"
                              )}
                            >
                              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", note.bg)}>
                                <note.icon className={cn("h-4 w-4", note.color)} />
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <p className={cn("text-xs font-bold text-app-text", note.unread && "text-indigo-primary")}>{note.title}</p>
                                <p className="text-[10px] leading-relaxed text-slate-muted line-clamp-2">{note.desc}</p>
                                <p className="text-[8px] text-slate-muted uppercase tracking-tighter">{note.time}</p>
                              </div>
                              {note.unread && (
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-primary mt-1.5" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-xs text-slate-muted">No new notifications</p>
                          </div>
                        )}
                      </div>
                      <Link 
                        to="/dashboard/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block bg-white/5 p-3 text-center text-[10px] font-bold text-slate-muted uppercase tracking-widest hover:text-indigo-primary transition-colors"
                      >
                        View All Notifications
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-muted transition-all hover:bg-white/10 hover:text-slate-soft"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-1.5 pr-4 transition-all hover:bg-white/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-primary to-cyan-accent text-xs font-bold text-white">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden flex-col md:flex">
                <span className="text-xs font-bold text-app-text">{user?.name}</span>
                <span className="text-[10px] text-slate-muted uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-navy-deep/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-navy-deep p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-primary to-cyan-accent">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-soft">JUST THRYVE</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-muted">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    active={location.pathname === item.to}
                    collapsed={false}
                  />
                ))}
              </nav>
              <div className="absolute bottom-6 left-6 right-6">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
