import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";
import {
  approveProgramAction,
  approveProgramUploadAction,
  rejectProgramAction,
  rejectProgramUploadAction,
} from "./actions";
import { Suspense } from "react";

type ProgramType =
  | "youth_leadership"
  | "rice_food_distributions"
  | "agricultural_skills"
  | "philanthropy_empowerment"
  | "other";

function programTypeLabel(type: ProgramType) {
  switch (type) {
    case "youth_leadership":
      return "Youth Leadership & Human Capital";
    case "rice_food_distributions":
      return "Rice & Food Distributions";
    case "agricultural_skills":
      return "Agricultural Skills & Entrepreneurship";
    case "philanthropy_empowerment":
      return "Empowerment / Philanthropy";
    default:
      return "Other";
  }
}

type PendingUpload = {
  id: string;
  program_id: string;
  user_id: string;
  caption: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  approved: boolean;
  rejected: boolean;
};

type ProgramRow = {
  id: string;
  title: string;
  program_type: ProgramType | string;
  date: string;
  location: string | null;
  lga: string | null;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  lga: string | null;
};

async function AdminProgramUploadsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) redirect("/programs?tab=all");

  const { data: pendingPrograms } = await supabase
    .from("empowerment_programs")
    .select("id,title,description,program_type,date,location,lga,beneficiary_count,created_at")
    .eq("approved", false)
    .eq("rejected", false)
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: uploads } = await supabase
    .from("program_uploads")
    .select(
      "id,program_id,user_id,caption,image_url,video_url,created_at,approved,rejected",
    )
    .eq("approved", false)
    .eq("rejected", false)
    .order("created_at", { ascending: false })
    .limit(50);

  const uploadList = (uploads ?? []) as PendingUpload[];

  const programIds = Array.from(
    new Set(uploadList.map((u) => u.program_id)),
  );
  const userIds = Array.from(new Set(uploadList.map((u) => u.user_id)));

  const { data: programs } = programIds.length
    ? await supabase
        .from("empowerment_programs")
        .select("id,title,program_type,date,location,lga")
        .in("id", programIds)
    : ({ data: [] } as { data: ProgramRow[] });

  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("user_id,full_name,lga")
        .in("user_id", userIds)
    : ({ data: [] } as { data: ProfileRow[] });

  const programById = new Map<string, ProgramRow>();
  (programs ?? []).forEach((p) => programById.set(p.id, p));

  const profileByUserId = new Map<string, ProfileRow>();
  (profiles ?? []).forEach((p) =>
    profileByUserId.set(p.user_id, p),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs text-amber-200">
          Admin Moderation Queue
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/news"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
          >
            News Dashboard
          </Link>
          <Link
            href="/admin/program-uploads"
            className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200"
          >
            Program Moderation
          </Link>
        </div>
        <h1 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">
          Approve Empowerment Evidence
        </h1>
        <p className="max-w-2xl text-sm text-zinc-300">
          Review pending program uploads. Approved media appears in the public
          programs feed immediately.
        </p>
      </header>

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Pending Programs</h2>
        {(pendingPrograms ?? []).length === 0 ? (
          <Card className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            No pending programs.
          </Card>
        ) : (
          (pendingPrograms ?? []).map((p) => (
            <Card
              key={p.id}
              className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Badge className="border-amber-300/40 bg-amber-300/10 text-amber-200">
                    Pending Program
                  </Badge>
                  <h3 className="mt-2 text-base font-extrabold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-zinc-300">{p.description}</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {new Date(p.date).toLocaleDateString()} • {p.lga ? `${p.lga} • ` : ""}
                    {p.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:w-56">
                  <form action={approveProgramAction}>
                    <input type="hidden" name="program_id" value={p.id} />
                    <Button
                      type="submit"
                      className="w-full bg-emerald-400/15 text-emerald-200 border border-emerald-300/30 hover:bg-emerald-400/20"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </form>
                  <form action={rejectProgramAction}>
                    <input type="hidden" name="program_id" value={p.id} />
                    <Button
                      type="submit"
                      className="w-full bg-red-400/10 text-red-200 border border-red-300/30 hover:bg-red-400/15"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-white">Pending Uploads</h2>
        {uploadList.length === 0 ? (
          <Card className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            No pending uploads right now. Come back later.
          </Card>
        ) : (
          uploadList.map((u) => {
            const program = programById.get(u.program_id);
            const uploader = profileByUserId.get(u.user_id);

            return (
              <Card
                key={u.id}
                className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-amber-300/40 bg-amber-300/10 text-amber-200">
                        Pending Evidence
                      </Badge>
                      {program?.program_type ? (
                        <Badge variant="outline" className="border-emerald-300/40 text-emerald-200">
                          {programTypeLabel(program.program_type as ProgramType)}
                        </Badge>
                      ) : null}
                    </div>

                    <h2 className="mt-3 line-clamp-2 text-base font-extrabold text-white">
                      {program?.title || "Program"}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-300">
                      Submitted by{" "}
                      <span className="font-semibold text-amber-200">
                        {uploader?.full_name || "Ambassador"}
                      </span>
                    </p>
                    {u.caption ? (
                      <p className="mt-2 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3 text-xs text-zinc-300">
                        {u.caption}
                      </p>
                    ) : null}

                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                      <Clock3 className="h-4 w-4" />
                      {new Date(u.created_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="w-full sm:w-64">
                    {u.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image_url}
                        alt="Program upload"
                        className="h-56 w-full rounded-3xl border border-zinc-700 object-cover"
                      />
                    ) : u.video_url ? (
                      <video
                        src={u.video_url}
                        controls
                        className="h-56 w-full rounded-3xl border border-zinc-700 object-cover"
                      />
                    ) : (
                      <div className="h-56 w-full rounded-3xl border border-zinc-700" />
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <form action={approveProgramUploadAction}>
                        <input type="hidden" name="upload_id" value={u.id} />
                        <Button
                          type="submit"
                          className="w-full bg-emerald-400/15 text-emerald-200 border border-emerald-300/30 hover:bg-emerald-400/20"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </form>

                      <form action={rejectProgramUploadAction}>
                        <input type="hidden" name="upload_id" value={u.id} />
                        <Button
                          type="submit"
                          className="w-full bg-red-400/10 text-red-200 border border-red-300/30 hover:bg-red-400/15"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </section>
    </main>
  );
}

export default function AdminProgramUploadsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading admin moderation queue...
          </div>
        </main>
      }
    >
      <AdminProgramUploadsContent />
    </Suspense>
  );
}

