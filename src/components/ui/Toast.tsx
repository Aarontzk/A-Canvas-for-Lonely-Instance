"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import type { Toast as ToastType } from "@/hooks/useToast";

interface ToastListProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error: <AlertCircle size={16} className="text-red-400" />,
  info: <Info size={16} className="text-neon-blue" />,
};

const borderColors = {
  success: "border-l-emerald-400",
  error: "border-l-red-400",
  info: "border-l-neon-blue",
};

export function ToastList({ toasts, onRemove }: ToastListProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`
              pointer-events-auto flex items-center gap-3 min-w-[260px] max-w-sm
              bg-navy-800/95 backdrop-blur-md border border-white/10 border-l-4
              ${borderColors[toast.type]} rounded-xl px-4 py-3 shadow-xl
            `}
          >
            {icons[toast.type]}
            <span className="text-sm text-white/90 flex-1">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
