import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgramCard } from "@/components/programs/program-card";
import { ProgramFilters } from "@/components/programs/program-filters";
import { SubmitProgramDialog } from "@/components/programs/submit-program-dialog";
import { ReportImpactDialog } from "@/components/programs/report-impact-dialog";
import type { CreateEmpowermentProgramInput } from "@/app/programs/actions";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function ProgramsPageContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  noStore();
  const sp = await searchParams;
  const tab = one(sp.tab) === "my" ? "my" : "all";
  const uploaded = one(sp.uploaded) === "1";
  const programType = one(sp.program_type);
  const lga = one(sp.lga);
  const date = one(sp.date);
  const programTypeValue =
    (programType as CreateEmpowermentProgramInput["program_type"] | undefined) ||
    "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (tab === "my" && !user) {
    redirect("/auth/login");
  }

  // Fetch programs for public feed / select controls.
  const programsQuery = supabase
    .from("empowerment_programs")
    .select("id,title,description,program_type,date,location,lga,beneficiary_count")
    .eq("approved", true)
    .order("date", { ascending: false })
    .limit(24);

  const programsQueryForSelect = supabase
    .from("empowerment_programs")
    .select("id,title,lga,location,date")
    .eq("approved", true)
    .order("date", { ascending: false })
    .limit(50);

  if (programType) {
    programsQuery.eq("program_type", programType);
  }
  if (lga) {
    programsQuery.eq("lga", lga);
    programsQueryForSelect.eq("lga", lga);
  }
  if (date) {
    // Filter by UTC date.
    programsQuery.gte("date", `${date}T00:00:00.000Z`);
    programsQuery.lte("date", `${date}T23:59:59.999Z`);
  }

  const [
    { data: programs, error: programsError },
    { data: programsForSelect },
  ] = await Promise.all([programsQuery, programsQueryForSelect]);

  const programsList = programs ?? [];
  const programIds = programsList.map((p) => p.id);

  // Latest approved media thumbnails per program (best-effort).
  const programThumbnails = new Map<string, string>();
  if (programIds.length) {
    const { data: uploads } = await supabase
      .from("program_uploads")
      .select("program_id,image_url,video_url,created_at")
      .eq("approved", true)
      .in("program_id", programIds)
      .order("created_at", { ascending: false })
      .limit(80);

    for (const u of uploads ?? []) {
      if (!programThumbnails.has(u.program_id)) {
        programThumbnails.set(
          u.program_id,
          u.image_url || u.video_url || "",
        );
      }
    }
  }

  const programsForReportDialog =
    (programsForSelect ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      lga: p.lga,
      location: p.location,
      date: p.date,
    })) ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs text-amber-200">
          Impact Programs & Empowerment Activities
        </div>
        <h1 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">
          Goodlight Foundation
          <span className="block bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Empowerment Portal
          </span>
        </h1>
        <p className="max-w-2xl text-sm text-zinc-300">
          Explore real empowerment programs across Imo State. Submit photos/videos for
          moderation so verified activities appear in the public feed.
        </p>
        {programsError ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
            Could not load public programs: {programsError.message}
          </div>
        ) : null}
      </header>

      <nav className="mt-6 flex items-center gap-2">
        <Link
          href={`/programs?tab=all${programType ? `&program_type=${encodeURIComponent(programType)}` : ""}${lga ? `&lga=${encodeURIComponent(lga)}` : ""}${date ? `&date=${encodeURIComponent(date)}` : ""}`}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            tab === "all"
              ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
              : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-white"
          }`}
        >
          All Programs
        </Link>
        <Link
          href="/programs?tab=my"
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            tab === "my"
              ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-200"
              : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-white"
          }`}
        >
          My Impact Reports
        </Link>
      </nav>

      <section className="mt-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/80">
          Ambassador Upload Panel
        </p>
        {user ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <SubmitProgramDialog />
            <ReportImpactDialog programs={programsForReportDialog} />
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-300">
            Sign in to submit new programs and upload impact evidence.
            <Link
              href="/auth/login"
              className="ml-2 inline-flex rounded-lg border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-300/20"
            >
              Login
            </Link>
          </div>
        )}
      </section>

      {tab === "all" ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <ProgramFilters
              initialProgramType={programTypeValue}
              initialLga={lga}
              initialDate={date}
            />

            {!user && (
              <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-300">
                Log in as an ambassador to submit impact uploads.
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-300">
                Showing <span className="font-bold text-white">{programsList.length}</span> programs
              </p>
            </div>

            {programsList.length === 0 ? (
              <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
                No programs found for your filters yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {programsList.map((p) => (
                  <ProgramCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    description={p.description}
                    program_type={p.program_type}
                    date={p.date}
                    location={p.location}
                    lga={p.lga}
                    beneficiary_count={p.beneficiary_count}
                    thumbnailUrl={programThumbnails.get(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-6">
          {!user ? (
            <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
              Please log in to view your impact reports.
            </div>
          ) : (
            <>
              {uploaded && (
                <div className="mb-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  Upload submitted successfully. It is now pending moderation.
                </div>
              )}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-3">
                  <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4 text-xs text-zinc-400">
                    Your uploads appear here immediately as pending, and move to approved after moderation.
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <MyImpactReportsList userId={user.id} />
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}

export default function ProgramsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading impact programs...
          </div>
        </main>
      }
    >
      <ProgramsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MyImpactReportsList({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: uploads, error } = await supabase
    .from("program_uploads")
    .select(
      "id,approved,rejected,caption,image_url,video_url,created_at,program_id, empowerment_programs(title,program_type,date,location,lga)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
        Could not load your impact reports: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(uploads ?? []).length === 0 ? (
        <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
          No impact reports yet. Upload your first photos/videos to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {(uploads ?? []).map((u) => (
            <article
              key={u.id}
              className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-300/70">
                    {u.approved ? "Approved" : u.rejected ? "Rejected" : "Pending"}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-base font-bold text-white">
                    {Array.isArray(u.empowerment_programs)
                      ? u.empowerment_programs[0]?.title || "Program"
                      : (u.empowerment_programs as { title?: string } | undefined)?.title ||
                        "Program"}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-300">
                    {u.caption || "No caption provided."}
                  </p>
                </div>
                <div className="shrink-0">
                  {u.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.image_url}
                      alt="Upload thumbnail"
                      className="h-16 w-16 rounded-xl border border-zinc-700 object-cover"
                    />
                  ) : u.video_url ? (
                    <video
                      src={u.video_url}
                      className="h-16 w-16 rounded-xl border border-zinc-700 object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl border border-zinc-700" />
                  )}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-zinc-500">
                Submitted on{" "}
                {new Date(u.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

