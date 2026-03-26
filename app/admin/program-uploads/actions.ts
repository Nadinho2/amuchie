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

  const { data, error } = await supabase
    .from("program_uploads")
    .update({
      approved: true,
      rejected: false,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", uploadId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message =
      error?.message ||
      "Approval failed: no rows were updated. Confirm admin role and RLS policies.";
    redirect(`/admin/program-uploads?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/program-uploads");
  revalidatePath("/programs");
  revalidatePath("/");
  redirect("/admin/program-uploads?saved=upload_approved");
}

export async function rejectProgramUploadAction(formData: FormData) {
  const uploadId = String(formData.get("upload_id") || "");
  if (!uploadId) redirect("/admin/program-uploads");

  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { data, error } = await supabase
    .from("program_uploads")
    .update({
      approved: false,
      rejected: true,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", uploadId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message =
      error?.message ||
      "Rejection failed: no rows were updated. Confirm admin role and RLS policies.";
    redirect(`/admin/program-uploads?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/program-uploads");
  revalidatePath("/programs");
  revalidatePath("/");
  redirect("/admin/program-uploads?saved=upload_rejected");
}

export async function approveProgramAction(formData: FormData) {
  const programId = String(formData.get("program_id") || "");
  if (!programId) redirect("/admin/program-uploads");

  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { data, error } = await supabase
    .from("empowerment_programs")
    .update({
      approved: true,
      rejected: false,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", programId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message =
      error?.message ||
      "Program approval failed: no rows were updated. Confirm admin role and RLS policies.";
    redirect(`/admin/program-uploads?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/program-uploads");
  revalidatePath("/programs");
  revalidatePath("/");
  redirect("/admin/program-uploads?saved=program_approved");
}

export async function rejectProgramAction(formData: FormData) {
  const programId = String(formData.get("program_id") || "");
  if (!programId) redirect("/admin/program-uploads");

  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { data, error } = await supabase
    .from("empowerment_programs")
    .update({
      approved: false,
      rejected: true,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", programId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message =
      error?.message ||
      "Program rejection failed: no rows were updated. Confirm admin role and RLS policies.";
    redirect(`/admin/program-uploads?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/program-uploads");
  revalidatePath("/programs");
  revalidatePath("/");
  redirect("/admin/program-uploads?saved=program_rejected");
}

