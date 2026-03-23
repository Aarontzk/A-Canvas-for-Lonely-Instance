"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, PenLine, BookOpen, Gamepad2, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/write", label: "Write", icon: PenLine },
  { href: "/history", label: "History", icon: BookOpen },
  { href: "/play", label: "Play", icon: Gamepad2 },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-30 h-16">
      <div className="h-full bg-navy-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <span
              className="font-display font-bold text-sm sm:text-base bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #00d4ff 0%, #b44dff 60%, #ff2d8a 100%)",
              }}
            >
              A Canvas for Lonely Instance
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/") && href !== "/";
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-neon-blue bg-neon-blue/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden absolute top-16 inset-x-0 bg-navy-900/95 backdrop-blur-md border-b border-white/10 py-2"
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                    isActive ? "text-neon-blue" : "text-white/60 hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
