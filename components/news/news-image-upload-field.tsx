"use client";

import { useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NEWS_BUCKET = "campaign-news-images";

export function NewsImageUploadField({
  userId,
}: {
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onFileSelect(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(NEWS_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage
        .from(NEWS_BUCKET)
        .getPublicUrl(filePath).data.publicUrl;

      setImageUrl(publicUrl);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not upload image.";
      if (message.toLowerCase().includes("bucket not found")) {
        setError(
          "Storage bucket 'campaign-news-images' is missing. Run the news image storage migration first.",
        );
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-200">Featured image upload (optional)</label>
      <div className="rounded-xl border border-dashed border-amber-300/35 bg-amber-300/5 p-3">
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800">
            <UploadCloud className="h-4 w-4" />
            {busy ? "Uploading..." : "Upload image"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              disabled={busy}
              onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
            />
          </label>
          {imageUrl ? (
            <span className="text-xs text-emerald-300">Image uploaded</span>
          ) : null}
        </div>
      </div>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Featured image preview"
          className="h-28 w-full rounded-xl border border-zinc-700 object-cover"
        />
      ) : null}

      <input type="hidden" name="featured_image_url" value={imageUrl} readOnly />

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

