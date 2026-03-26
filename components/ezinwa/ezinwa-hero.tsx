"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type EzinwaHeroProps = {
  badgeText?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function EzinwaHero({
  badgeText = "Ezinwa",
  ctaHref,
  ctaLabel,
}: EzinwaHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-300/20">
      <div className="relative h-[56vh] min-h-[360px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/65 to-zinc-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.18),_transparent_48%)]" />

        <div className="relative z-10 flex h-full items-end p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-3xl space-y-3"
          >
            <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
              {badgeText}
            </p>
            <h1 className="text-balance text-3xl font-extrabold text-white sm:text-5xl">
              Sir Stanley Chiedoziem Amuchie
            </h1>
            <p className="text-sm font-medium text-zinc-200 sm:text-base">
              Service to Humanity • Imo State 2027
            </p>
            {ctaHref && ctaLabel ? (
              <Link
                href={ctaHref}
                className="inline-flex rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/20"
              >
                {ctaLabel}
              </Link>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

