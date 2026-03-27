"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function BecomeAmbassadorShareButton() {
  const [busy, setBusy] = useState(false);

  async function buildPosterBlob() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#052e16");
    gradient.addColorStop(0.6, "#111827");
    gradient.addColorStop(1, "#064e3b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = "#fcd34d";
    ctx.font = "700 44px Arial";
    ctx.fillText("AMUCHIE AMBASSADORS", 72, 100);
    ctx.font = "800 72px Arial";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText("BECOME AN AMBASSADOR", 72, 180);

    // Portrait block
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/meet-amuchie.png";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load share image."));
    });

    const cardX = 72;
    const cardY = 230;
    const cardW = canvas.width - 144;
    const cardH = 860;

    ctx.fillStyle = "rgba(212,175,55,0.95)";
    ctx.fillRect(cardX - 4, cardY - 4, cardW + 8, cardH + 8);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(cardX, cardY, cardW, cardH);

    const imgRatio = img.width / img.height;
    const targetRatio = cardW / cardH;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (imgRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, cardX, cardY, cardW, cardH);

    // Footer text
    ctx.fillStyle = "#f8fafc";
    ctx.font = "600 34px Arial";
    ctx.fillText("Service to Humanity • Imo 2027", 72, 1170);
    ctx.fillStyle = "#fde68a";
    ctx.font = "700 40px Arial";
    ctx.fillText("Join the movement today", 72, 1230);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/png"),
    );
  }

  async function onShare() {
    setBusy(true);
    const text =
      "I support Ezinwa Sir Stanley Chiedoziem Amuchie for Imo State 2027. Join the Amuchie Ambassadors movement.";
    try {
      const blob = await buildPosterBlob();
      if (blob) {
        const file = new File([blob], "become-an-ambassador.png", {
          type: "image/png",
        });
        const canNativeShare =
          typeof navigator !== "undefined" &&
          "share" in navigator &&
          "canShare" in navigator &&
          navigator.canShare({ files: [file] });

        if (canNativeShare) {
          await navigator.share({
            title: "Become an Ambassador",
            text,
            files: [file],
          });
          return;
        }

        const link = document.createElement("a");
        link.download = "become-an-ambassador.png";
        link.href = URL.createObjectURL(blob);
        link.click();
      }
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      disabled={busy}
      className="inline-flex items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-60"
    >
      {busy ? "Preparing..." : "Share on WhatsApp"}
      <Share2 className="ml-2 h-4 w-4" />
    </button>
  );
}

