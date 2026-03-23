"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Quote } from "lucide-react";
import { useRandomQuote } from "@/hooks/useRandomQuote";

export function QuoteDisplay() {
  const { quote, refreshQuote } = useRandomQuote();

  return (
    <div className="relative max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
        >
          <Quote
            size={20}
            className="mx-auto mb-3 opacity-30"
            style={{ color: "#00d4ff" }}
          />
          <p
            className="italic text-white/80 leading-relaxed text-sm sm:text-base"
            style={{ textShadow: "0 0 20px rgba(0, 212, 255, 0.15)" }}
          >
            {quote.text}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            {quote.author && (
              <span className="text-xs text-white/40">— {quote.author}</span>
            )}
            <span
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-neon-blue/10 text-neon-blue/70"
            >
              {quote.language === "id" ? "ID" : "EN"}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={refreshQuote}
        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-navy-800 border border-white/10 text-white/40 hover:text-neon-blue hover:border-neon-blue/30 transition-all"
        aria-label="New quote"
      >
        <RefreshCw size={12} />
      </button>
    </div>
  );
}
