import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { updateNewsAdminAction } from "../../actions";
import { Button } from "@/components/ui/button";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function EditNewsAdminContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const error = one(sp.error);

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

  const { data: item } = await supabase
    .from("campaign_news")
    .select("id,title,slug,excerpt,content,featured_image_url,category,author,is_published,program_id")
    .eq("id", id)
    .maybeSingle();
  if (!item) redirect("/admin/news?error=news_not_found");

  const { data: programs } = await supabase
    .from("empowerment_programs")
    .select("id,title")
    .eq("approved", true)
    .order("date", { ascending: false })
    .limit(60);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-extrabold text-white">Edit News Item</h1>
      {error && (
        <div className="mt-3 rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updateNewsAdminAction} className="mt-5 grid gap-3 rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 sm:p-6">
        <input type="hidden" name="id" value={item.id} />
        <input
          name="title"
          defaultValue={item.title}
          required
          className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
        />
        <input
          name="slug"
          defaultValue={item.slug}
          required
          className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
        />
        <input
          name="excerpt"
          defaultValue={item.excerpt}
          required
          className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
        />
        <textarea
          name="content"
          defaultValue={item.content}
          required
          rows={8}
          className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
        />
        <input
          name="featured_image_url"
          defaultValue={item.featured_image_url || ""}
          className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
        />
        <input
          name="author"
          defaultValue={item.author}
          className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
        />
        <select
          name="category"
          defaultValue={item.category}
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
          defaultValue={item.program_id || ""}
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
          defaultValue={item.is_published ? "true" : "false"}
          className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"
        >
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>

        <div className="flex items-center gap-2">
          <Button type="submit" className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-zinc-900">
            Save Changes
          </Button>
          <a href="/admin/news" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200">
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}

export default function EditNewsAdminPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading news editor...
          </div>
        </main>
      }
    >
      <EditNewsAdminContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

