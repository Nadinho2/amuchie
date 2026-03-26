"use client";

import { useState } from "react";
import { DigitalCard, type AmbassadorLevel } from "@/components/id-card/DigitalCard";

export default function DemoDigitalCardPage() {
  const [level, setLevel] = useState<AmbassadorLevel>("bronze");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-5 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Demo</p>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          Premium Digital Ambassador ID Card
        </h1>
        <p className="text-sm text-zinc-300">
          Use the level buttons below to test Bronze, Silver, and Gold visuals.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLevel("bronze")}
          className="rounded-lg border border-amber-500/45 bg-amber-700/20 px-3 py-1.5 text-xs font-semibold text-amber-200"
        >
          Bronze
        </button>
        <button
          type="button"
          onClick={() => setLevel("silver")}
          className="rounded-lg border border-slate-400/45 bg-slate-600/25 px-3 py-1.5 text-xs font-semibold text-slate-100"
        >
          Silver
        </button>
        <button
          type="button"
          onClick={() => setLevel("gold")}
          className="rounded-lg border border-yellow-300/55 bg-yellow-400/20 px-3 py-1.5 text-xs font-semibold text-yellow-200"
        >
          Gold
        </button>
      </div>

      <DigitalCard
        fullName="Amuchie Nnamdi"
        ambassadorNumber="AA-2027-00001"
        lga="Aboh Mbaise"
        level={level}
      />
    </main>
  );
}

