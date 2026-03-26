import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AmbassadorIdCard } from "@/components/id-card/ambassador-id-card";
import { ProfilePhotoUploadField } from "@/components/profile/profile-photo-upload-field";
import { upsertAmbassadorProfile } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  photo_url: string | null;
  ambassador_number: string | null;
  level: "bronze" | "silver" | "gold" | null;
  lga: string | null;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function ProtectedContent(props: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, photo_url, ambassador_number, level, lga")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  const searchParams = await props.searchParams;
  const saved = one(searchParams.saved);
  const error = one(searchParams.error);

  const defaultName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    "";

  return (
    <div className="w-full space-y-8">
      <section className="rounded-3xl border border-emerald-700/40 bg-zinc-900/50 p-5 backdrop-blur sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
          Page 2
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
          Ambassador Profile & Digital ID
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          Complete your profile details to activate your campaign identity card.
          Your ambassador number and campaign tier are reflected in real time.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-700 bg-zinc-900/50 p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Profile Onboarding
          </h2>
          <form action={upsertAmbassadorProfile} className="space-y-3">
            <div>
              <label htmlFor="full_name" className="mb-1 block text-sm text-zinc-300">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                defaultValue={defaultName}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-300/70"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm text-zinc-300">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={profile?.phone ?? ""}
                placeholder="+234..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-300/70"
              />
            </div>
            <div>
              <label htmlFor="lga" className="mb-1 block text-sm text-zinc-300">
                Local Government Area (LGA)
              </label>
              <input
                id="lga"
                name="lga"
                defaultValue={profile?.lga ?? ""}
                placeholder="Owerri Municipal"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-300/70"
              />
            </div>
            <ProfilePhotoUploadField
              userId={user.id}
              initialPhotoUrl={profile?.photo_url}
            />

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:brightness-105"
            >
              Save Profile
            </button>
          </form>

          {saved === "1" && (
            <p className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-xs text-emerald-300">
              Profile saved successfully.
            </p>
          )}
          {error && (
            <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
              Could not save profile ({error}). Ensure the SQL migration is
              applied in Supabase.
            </p>
          )}
        </div>

        <AmbassadorIdCard
          fullName={defaultName || "Amuchie Ambassador"}
          ambassadorNumber={profile?.ambassador_number || "AA-2027-PENDING"}
          level={profile?.level ?? "bronze"}
          lga={profile?.lga}
          photoUrl={profile?.photo_url}
        />
      </section>
    </div>
  );
}

export default function ProtectedPage(props: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-6 text-sm text-zinc-300">
          Loading your ambassador dashboard...
        </div>
      }
    >
      <ProtectedContent searchParams={props.searchParams} />
    </Suspense>
  );
}
