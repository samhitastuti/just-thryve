import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Clock, 
  Hash, 
  Database, 
  AlertTriangle,
  Lock,
  Link as LinkIcon,
  Search
} from "lucide-react";
import { Card, Badge, Button } from "../components/UI";
import { MOCK_AUDIT_LOGS } from "../data/mockData";
import { cn } from "../lib/utils";

export function AuditLogs() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-soft">Blockchain Audit Trail</h1>
          <p className="text-slate-muted">Immutable record of all loan states, consents, and ESG updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-indigo-primary/10 px-4 py-2 text-xs font-medium text-indigo-primary border border-indigo-primary/20">
            <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-primary" />
            Network: JustThryve Mainnet
          </div>
          <Button variant="outline" size="sm">Verify All Blocks</Button>
        </div>
      </div>

      <div className="relative space-y-6 pl-12">
        {/* Connection Line */}
        <div className="absolute left-[2.25rem] top-0 h-full w-0.5 bg-gradient-to-b from-indigo-primary via-cyan-accent to-app-bg" />

        {MOCK_AUDIT_LOGS.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            {/* Block Icon */}
            <div className="absolute -left-[3rem] top-0 flex h-10 w-10 items-center justify-center rounded-xl bg-app-bg border border-indigo-primary/30 text-indigo-primary shadow-lg shadow-indigo-primary/10 z-10">
              <Database className="h-5 w-5" />
            </div>

            <Card className="group hover:border-indigo-primary/30 transition-all">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="success">Block #{1024 + i}</Badge>
                  <h3 className="text-lg font-bold text-slate-soft">{log.event}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-muted">
                  <Clock className="h-3 w-3" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>

              <p className="mb-6 text-sm text-slate-muted">{log.details}</p>

              <div className="grid gap-4 rounded-xl bg-black/40 p-4 font-mono text-[10px] md:grid-cols-2">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-slate-muted uppercase tracking-widest">
                    <Hash className="h-3 w-3" /> Current Hash
                  </p>
                  <p className="break-all text-indigo-primary/80">{log.hash}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-slate-muted uppercase tracking-widest">
                    <LinkIcon className="h-3 w-3" /> Previous Hash
                  </p>
                  <p className="break-all text-slate-muted">{log.prevHash}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-xs text-indigo-primary/60">
                  <ShieldCheck className="h-3 w-3" />
                  Signature Verified
                </div>
                <button className="text-xs text-slate-muted hover:text-slate-soft transition-colors">
                  View on Explorer →
                </button>
              </div>

              {/* Tamper Detection Overlay (Simulation) */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-indigo-primary/5" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-primary/50 to-transparent animate-scan" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Network Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Total Transactions", value: "12,845", icon: Database },
          { label: "Avg. Block Time", value: "2.4s", icon: Clock },
          { label: "Nodes Online", value: "142", icon: ShieldCheck },
        ].map((stat, i) => (
          <Card key={i} className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-muted">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-slate-soft">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
