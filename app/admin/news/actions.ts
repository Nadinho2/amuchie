"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: roleRow, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !roleRow) {
    redirect("/programs?tab=all");
  }

  return user;
}

export async function createNewsAdminAction(formData: FormData) {
  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "Campaign Update") as NewsCategory;
  const featured_image_url = String(formData.get("featured_image_url") || "").trim();
  const author = String(formData.get("author") || "Amuchie Ambassadors Team").trim();
  const is_published = String(formData.get("is_published") || "true") === "true";
  const program_id = String(formData.get("program_id") || "").trim();
  const published_at = new Date().toISOString();

  if (!title || !excerpt || !content) {
    redirect("/admin/news?error=missing_required_fields");
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
    program_id: program_id || null,
  });

  if (error) {
    redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news?saved=1");
}

export async function updateNewsAdminAction(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const id = String(formData.get("id") || "").trim();
  if (!id) redirect("/admin/news?error=missing_id");

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "Campaign Update") as NewsCategory;
  const featured_image_url = String(formData.get("featured_image_url") || "").trim();
  const author = String(formData.get("author") || "Amuchie Ambassadors Team").trim();
  const is_published = String(formData.get("is_published") || "true") === "true";
  const program_id = String(formData.get("program_id") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugInput || slugify(title);

  if (!title || !excerpt || !content || !slug) {
    redirect(`/admin/news/${id}/edit?error=missing_required_fields`);
  }

  const { error } = await supabase
    .from("campaign_news")
    .update({
      title,
      slug,
      excerpt,
      content,
      category,
      featured_image_url: featured_image_url || null,
      author,
      is_published,
      program_id: program_id || null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/news/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  revalidatePath("/admin/news");
  redirect("/admin/news?updated=1");
}

export async function deleteNewsAdminAction(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const id = String(formData.get("id") || "").trim();
  if (!id) redirect("/admin/news?error=missing_id");

  const { error } = await supabase.from("campaign_news").delete().eq("id", id);
  if (error) {
    redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news?deleted=1");
}

