"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function approveProgramUploadAction(formData: FormData) {
  const uploadId = String(formData.get("upload_id") || "");
  if (!uploadId) redirect("/admin/program-uploads");

  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { error } = await supabase
    .from("program_uploads")
    .update({
      approved: true,
      rejected: false,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", uploadId);

  if (error) {
    redirect(`/admin/program-uploads?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/program-uploads");
}

export async function rejectProgramUploadAction(formData: FormData) {
  const uploadId = String(formData.get("upload_id") || "");
  if (!uploadId) redirect("/admin/program-uploads");

  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { error } = await supabase
    .from("program_uploads")
    .update({
      approved: false,
      rejected: true,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", uploadId);

  if (error) {
    redirect(`/admin/program-uploads?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/program-uploads");
}

export async function approveProgramAction(formData: FormData) {
  const programId = String(formData.get("program_id") || "");
  if (!programId) redirect("/admin/program-uploads");

  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { error } = await supabase
    .from("empowerment_programs")
    .update({
      approved: true,
      rejected: false,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", programId);

  if (error) {
    redirect(`/admin/program-uploads?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/program-uploads");
  revalidatePath("/programs");
  revalidatePath("/");
}

export async function rejectProgramAction(formData: FormData) {
  const programId = String(formData.get("program_id") || "");
  if (!programId) redirect("/admin/program-uploads");

  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { error } = await supabase
    .from("empowerment_programs")
    .update({
      approved: false,
      rejected: true,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", programId);

  if (error) {
    redirect(`/admin/program-uploads?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/program-uploads");
  revalidatePath("/programs");
  revalidatePath("/");
}

