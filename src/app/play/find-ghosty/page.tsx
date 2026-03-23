"use client";

import { PageTransition } from "@/components/layout/PageTransition";
import { FindGhosty } from "@/components/findghosty/FindGhosty";

export default function FindGhostyPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Find Ghosty</h1>
          <p className="text-sm text-white/40 mt-1">
            Temukan Ghosty yang asli di antara para penipu! Semakin cepat, semakin keren.
          </p>
        </div>
        <FindGhosty />
      </div>
    </PageTransition>
  );
}
