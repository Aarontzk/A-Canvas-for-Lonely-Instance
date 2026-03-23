"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-neon-blue to-neon-purple text-white border border-neon-blue/30",
  secondary:
    "bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10",
  ghost: "bg-transparent border border-transparent text-white/70 hover:text-white hover:bg-white/5",
  danger:
    "bg-gradient-to-r from-red-500/80 to-neon-pink/80 text-white border border-red-500/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  glow = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.04 }}
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-neon-blue/50",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        glow && "shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]",
        className
      )}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading ? (
        <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
      ) : (
        children
      )}
    </motion.button>
  );
}
