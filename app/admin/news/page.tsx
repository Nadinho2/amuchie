import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createNewsAdminAction, deleteNewsAdminAction } from "./actions";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function AdminNewsContent({ searchParams }: { searchParams: SearchParams }) {
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

  const { data: news } = await supabase
    .from("campaign_news")
    .select("id,title,slug,category,is_published,published_at,author,created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  const { data: programs } = await supabase
    .from("empowerment_programs")
    .select("id,title")
    .eq("approved", true)
    .order("date", { ascending: false })
    .limit(60);

  const sp = await searchParams;
  const saved = one(sp.saved) === "1";
  const updated = one(sp.updated) === "1";
  const deleted = one(sp.deleted) === "1";
  const error = one(sp.error);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Admin</p>
        <h1 className="text-3xl font-extrabold text-white">News Dashboard</h1>
        <p className="text-sm text-zinc-300">
          Create, edit, publish, and remove campaign news.
        </p>
      </header>

      {(saved || updated || deleted) && (
        <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          News update successful.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
          {decodeURIComponent(error)}
        </div>
      )}

      <section className="mt-6 rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-white">Create News Item</h2>
        <form action={createNewsAdminAction} className="mt-4 grid gap-3">
          <input
            name="title"
            required
            placeholder="Title"
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          />
          <input
            name="excerpt"
            required
            placeholder="Excerpt (short summary)"
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          />
          <textarea
            name="content"
            required
            placeholder="Full content (text/markdown)"
            rows={7}
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          />
          <input
            name="featured_image_url"
            placeholder="Featured image URL (optional)"
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          />
          <input
            name="author"
            defaultValue="Amuchie Ambassadors Team"
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          />
          <select
            name="category"
            defaultValue="Campaign Update"
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          >
            <option>Campaign Update</option>
            <option>Empowerment Program</option>
            <option>Party News</option>
            <option>Media Mention</option>
            <option>Community</option>
          </select>
          <select
            name="program_id"
            defaultValue=""
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          >
            <option value="">No linked program</option>
            {(programs ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <select
            name="is_published"
            defaultValue="true"
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
          >
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>

          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-zinc-900 sm:w-fit"
          >
            Create News
          </Button>
        </form>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-white">Manage Existing News</h2>
        <div className="mt-4 space-y-3">
          {(news ?? []).length === 0 ? (
            <p className="text-sm text-zinc-300">No news entries yet.</p>
          ) : (
            (news ?? []).map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-zinc-700 bg-zinc-950/40 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-400">
                      {item.category} • {item.is_published ? "Published" : "Draft"} • {item.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/news/${item.id}/edit`}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
                    >
                      Edit
                    </Link>
                    <form action={deleteNewsAdminAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default function AdminNewsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading news dashboard...
          </div>
        </main>
      }
    >
      <AdminNewsContent searchParams={searchParams} />
    </Suspense>
  );
}

