import React from "react";
import { motion } from "motion/react";
import { 
  Bell, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Filter,
  Search
} from "lucide-react";
import { Card, Badge, Button } from "../components/UI";
import { cn } from "../lib/utils";

const MOCK_NOTIFICATIONS = [
  { 
    id: 1, 
    title: "EMI Reduced", 
    desc: "Your EMI for April was reduced by 12% due to lower revenue flow.", 
    time: "2h ago", 
    icon: TrendingDown, 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    category: "Financial",
    unread: true
  },
  { 
    id: 2, 
    title: "ESG Verification Success", 
    desc: "Your quarterly energy audit has been verified. Score updated.", 
    time: "1d ago", 
    icon: ShieldCheck, 
    color: "text-indigo-primary", 
    bg: "bg-indigo-primary/10",
    category: "Compliance",
    unread: false
  },
  { 
    id: 3, 
    title: "New Offer Available", 
    desc: "Based on your improved ESG score, you have a new pre-approved limit.", 
    time: "2d ago", 
    icon: Zap, 
    color: "text-cyan-accent", 
    bg: "bg-cyan-accent/10",
    category: "Offers",
    unread: false
  },
  { 
    id: 4, 
    title: "Payment Reminder", 
    desc: "Your next EMI payment is due in 3 days. Ensure sufficient balance.", 
    time: "3d ago", 
    icon: Clock, 
    color: "text-amber-400", 
    bg: "bg-amber-400/10",
    category: "Financial",
    unread: false
  },
  { 
    id: 5, 
    title: "System Maintenance", 
    desc: "The platform will be undergoing maintenance on Sunday at 2 AM IST.", 
    time: "5d ago", 
    icon: AlertCircle, 
    color: "text-slate-muted", 
    bg: "bg-slate-muted/10",
    category: "System",
    unread: false
  }
];

export function NotificationsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-app-text">Notifications</h1>
          <p className="text-app-muted">Stay updated with your business and credit status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">Mark all as read</Button>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_NOTIFICATIONS.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={cn(
              "relative border-border-subtle p-6 transition-all hover:border-indigo-primary/30",
              note.unread && "border-l-4 border-l-indigo-primary"
            )}>
              <div className="flex items-start gap-6">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", note.bg)}>
                  <note.icon className={cn("h-6 w-6", note.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-app-text">{note.title}</h3>
                      <Badge variant="default" className="text-[10px] bg-white/5 border-white/10">
                        {note.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-app-muted">{note.time}</span>
                  </div>
                  <p className="text-sm text-app-muted leading-relaxed">{note.desc}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <button className="text-xs font-bold text-indigo-primary hover:underline flex items-center gap-1">
                      View Details
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    {note.unread && (
                      <button className="text-xs font-medium text-app-muted hover:text-app-text">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-8">
        <Button variant="ghost" className="text-app-muted">
          Load older notifications
        </Button>
      </div>
    </div>
  );
}
