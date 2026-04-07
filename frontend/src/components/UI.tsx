import React, { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  key?: React.Key;
}

export function Card({ children, className, glass = true }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 p-6 shadow-xl transition-all duration-300",
        glass 
          ? "bg-white/5 dark:bg-white/5 light:bg-white/80 backdrop-blur-xl" 
          : "bg-navy-deep dark:bg-navy-deep light:bg-white",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-indigo-primary text-white hover:bg-indigo-hover shadow-indigo-primary/30 rounded-2xl",
    secondary: "border border-indigo-primary text-indigo-primary hover:bg-indigo-primary/10 rounded-2xl",
    outline: "border border-white/20 text-slate-soft hover:bg-white/5 rounded-2xl",
    ghost: "text-slate-muted dark:text-slate-muted light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 rounded-2xl",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

export function Badge({ children, className, variant = "default" }: { children: ReactNode, className?: string, variant?: "default" | "success" | "warning" | "error" | "outline" }) {
  const variants = {
    default: "bg-white/10 dark:bg-white/10 light:bg-slate-100 text-slate-soft dark:text-slate-soft light:text-slate-900",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/20",
    error: "bg-rose-500/20 text-rose-400 border border-rose-500/20",
    outline: "border border-white/10 text-slate-muted bg-transparent",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
