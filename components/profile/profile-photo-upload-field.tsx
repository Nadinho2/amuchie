"use client";

import { useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PROFILE_BUCKET = "profile-photos";

export function ProfilePhotoUploadField({
  userId,
  initialPhotoUrl,
}: {
  userId: string;
  initialPhotoUrl?: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSelectFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage
        .from(PROFILE_BUCKET)
        .getPublicUrl(path).data.publicUrl;

      setPhotoUrl(publicUrl);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not upload profile photo.";
      if (message.toLowerCase().includes("bucket not found")) {
        setError(
          "Storage bucket 'profile-photos' is missing. Run the profile photo storage migration first.",
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
      <label className="mb-1 block text-sm text-zinc-300">Profile photo</label>
      <div className="rounded-2xl border border-dashed border-amber-300/30 bg-amber-300/5 p-3">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-amber-300/40 bg-zinc-900">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                No photo
              </div>
            )}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800">
            <UploadCloud className="h-4 w-4" />
            {busy ? "Uploading..." : "Upload photo"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
              disabled={busy}
            />
          </label>
        </div>
      </div>

      {/* This hidden field is submitted by the server action form */}
      <input type="hidden" name="photo_url" value={photoUrl} readOnly />

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

