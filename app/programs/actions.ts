"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateEmpowermentProgramInput = {
  title: string;
  description: string;
  program_type: "youth_leadership" | "rice_food_distributions" | "agricultural_skills" | "philanthropy_empowerment" | "other";
  date: string; // "YYYY-MM-DD"
  location: string;
  lga?: string;
  beneficiary_count: number;
};

export async function createEmpowermentProgramAction(
  input: CreateEmpowermentProgramInput,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const dateIso = new Date(input.date).toISOString();

  const { data, error } = await supabase
    .from("empowerment_programs")
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      program_type: input.program_type,
      date: dateIso,
      location: input.location.trim(),
      lga: input.lga?.trim() || null,
      beneficiary_count: Math.max(0, Math.floor(input.beneficiary_count)),
      created_by: user.id,
      approved: false,
      rejected: false,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error("Failed to create empowerment program.");
  }

  return { programId: data.id as string };
}

export type ProgramUploadKind = "image" | "video";

export type CreateProgramUploadsInput = {
  program_id: string;
  caption?: string;
  uploads: Array<{
    kind: ProgramUploadKind;
    url: string; // public URL (or signed URL later)
  }>;
};

export async function createProgramUploadsAction(
  input: CreateProgramUploadsInput,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const caption = input.caption?.trim() || null;

  const rows = input.uploads.map((u) => ({
    program_id: input.program_id,
    user_id: user.id,
    caption,
    approved: false,
    image_url: u.kind === "image" ? u.url : null,
    video_url: u.kind === "video" ? u.url : null,
  }));

  const { error } = await supabase
    .from("program_uploads")
    .insert(rows);

  if (error) {
    throw new Error("Failed to submit program media uploads.");
  }

  return { ok: true };
}

