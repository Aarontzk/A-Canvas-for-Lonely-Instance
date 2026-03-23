"use client";

import { PageTransition } from "@/components/layout/PageTransition";
import { PopItGhosty } from "@/components/popit/PopItGhosty";

export default function PopItPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pop It Ghosty</h1>
          <p className="text-sm text-white/40 mt-1">
            Tekan semua gelembung. Satisfying banget, cobain deh.
          </p>
        </div>
        <PopItGhosty />
      </div>
    </PageTransition>
  );
}
