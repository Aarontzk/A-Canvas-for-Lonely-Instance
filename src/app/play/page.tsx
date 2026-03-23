"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { Puzzle, Paintbrush, Ghost } from "lucide-react";

const ACTIVITIES = [
  {
    href: "/play/draw",
    icon: Paintbrush,
    title: "Drawing Canvas",
    description: "Gambar bebas dengan pen, crayon, atau spray. Simpan karyamu ke galeri.",
    gradient: "from-neon-pink/20 to-neon-purple/20",
    border: "border-neon-pink/30",
    glow: "rgba(255, 45, 138, 0.3)",
    emoji: "🎨",
  },
  {
    href: "/play/puzzle",
    icon: Puzzle,
    title: "Jigsaw Puzzle",
    description: "Susun kepingan puzzle gambar. Menenangkan pikiran yang penuh.",
    gradient: "from-neon-blue/20 to-neon-teal/20",
    border: "border-neon-blue/30",
    glow: "rgba(0, 212, 255, 0.3)",
    emoji: "🧩",
  },
  {
    href: "/play/find-ghosty",
    icon: Ghost,
    title: "Find Ghosty",
    description: "Cari Ghosty yang asli di antara hantu-hantu penipu! Makin susah tiap level.",
    gradient: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-400/30",
    glow: "rgba(165, 180, 252, 0.3)",
    emoji: "👻",
  },
];

export default function PlayPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Take a break</h1>
          <p className="text-sm text-white/40 mt-1">
            Sometimes the best therapy is to play a little.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ACTIVITIES.map(({ href, icon: Icon, title, description, gradient, border, glow, emoji }, i) => (
            <Link key={href} href={href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4, boxShadow: `0 8px 40px ${glow}` }}
                className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-6 cursor-pointer group`}
                style={{ boxShadow: `0 0 0 0 ${glow}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{emoji}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-white/60" />
                      <h2 className="font-semibold text-white">{title}</h2>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{description}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon size={96} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
