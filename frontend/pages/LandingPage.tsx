import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Leaf, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Globe, 
  Lock,
  ChevronRight,
  Sun,
  Moon,
  Play,
  CheckCircle2,
  Activity,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Button, Card, Badge } from "../components/UI";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

import { HeroSection } from "../components/ui/hero-odyssey";

export function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-slate-soft selection:bg-indigo-primary/30">
      <HeroSection />
      
      {/* Stats Section */}
      <section className="relative z-10 py-32 px-6 border-y border-white/5 bg-navy-deep/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
            {[
              { label: "Credit Enabled", value: "₹500Cr+", icon: Activity },
              { label: "Active SMEs", value: "1,200+", icon: Users },
              { label: "ESG Verified", value: "98.5%", icon: ShieldCheck },
              { label: "CO2 Tracked", value: "15k Tons", icon: Leaf },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-all duration-500 group-hover:bg-indigo-primary/10 group-hover:scale-110">
                  <stat.icon className="h-8 w-8 text-indigo-primary" />
                </div>
                <p className="text-5xl font-bold text-slate-soft md:text-6xl tracking-tighter mb-2">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-muted uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="relative z-10 py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge className="mb-4">The Challenge</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-soft mb-6">Why SMEs Struggle to Scale</h2>
            <p className="text-slate-muted max-w-2xl mx-auto">Traditional lending models are broken for modern, sustainable businesses.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Collateral Trap", desc: "Most lenders require physical assets, leaving asset-light digital businesses behind.", icon: Lock },
              { title: "NTC Barrier", desc: "New-To-Credit businesses are often rejected due to lack of formal credit history.", icon: ShieldCheck },
              { title: "The ESG Gap", desc: "Sustainability efforts aren't rewarded with better financial terms—until now.", icon: Leaf },
            ].map((item, i) => (
              <Card key={i} className="p-8 border-white/5 bg-white/[0.02]">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-6">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-soft mb-4">{item.title}</h3>
                <p className="text-slate-muted text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="relative z-10 py-32 px-6 bg-indigo-primary/5">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4">Our Solution</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-soft mb-8">The Future of <br /><span className="text-indigo-primary">Flow-Based Credit</span></h2>
              <div className="space-y-6">
                {[
                  { title: "OCEN Integration", desc: "Seamlessly connect to the Open Credit Enablement Network for instant verification.", icon: Zap },
                  { title: "AI Underwriting", desc: "Our proprietary engine analyzes real-time cash flow, not just balance sheets.", icon: Activity },
                  { title: "ESG Scoring", desc: "Get rewarded for your sustainability impact with lower interest rates.", icon: Leaf },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-primary/20 flex items-center justify-center text-indigo-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-soft">{item.title}</h4>
                      <p className="text-slate-muted text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-indigo-primary/20 blur-[120px]" />
              <Card className="relative p-0 overflow-hidden border-white/10">
                <div className="bg-white/5 p-4 border-b border-white/10 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="ml-4 text-xs text-slate-muted font-mono">architecture_preview.v1</span>
                </div>
                <div className="p-8 bg-navy-deep/80 font-mono text-xs space-y-4">
                  <div className="text-indigo-primary">{"{"}</div>
                  <div className="pl-4 text-slate-soft">"protocol": "OCEN-v4",</div>
                  <div className="pl-4 text-slate-soft">"verification": "GST_REALTIME",</div>
                  <div className="pl-4 text-slate-soft">"esg_engine": <span className="text-emerald-400">"ACTIVE"</span>,</div>
                  <div className="pl-4 text-slate-soft">"smart_contract": "DEPLOYED",</div>
                  <div className="pl-4 text-slate-soft">"audit_trail": "IMMUTABLE"</div>
                  <div className="text-indigo-primary">{"}"}</div>
                  <div className="pt-4 flex justify-center">
                    <div className="h-24 w-px bg-gradient-to-b from-indigo-primary to-transparent" />
                  </div>
                  <div className="text-center text-indigo-primary animate-pulse">SYSTEMS_SYNCED</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <Card className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-primary/20 to-cyan-accent/10 border-indigo-primary/20 p-12 md:p-20 text-center">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-primary/20 blur-[80px]" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-accent/20 blur-[80px]" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8 text-4xl font-bold md:text-6xl text-slate-soft leading-tight">
                Ready to Scale Your <br />
                Sustainable Business?
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-lg text-slate-muted">
                Join 1,200+ SMEs who are already growing with JUST THRYVE. Apply in minutes and get funded in days.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/login">
                  <Button size="lg" className="h-14 px-10 text-lg shadow-2xl shadow-indigo-500/40">
                    Get Started
                  </Button>
                </Link>
                <Link to="/dashboard/apply">
                  <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-white/10 hover:bg-white/5">
                    Apply for Loan
                  </Button>
                </Link>
              </div>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-20 px-6 bg-navy-deep/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-primary to-cyan-accent">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-soft">JUST THRYVE</span>
              </div>
              <p className="max-w-xs text-slate-muted leading-relaxed">
                Empowering the green economy through innovative financial technology and ESG-linked credit solutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-soft mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-muted">
                <li><a href="#" className="hover:text-indigo-primary transition-colors">Borrowers</a></li>
                <li><a href="#" className="hover:text-indigo-primary transition-colors">Lenders</a></li>
                <li><a href="#" className="hover:text-indigo-primary transition-colors">ESG Framework</a></li>
                <li><a href="#" className="hover:text-indigo-primary transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-soft mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-muted">
                <li><a href="#" className="hover:text-indigo-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-primary transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-indigo-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-slate-muted">© 2026 JUST THRYVE. All rights reserved.</p>
            <div className="flex gap-8 text-xs text-slate-muted">
              <a href="#" className="hover:text-slate-soft transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-soft transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-soft transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
