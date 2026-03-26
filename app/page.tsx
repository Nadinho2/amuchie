import Link from "next/link";
import { Crown, Sparkles, Trophy, Users } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { AmbassadorIdCard } from "@/components/id-card/ambassador-id-card";
import { EzinwaHero } from "@/components/ezinwa/ezinwa-hero";
import { createClient } from "@/lib/supabase/server";
import { ProgramCard } from "@/components/programs/program-card";
import { Suspense } from "react";

const highlights = [
  {
    icon: Users,
    title: "Grow the Movement",
    description: "Mobilize ambassadors across all LGAs with measurable community impact.",
  },
  {
    icon: Trophy,
    title: "Track Community Impact",
    description: "Document empowerment programs and real grassroots outcomes.",
  },
  {
    icon: Crown,
    title: "Own Your Digital ID",
    description: "Carry your premium ambassador card everywhere, anytime.",
  },
];

async function HomeContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name,photo_url,ambassador_number,level,lga")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: programs } = await supabase
    .from("empowerment_programs")
    .select("id,title,description,program_type,date,location,lga,beneficiary_count")
    .eq("approved", true)
    .order("date", { ascending: false })
    .limit(4);

  const programList = programs ?? [];
  const programIds = programList.map((p) => p.id);

  const thumbnails = new Map<string, string>();
  if (programIds.length) {
    const { data: uploads } = await supabase
      .from("program_uploads")
      .select("program_id,image_url,video_url,created_at")
      .eq("approved", true)
      .in("program_id", programIds)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const upload of uploads ?? []) {
      if (!thumbnails.has(upload.program_id)) {
        thumbnails.set(upload.program_id, upload.image_url || upload.video_url || "");
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <EzinwaHero
        badgeText="Meet Amuchie"
        ctaHref="/ezinwa"
        ctaLabel="Read full profile"
      />

      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-200">
            <Sparkles className="h-4 w-4" />
            Official 2027 Campaign Loyalty Portal
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Amuchie Ambassadors
            <span className="block bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Loyalty Portal
            </span>
          </h1>

          <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
            Join the grassroots engine driving the future of Imo State. Track
            verified impact, coordinate community programs, and showcase
            empowerment activities.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-emerald-700/40 bg-zinc-900/40 p-4 backdrop-blur"
              >
                <item.icon className="mb-2 h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-semibold text-zinc-100">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          {user ? (
            profile ? (
              <AmbassadorIdCard
                fullName={profile.full_name || "Amuchie Ambassador"}
                ambassadorNumber={profile.ambassador_number || "AA-2027-PENDING"}
                level={(profile.level as "bronze" | "silver" | "gold") || "bronze"}
                lga={profile.lga}
                photoUrl={profile.photo_url}
              />
            ) : (
              <div className="rounded-3xl border border-emerald-600/40 bg-zinc-900/60 p-5 sm:p-6">
                <p className="text-sm text-zinc-300">
                  Welcome back. Complete your ambassador profile to generate your
                  digital ID card.
                </p>
                <Link
                  href="/protected"
                  className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-900"
                >
                  Complete profile
                </Link>
              </div>
            )
          ) : (
            <AuthCard />
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
              Public Impact Feed
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
              Recent Empowerment Activities
            </h2>
            <p className="mt-1 text-sm text-zinc-300">
              Visitors can view approved impact photos and program highlights without logging in.
            </p>
          </div>
          <Link
            href="/programs?tab=all"
            className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/20"
          >
            View all programs
          </Link>
        </div>

        {programList.length === 0 ? (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950/40 p-5 text-sm text-zinc-300">
            No published impact programs yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {programList.map((program) => (
              <ProgramCard
                key={program.id}
                id={program.id}
                title={program.title}
                description={program.description}
                program_type={program.program_type}
                date={program.date}
                location={program.location}
                lga={program.lga}
                beneficiary_count={program.beneficiary_count}
                thumbnailUrl={thumbnails.get(program.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading portal...
          </div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
