import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

type Params = Promise<{ programId: string }>;

async function ProgramDetailsContent({
  params,
}: {
  params: Params;
}) {
  const { programId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: program, error: programError } = await supabase
    .from("empowerment_programs")
    .select("id,title,description,program_type,date,location,lga,beneficiary_count,created_at,approved,created_by")
    .eq("id", programId)
    .maybeSingle();

  if (programError || !program) notFound();

  if (!program.approved) {
    let isAdmin = false;
    if (user?.id) {
      const { data: adminRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      isAdmin = Boolean(adminRow);
    }

    const canViewUnapproved =
      Boolean(user?.id) &&
      (program.created_by === user?.id || isAdmin);

    if (!canViewUnapproved) {
      notFound();
    }
  }

  const { data: uploads } = await supabase
    .from("program_uploads")
    .select("id,image_url,video_url,caption,created_at")
    .eq("program_id", programId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  const dateObj = new Date(program.date);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="rounded-3xl border border-amber-300/20 bg-zinc-900/40 p-5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge className="border-amber-300/40 bg-amber-300/10 text-amber-200">
              {program.program_type.replaceAll("_", " ")}
            </Badge>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              {program.title}
            </h1>
            <p className="text-sm text-zinc-300">{program.description}</p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateObj.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "2-digit",
              })}
            </p>
            <p className="mt-1 inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {program.lga ? `${program.lga} • ` : ""}
              {program.location}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="rounded-full border border-zinc-700 bg-zinc-950/40 px-3 py-1">
            Beneficiaries:{" "}
            <span className="font-bold text-amber-200">
              {program.beneficiary_count.toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-white">
          Approved Media Gallery
        </h2>

        {uploads?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploads.map((u) => (
              <figure
                key={u.id}
                className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/50"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-950/60">
                  {u.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.image_url}
                      alt={u.caption || "Program media"}
                      className="h-full w-full object-cover"
                    />
                  ) : u.video_url ? (
                    <video
                      src={u.video_url}
                      controls
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <figcaption className="space-y-1 border-t border-zinc-800 p-3">
                  <p className="line-clamp-2 text-xs text-zinc-300">
                    {u.caption || "Impact media upload"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {new Date(u.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            No approved uploads yet. Be the first to report impact for this program.
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProgramDetailsPage({
  params,
}: {
  params: Params;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading program details...
          </div>
        </main>
      }
    >
      <ProgramDetailsContent params={params} />
    </Suspense>
  );
}

