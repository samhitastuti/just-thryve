import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Leaf, 
  Activity, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowRight,
  Filter,
  Search,
  MoreVertical,
  Zap,
  Globe,
  Lock
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";
import { Card, Badge, Button } from "../components/UI";
import { GlowCard } from "../components/GlowCard";
import Aurora from "../components/Aurora";
import { MOCK_REVENUE_DATA, MOCK_ESG_METRICS } from "../data/mockData";
import { formatCurrency, cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useESG } from "../context/ESGContext";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

const COLORS = ["#6366F1", "#4F46E5", "#22D3EE", "#0EA5E9"];

export function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLender = user?.role === 'LENDER';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-soft">
            {isLender ? "Lender Command Center" : "Business Overview"}
          </h1>
          <p className="text-slate-muted">
            {isLender 
              ? "Monitor your portfolio risk and ESG-linked assets." 
              : `Welcome back, ${user?.name.split(' ')[0]}. Here's your business performance.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLender ? (
            <>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter Assets
              </Button>
              <Button size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Portfolio Analytics
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm">Download Report</Button>
              <Button size="sm" onClick={() => navigate("/dashboard/apply")}>Apply for Loan</Button>
            </>
          )}
        </div>
      </motion.div>

      {isLender ? <LenderDashboard /> : <BorrowerDashboard />}
    </div>
  );
}

function BorrowerDashboard() {
  const { score: ecsScore } = useESG();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="relative space-y-12 overflow-hidden rounded-3xl p-8">
      {/* Aurora Background */}
      <Aurora 
        colorStops={["#1E293B", "#3B82F6", "#1E293B"]} 
        amplitude={0.8} 
        blend={0.8}
      />
      
      {/* Yin Yang Background Element */}
      <div className="absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full bg-indigo-primary/10 blur-[120px] pointer-events-none z-0" />
      
      {/* Yang Section: Active Growth */}
      <section className="relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-primary/20 to-indigo-primary/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-primary">Yang / Active Growth</h2>
          <div className="h-px w-12 bg-indigo-primary/50" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Growth Card */}
          <GlowCard className="lg:col-span-2 overflow-hidden border-none bg-app-bg/40 backdrop-blur-xl p-0" glowColor="rgba(99, 102, 241, 0.5)">
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-app-text">Revenue Flow</h3>
                  <p className="text-xs text-app-muted">Dynamic EMI adjustment based on real-time GST data</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-primary text-white shadow-lg shadow-indigo-500/20">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_REVENUE_DATA}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-app-text/5" vertical={false} />
                    <XAxis dataKey="month" stroke="currentColor" className="text-app-muted" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" className="text-app-muted" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--app-bg)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--app-text)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366F1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-border-subtle bg-app-text/5 backdrop-blur-sm">
              {[
                { label: "Avg. Revenue", value: "₹5.2L", icon: TrendingUp },
                { label: "EMI Ratio", value: "18%", icon: Activity },
                { label: "Next Payout", value: "12 Days", icon: Clock },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center border-r border-border-subtle p-4 last:border-none">
                  <item.icon className="mb-2 h-4 w-4 text-indigo-primary" />
                  <span className="text-[10px] uppercase tracking-widest text-app-muted">{item.label}</span>
                  <span className="text-sm font-bold text-app-text">{item.value}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          {/* ESG Circle - The "Eye" of Yang */}
          <GlowCard className="flex flex-col items-center justify-center border-none bg-app-bg/40 backdrop-blur-xl text-center" glowColor="rgba(99, 102, 241, 0.5)">
            <div className="relative mb-6">
              <svg className="h-48 w-48 -rotate-90 transform">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-primary/10" />
                <motion.circle
                  cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={502.6}
                  initial={{ strokeDashoffset: 502.6 }}
                  animate={{ strokeDashoffset: 502.6 - (502.6 * ecsScore) / 1000 }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="text-indigo-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-app-text tracking-tighter">{ecsScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-primary">ESG Score</span>
              </div>
            </div>
            <p className="text-xs text-app-muted max-w-[200px]">Your score is in the top 5% of your industry. Unlock lower rates by verifying energy data.</p>
            <Button variant="outline" size="sm" className="mt-6 rounded-full border-indigo-primary/30 text-indigo-primary hover:bg-indigo-primary/10">
              Verify Energy Data
            </Button>
          </GlowCard>
        </div>
      </section>

      {/* Yin Section: Stable Foundation */}
      <section className="relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px w-12 bg-cyan-accent/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-accent">Yin / Stable Foundation</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-accent/20 to-cyan-accent/50" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Repayment Progress */}
          <GlowCard className="border-none bg-app-bg/40 backdrop-blur-xl p-8" glowColor="rgba(34, 211, 238, 0.5)">
            <h3 className="mb-8 text-lg font-bold text-app-text">Repayment Stability</h3>
            <div className="space-y-8">
              <div className="relative h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { day: 'M', val: 40 }, { day: 'T', val: 60 }, { day: 'W', val: 45 }, 
                    { day: 'T', val: 80 }, { day: 'F', val: 55 }, { day: 'S', val: 30 }, { day: 'S', val: 20 }
                  ]}>
                    <Bar dataKey="val" fill="var(--color-cyan-accent)" opacity={0.3} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-app-text">65%</span>
                  <span className="text-[10px] uppercase tracking-widest text-app-muted">Total Repaid</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-app-muted">Principal Remaining</span>
                  <span className="text-app-text font-bold">₹8,75,000</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-app-text/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-cyan-accent" />
                </div>
              </div>
            </div>
          </GlowCard>

          {/* Live Notifications - The "Eye" of Yin */}
          <GlowCard className="lg:col-span-2 border-none bg-app-bg/40 backdrop-blur-xl" glowColor="rgba(99, 102, 241, 0.5)">
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-primary animate-pulse" />
                  <h3 className="text-lg font-bold text-app-text">Live Feed</h3>
                </div>
                <button 
                  onClick={() => navigate("/dashboard/notifications")}
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-primary hover:underline"
                >
                  Full History
                </button>
              </div>
              <div className="space-y-4">
                {notifications.slice(0, 3).map((note) => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group flex items-center gap-4 rounded-2xl bg-app-text/5 p-4 transition-all hover:bg-app-text/10"
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", note.bg)}>
                      <note.icon className={cn("h-5 w-5", note.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-app-text">{note.title}</p>
                      <p className="text-xs text-app-muted line-clamp-1">{note.desc}</p>
                    </div>
                    <span className="text-[10px] font-medium text-app-muted">{note.time}</span>
                    <ArrowRight className="h-4 w-4 text-app-muted opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          </GlowCard>
        </div>
      </section>
    </div>
  );
}

function LenderDashboard() {
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="relative space-y-12 overflow-hidden rounded-3xl p-8">
      {/* Aurora Background */}
      <Aurora 
        colorStops={["#1E293B", "#06B6D4", "#1E293B"]} 
        amplitude={0.8} 
        blend={0.8}
      />

      {/* Yin Yang Background Element */}
      <div className="absolute -left-20 -bottom-20 h-[600px] w-[600px] rounded-full bg-cyan-accent/10 blur-[120px] pointer-events-none z-0" />

      {/* Yin Section: Capital Stability */}
      <section className="relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px w-12 bg-indigo-primary/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-primary">Yin / Capital Stability</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-indigo-primary/20 to-indigo-primary/50" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total AUM", value: "₹42.5 Cr", icon: Globe, color: "text-indigo-primary", bg: "bg-indigo-primary/10", glow: "rgba(99, 102, 241, 0.3)" },
            { label: "Active Loans", value: "154", icon: Users, color: "text-cyan-accent", bg: "bg-cyan-accent/10", glow: "rgba(34, 211, 238, 0.3)" },
            { label: "Avg. ESG", value: "782", icon: Leaf, color: "text-indigo-primary", bg: "bg-indigo-primary/10", glow: "rgba(99, 102, 241, 0.3)" },
            { label: "Risk Level", value: "Low", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "rgba(52, 211, 153, 0.3)" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <GlowCard className="group relative overflow-hidden border-none bg-app-bg/40 backdrop-blur-xl p-6 transition-all hover:bg-app-bg/60" glowColor={stat.glow}>
                <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-app-muted">{stat.label}</p>
                <p className="text-2xl font-black text-app-text">{stat.value}</p>
                <div className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-app-text/5 blur-xl group-hover:bg-indigo-primary/10 transition-colors" />
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Yang Section: Active Deployment */}
      <section className="relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-accent/20 to-cyan-accent/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-accent">Yang / Active Deployment</h2>
          <div className="h-px w-12 bg-cyan-accent/50" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Incoming Requests */}
          <GlowCard className="lg:col-span-2 border-none bg-app-bg/40 backdrop-blur-xl p-8" glowColor="rgba(99, 102, 241, 0.5)">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-bold text-app-text">Active Opportunities</h3>
              <div className="flex items-center gap-2 rounded-full bg-app-text/5 px-4 py-1.5 border border-border-subtle">
                <Search className="h-3 w-3 text-app-muted" />
                <input type="text" placeholder="Filter SMEs..." className="bg-transparent text-xs text-app-text outline-none w-24" />
              </div>
            </div>
            <div className="space-y-4">
              {[
                { name: "GreenTech Solutions", amount: "₹45L", esg: 892, risk: "Low" },
                { name: "Solaris Mfg", amount: "₹1.2Cr", esg: 745, risk: "Med" },
                { name: "BioCycle Ind.", amount: "₹28L", esg: 915, risk: "Low" },
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl bg-app-text/5 p-4 border border-border-subtle hover:border-indigo-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-primary/10 flex items-center justify-center text-indigo-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-app-text group-hover:text-indigo-primary transition-colors">{req.name}</p>
                      <p className="text-[10px] text-app-muted uppercase tracking-widest">{req.amount} Requested</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[8px] uppercase text-app-muted">ESG</p>
                      <p className="text-sm font-black text-indigo-primary">{req.esg}</p>
                    </div>
                    <Badge variant={req.risk === "Low" ? "success" : "warning"}>{req.risk}</Badge>
                    <Button size="sm" className="rounded-full px-6">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>

          {/* Risk Heatmap - The "Eye" of Yang */}
          <GlowCard className="border-none bg-app-bg/40 backdrop-blur-xl text-center p-8" glowColor="rgba(34, 211, 238, 0.5)">
            <h3 className="mb-8 text-sm font-bold uppercase tracking-widest text-cyan-accent">Risk Distribution</h3>
            <div className="relative mb-8 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ v: 65 }, { v: 25 }, { v: 10 }]}
                    innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="v"
                  >
                    <Cell fill="var(--color-indigo-primary)" />
                    <Cell fill="var(--color-cyan-accent)" />
                    <Cell fill="rgba(var(--app-text-rgb), 0.1)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-app-text">Low</span>
                <span className="text-[8px] uppercase tracking-widest text-app-muted">Overall Risk</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                <span className="text-app-muted">Default Prob.</span>
                <span className="text-emerald-400 font-bold">1.2%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-app-text/5 overflow-hidden">
                <div className="h-full w-[12%] bg-emerald-400" />
              </div>
            </div>
          </GlowCard>
        </div>
      </section>
    </div>
  );
}

function Building2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

