import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewsCard, type NewsItem } from "@/components/news/news-card";

type Params = Promise<{ slug: string }>;

async function NewsDetailsContent({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("campaign_news")
    .select(
      "id,title,slug,excerpt,content,featured_image_url,category,published_at,author,is_published",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!item) notFound();

  const { data: related } = await supabase
    .from("campaign_news")
    .select(
      "id,title,slug,excerpt,featured_image_url,category,published_at,author,is_published",
    )
    .eq("is_published", true)
    .eq("category", item.category)
    .neq("id", item.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const shareText = encodeURIComponent(`${item.title} — Campaign News`);
  const sharePath = encodeURIComponent(`/news/${item.slug}`);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <article className="overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900/45">
        <div className="h-72 w-full bg-zinc-950">
          {item.featured_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.featured_image_url}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>

        <div className="space-y-4 p-5 sm:p-7">
          <p className="text-xs text-zinc-400">
            {item.category} • {new Date(item.published_at).toLocaleDateString()} • By{" "}
            {item.author}
          </p>
          <h1 className="text-balance text-3xl font-extrabold text-white">
            {item.title}
          </h1>
          <p className="text-sm text-zinc-300">{item.excerpt}</p>

          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7 text-zinc-200">
            {item.content}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <a
              href={`https://wa.me/?text=${shareText}%20${sharePath}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200"
            >
              <Share2 className="h-4 w-4" />
              Share on WhatsApp
            </a>
            <Link
              href="/news"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
            >
              Back to News
            </Link>
          </div>
        </div>
      </article>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-white">Related News</h2>
        {(related ?? []).length === 0 ? (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-300">
            No related stories yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(related as NewsItem[]).map((r) => (
              <NewsCard key={r.id} item={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function NewsDetailsPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-300">
            Loading article...
          </div>
        </main>
      }
    >
      <NewsDetailsContent params={params} />
    </Suspense>
  );
}

