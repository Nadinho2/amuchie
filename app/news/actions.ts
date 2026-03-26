"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type NewsCategory =
  | "Campaign Update"
  | "Empowerment Program"
  | "Party News"
  | "Media Mention"
  | "Community";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCampaignNewsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "Campaign Update") as NewsCategory;
  const featured_image_url = String(formData.get("featured_image_url") || "").trim();
  const author = String(formData.get("author") || "Amuchie Ambassadors Team").trim();
  const is_published = String(formData.get("is_published") || "true") === "true";
  const published_at = new Date().toISOString();

  if (!title || !excerpt || !content) {
    throw new Error("Title, excerpt, and content are required.");
  }

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

  const { error } = await supabase.from("campaign_news").insert({
    title,
    slug,
    excerpt,
    content,
    category,
    featured_image_url: featured_image_url || null,
    author,
    is_published,
    published_at,
    created_by: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/news");
  revalidatePath("/");
  return { slug };
}

