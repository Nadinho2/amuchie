import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewsCard, type NewsItem } from "@/components/news/news-card";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function NewsPageContent({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const sp = await searchParams;
  const q = one(sp.q)?.trim() || "";
  const category = one(sp.category)?.trim() || "";

  let query = supabase
    .from("campaign_news")
    .select(
      "id,title,slug,excerpt,featured_image_url,category,published_at,author,is_published",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(40);

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data } = await query;
  const items = (data ?? []) as NewsItem[];
  const [latest, ...rest] = items;

  const categories = [
    "Campaign Update",
    "Empowerment Program",
    "Party News",
    "Media Mention",
    "Community",
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-3xl border border-amber-300/20 bg-gradient-to-r from-emerald-900/55 via-zinc-900/60 to-amber-900/35 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
          Campaign News & Updates
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          Amuchie Ambassadors Campaign News
        </h1>
        <p className="mt-2 text-sm text-zinc-200">
          Stay Updated • Service to Humanity
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4 backdrop-blur sm:p-5">
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search campaign news..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 py-2.5 pl-9 pr-3 text-sm text-zinc-100 outline-none focus:border-amber-300/70"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-900"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/news"
            className={`rounded-full border px-3 py-1.5 text-xs ${
              !category
                ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
                : "border-zinc-700 bg-zinc-900/45 text-zinc-300"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/news?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                category === c
                  ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
                  : "border-zinc-700 bg-zinc-900/45 text-zinc-300"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {latest ? (
        <section className="mt-6 rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
            Latest
          </p>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/40">
              {latest.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={latest.featured_image_url}
                  alt={latest.title}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="h-64 w-full" />
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                {new Date(latest.published_at).toLocaleDateString()} • {latest.category}
              </p>
              <h2 className="text-2xl font-extrabold text-white">{latest.title}</h2>
              <p className="text-sm text-zinc-300">{latest.excerpt}</p>
              <Link
                href={`/news/${latest.slug}`}
                className="inline-flex rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-300/20"
              >
                Read Full Update
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            No published news items yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading campaign news...
          </div>
        </main>
      }
    >
      <NewsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

