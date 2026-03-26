"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createEmpowermentProgramAction, createProgramUploadsAction, type CreateEmpowermentProgramInput, type ProgramUploadKind } from "@/app/programs/actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

const STORAGE_BUCKET = "program-uploads";
const MAX_FILES = 20;

const programTypeOptions: Array<CreateEmpowermentProgramInput["program_type"]> = [
  "youth_leadership",
  "rice_food_distributions",
  "agricultural_skills",
  "philanthropy_empowerment",
  "other",
];

function programTypeLabel(type: CreateEmpowermentProgramInput["program_type"]) {
  switch (type) {
    case "youth_leadership":
      return "Youth Leadership & Human Capital Training";
    case "rice_food_distributions":
      return "Rice & Food Distributions";
    case "agricultural_skills":
      return "Agricultural Skills & Entrepreneurship";
    case "philanthropy_empowerment":
      return "Philanthropy / Empowerment Events";
    default:
      return "Other";
  }
}

type PreviewItem = {
  file: File;
  url: string;
  kind: ProgramUploadKind;
};

export function SubmitProgramDialog() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [programType, setProgramType] = useState<CreateEmpowermentProgramInput["program_type"]>("youth_leadership");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [lga, setLga] = useState("");
  const [beneficiaryCount, setBeneficiaryCount] = useState<number>(0);
  const [caption, setCaption] = useState<string>("");

  const [files, setFiles] = useState<PreviewItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const onFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    setNotice(null);

    const incoming: PreviewItem[] = Array.from(fileList).map((file) => {
      const kind: ProgramUploadKind = file.type.startsWith("video/") ? "video" : "image";
      return {
        file,
        url: URL.createObjectURL(file),
        kind,
      };
    });

    const combined = [...files, ...incoming];
    const trimmed = combined.slice(0, MAX_FILES);
    setFiles(trimmed);

    if (combined.length > MAX_FILES) {
      setNotice(`Only ${MAX_FILES} files are allowed per submission.`);
    }
  };

  const canSubmit = title.trim() && description.trim() && location.trim() && date && files.length > 0;

  async function uploadAll() {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Please log in again.");

      const programInput: CreateEmpowermentProgramInput = {
        title,
        description,
        program_type: programType,
        date,
        location,
        lga: lga.trim() || undefined,
        beneficiary_count: Number.isFinite(beneficiaryCount)
          ? Math.max(0, Math.floor(beneficiaryCount))
          : 0,
      };

      const { programId } = await createEmpowermentProgramAction(programInput);

      const uploaded: Array<{ kind: ProgramUploadKind; url: string }> = [];

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        const ext = item.file.name.split(".").pop() || (item.kind === "video" ? "mp4" : "jpg");
        const path = `${user.id}/${programId}/${crypto.randomUUID()}_${ext}_${item.file.name}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, item.file, {
            cacheControl: "3600",
            contentType: item.file.type || (item.kind === "video" ? "video/mp4" : "image/jpeg"),
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
        uploaded.push({ kind: item.kind, url: publicUrl });

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      await createProgramUploadsAction({
        program_id: programId,
        caption: caption.trim() || undefined,
        uploads: uploaded,
      });

      setOpen(false);
      router.push("/programs?tab=my&uploaded=1");
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed. Please try again.";
      if (message.toLowerCase().includes("bucket not found")) {
        setError(
          "Storage bucket 'program-uploads' is missing. Run the storage migration (0004_program_uploads_storage.sql) in Supabase, then retry.",
        );
      } else {
        setError(message);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-amber-300/10 text-amber-200 hover:bg-amber-300/20 border-amber-300/30">
          Submit New Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto border border-zinc-700 bg-zinc-950 text-zinc-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Submit an Empowerment Program
          </DialogTitle>
          <DialogDescription className="text-zinc-300">
            Upload photos/videos. Submissions start as pending for moderation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Youth Leadership Training" />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened? Who was empowered? Outcome focus." />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Program Type</Label>
              <Select value={programType} onValueChange={(v) => setProgramType(v as CreateEmpowermentProgramInput["program_type"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  {programTypeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {programTypeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Community / venue" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lga">LGA (optional)</Label>
              <Input id="lga" value={lga} onChange={(e) => setLga(e.target.value)} placeholder="Owerri Municipal" />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="beneficiaries">Beneficiary Count</Label>
            <Input
              id="beneficiaries"
              type="number"
              min={0}
              value={beneficiaryCount}
              onChange={(e) => setBeneficiaryCount(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="caption">Optional caption for uploads</Label>
            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Rice distribution in Ahiazu Mbaise" />
          </div>

          <div
            className="relative grid gap-2 rounded-2xl border border-dashed border-amber-300/30 bg-amber-300/5 p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFilesSelected(e.dataTransfer.files);
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-200 flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Drag & drop photos/videos
                </p>
                <p className="text-xs text-zinc-400">
                  Or choose files. Multiple uploads allowed (max {MAX_FILES}).
                </p>
              </div>
              <label className="cursor-pointer rounded-xl border border-amber-300/30 bg-zinc-900/40 px-3 py-2 text-xs text-amber-200 hover:bg-zinc-900/60">
                Choose files
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => onFilesSelected(e.target.files)}
                />
              </label>
            </div>

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  key="previews"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-3 gap-2"
                >
                  {files.map((f) => (
                    <div key={f.url} className="relative aspect-square overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                      {f.kind === "video" ? (
                        <video src={f.url} className="h-full w-full object-cover" muted playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.url} alt="Preview" className="h-full w-full object-cover" />
                      )}
                      <div className="absolute left-2 top-2 rounded-full bg-black/40 p-1">
                        {f.kind === "video" ? (
                          <VideoIcon className="h-3.5 w-3.5 text-amber-200" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-amber-200" />
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid gap-2">
            <Progress value={progress} />
            <p className="text-xs text-zinc-400">
              {uploading ? `Uploading... ${progress}%` : "Ready to submit"}
            </p>
          </div>
          {notice && (
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
              {notice}
            </p>
          )}

          {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>}
        </div>

        <DialogFooter className="sticky bottom-0 -mx-1 mt-2 gap-2 border-t border-zinc-800 bg-zinc-950/95 px-1 py-3 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={uploadAll}
            disabled={!canSubmit || uploading}
            className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-zinc-900"
          >
            {uploading ? "Uploading..." : `Create Program & Upload`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

