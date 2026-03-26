"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function upsertAmbassadorProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const lga = String(formData.get("lga") ?? "").trim();
  const photoUrl = String(formData.get("photo_url") ?? "").trim();

  if (!fullName) {
    redirect("/protected?error=full_name_required");
  }

  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("id, photo_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    redirect("/protected?error=profile_lookup_failed");
  }

  if (existingProfile) {
    const nextPhotoUrl = photoUrl || existingProfile.photo_url || null;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        lga: lga || null,
        photo_url: nextPhotoUrl,
      })
      .eq("user_id", user.id);

    if (updateError) {
      redirect("/protected?error=profile_update_failed");
    }
  } else {
    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: user.id,
      full_name: fullName,
      phone: phone || null,
      lga: lga || null,
      photo_url: photoUrl || null,
      ambassador_number: "",
    });

    if (insertError) {
      redirect("/protected?error=profile_create_failed");
    }
  }

  revalidatePath("/protected");
  redirect("/protected?saved=1");
}
