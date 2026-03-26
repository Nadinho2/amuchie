"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { motion, useMotionValue, useSpring } from "framer-motion";
import confetti from "canvas-confetti";
import { Crown, Download, FileDown, Share2, Star } from "lucide-react";

export type AmbassadorLevel = "bronze" | "silver" | "gold";

export type DigitalCardProps = {
  fullName: string;
  ambassadorNumber: string;
  level: AmbassadorLevel;
  lga?: string | null;
  photoUrl?: string | null;
};

// Replace this URL anytime with your preferred official portrait.
const SIR_STANLEY_IMAGE_URL = "/images/sir-stanley-amuchie.png";

const levelOrder: Record<AmbassadorLevel, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
};

const levelPalette: Record<AmbassadorLevel, string> = {
  bronze: "border-amber-500/50 bg-amber-700/20 text-amber-300",
  silver: "border-slate-300/60 bg-slate-300/20 text-slate-100",
  gold: "border-yellow-300/70 bg-yellow-300/20 text-yellow-200",
};

export function DigitalCard({
  fullName,
  ambassadorNumber,
  level,
  lga,
  photoUrl,
}: DigitalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const previousLevel = useRef<AmbassadorLevel>(level);
  const [busy, setBusy] = useState<"png" | "pdf" | "share" | null>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 140, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 140, damping: 18 });

  useEffect(() => {
    const prev = previousLevel.current;
    if (levelOrder[level] > levelOrder[prev]) {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.7 },
      });
    }
    previousLevel.current = level;
  }, [level]);

  const qrValue = useMemo(
    () => `AMUCHIE|${ambassadorNumber}|${fullName}|${level.toUpperCase()}`,
    [ambassadorNumber, fullName, level],
  );

  async function getCardPngDataUrl() {
    if (!cardRef.current) return "";
    return toPng(cardRef.current, { cacheBust: true, pixelRatio: 2.4 });
  }

  async function downloadPng() {
    setBusy("png");
    try {
      const dataUrl = await getCardPngDataUrl();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `${ambassadorNumber}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    setBusy("pdf");
    try {
      const dataUrl = await getCardPngDataUrl();
      if (!dataUrl) return;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.98], // credit-card-like ratio
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 85.6, 53.98);
      pdf.save(`${ambassadorNumber}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  async function shareWhatsApp() {
    setBusy("share");
    try {
      // Prepare the card image first, so user can attach it immediately.
      await downloadPng();
      const text = encodeURIComponent(
        `I'm an Amuchie Ambassador supporting Ezinwa 2027.\n${fullName} • ${ambassadorNumber}\nService to Humanity`,
      );
      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(null);
    }
  }

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 8);
    rotateX.set((0.5 - py) * 8);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <motion.div
        style={{
          rotateX: springX,
          rotateY: springY,
          transformPerspective: 1200,
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group"
      >
        <div className="rounded-[26px] bg-gradient-to-br from-[#D4AF37] via-[#E8B923] to-[#9f7f18] p-[1.5px] shadow-2xl shadow-[#D4AF37]/15">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#006400] p-4 sm:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.20),_transparent_45%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.04),transparent)]" />

            <div className="relative z-10 space-y-4">
              <header className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#E8B923]">
                    Amuchie Ambassadors
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-white">
                    Digital ID Card
                  </h3>
                </div>
                <p className="text-right text-[10px] text-zinc-300 sm:text-[11px]">
                  Ezinwa Sir Stanley Chiedoziem Amuchie
                  <br />
                  Imo 2027
                </p>
              </header>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-3 sm:max-w-[220px]">
                  <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-[#E8B923]/85 bg-zinc-900 shadow-lg shadow-[#E8B923]/20 sm:h-32 sm:w-32">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-[#E8B923]">
                        {(fullName || "A").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="mx-auto w-fit rounded-xl border border-[#E8B923]/35 bg-black/30 p-2">
                    <QRCode
                      value={qrValue}
                      size={118}
                      bgColor="transparent"
                      fgColor="#F8FAFC"
                    />
                  </div>
                </div>

                <div className="space-y-3 self-center">
                  <h2 className="text-balance text-xl font-extrabold leading-tight text-white sm:text-2xl">
                    {fullName}
                  </h2>
                  <p className="font-mono text-sm font-bold tracking-wide text-[#E8B923] sm:text-base">
                    {ambassadorNumber}
                  </p>
                  <p className="text-sm text-zinc-200">{lga || "Imo State"}</p>

                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${levelPalette[level]}`}>
                    {level === "gold" ? (
                      <Crown className="h-3.5 w-3.5" />
                    ) : (
                      <Star className="h-3.5 w-3.5" />
                    )}
                    {level}
                  </div>
                </div>
              </section>

              <footer className="flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-end">
                <div className="max-w-[72%] sm:max-w-[78%]">
                  <p className="text-xs text-zinc-200">
                    Service to Humanity • Ezinwa Sir Stanley Chiedoziem Amuchie 2027
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Proud Member of Amuchie&apos;s Movement
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-2 rounded-xl border border-[#E8B923]/40 bg-black/25 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SIR_STANLEY_IMAGE_URL}
                    alt="Sir Stanley Chiedoziem Amuchie portrait"
                    className="h-[66px] w-[66px] rounded-lg border border-[#E8B923]/55 object-cover"
                  />
                </div>
              </footer>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={downloadPng}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/65 px-3 py-2.5 text-sm text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {busy === "png" ? "Generating..." : "Download PNG"}
        </button>

        <button
          type="button"
          onClick={downloadPdf}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/65 px-3 py-2.5 text-sm text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
        >
          <FileDown className="h-4 w-4" />
          {busy === "pdf" ? "Generating..." : "Download PDF"}
        </button>

        <button
          type="button"
          onClick={shareWhatsApp}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/65 bg-emerald-500/15 px-3 py-2.5 text-sm text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" />
          {busy === "share" ? "Preparing..." : "Share on WhatsApp"}
        </button>
      </div>
    </div>
  );
}

