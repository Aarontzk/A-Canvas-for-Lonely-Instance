"use client";

import Link from "next/link";
import { PageTransition } from "@/components/layout/PageTransition";
import { GhostMascot } from "@/components/mascot/GhostMascot";
import { QuoteDisplay } from "@/components/quotes/QuoteDisplay";
import { Button } from "@/components/ui/Button";
import { PenLine, BookOpen } from "lucide-react";
import { useGhostInteraction } from "@/hooks/useGhostInteraction";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up this late?";
  if (hour < 9) return "Good morning, soul.";
  if (hour < 12) return "How's your heart today?";
  if (hour < 17) return "Afternoon thoughts...";
  if (hour < 21) return "Evening feels welcome here.";
  return "Late night thoughts?";
}

export default function HomePage() {
  const greeting = getTimeGreeting();
  const ghost = useGhostInteraction();

  return (
    <PageTransition>
      <div className="flex flex-col items-center gap-10 py-8">
        {/* Quote */}
        <QuoteDisplay />

        {/* Mascot + greeting */}
        <div className="flex flex-col items-center gap-4 text-center">
          <GhostMascot
            mood={ghost.currentMood}
            size={140}
            interactive
            isWiggling={ghost.isWiggling}
            dialogueLine={ghost.dialogueLine}
            onTap={ghost.onTap}
            onHoverStart={ghost.onHoverStart}
            onHoverEnd={ghost.onHoverEnd}
          />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-white/90">{greeting}</p>
            <p className="text-sm text-white/45 max-w-xs">
              This is your canvas. No rules, no judgment. Just you and your thoughts.
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/write">
            <Button variant="primary" size="lg" glow className="w-full sm:w-auto">
              <PenLine size={18} />
              Pour your heart out
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <BookOpen size={18} />
              Read past entries
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
