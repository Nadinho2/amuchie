"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  category: string;
  published_at: string;
  author: string;
};

export function NewsCard({ item }: { item: NewsItem }) {
  const shareText = encodeURIComponent(
    `${item.title} — Read more on the Amuchie Ambassadors campaign news page.`,
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900/45 backdrop-blur"
    >
      <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
        {item.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.featured_image_url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No featured image
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge className="border-amber-300/40 bg-amber-300/10 text-amber-200">
            {item.category}
          </Badge>
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(item.published_at).toLocaleDateString()}
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-extrabold text-white">
          {item.title}
        </h3>
        <p className="line-clamp-3 text-sm text-zinc-300">{item.excerpt}</p>
        <p className="text-xs text-zinc-400">By {item.author}</p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            href={`/news/${item.slug}`}
            className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-300/20"
          >
            Read More
          </Link>
          <a
            href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(`/news/${item.slug}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </a>
        </div>
      </div>
    </motion.article>
  );
}

