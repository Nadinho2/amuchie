import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function AdminIndexContent() {
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Admin</p>
        <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-300">
          Manage campaign news and moderate submitted empowerment programs/uploads.
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/news"
          className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 transition hover:border-amber-300/40 hover:bg-zinc-900/70"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-amber-300/80">Content</p>
          <h2 className="mt-2 text-xl font-bold text-white">News Dashboard</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Create, edit, publish, and delete campaign news updates.
          </p>
        </Link>

        <Link
          href="/admin/program-uploads"
          className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 transition hover:border-emerald-300/40 hover:bg-zinc-900/70"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-emerald-300/80">Moderation</p>
          <h2 className="mt-2 text-xl font-bold text-white">Program Approvals</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Approve or reject pending programs and user-submitted impact evidence.
          </p>
        </Link>
      </section>
    </main>
  );
}

export default function AdminIndexPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading admin dashboard...
          </div>
        </main>
      }
    >
      <AdminIndexContent />
    </Suspense>
  );
}

