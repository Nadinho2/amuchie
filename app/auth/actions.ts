"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
};

const initialState: AuthActionState = { error: null };

async function getRequestOrigin() {
  const headerStore = await headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const proto = (forwardedProto?.split(",")[0] ?? "http").trim();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = (
    forwardedHost?.split(",")[0] ??
    headerStore.get("host") ??
    "localhost:3000"
  ).trim();

  return `${proto}://${host}`;
}

export async function login(_: AuthActionState, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ...initialState, error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ...initialState, error: error.message };
  }

  redirect("/protected");
}

export async function signUp(_: AuthActionState, formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const repeatPassword = String(formData.get("repeat_password") ?? "");

  if (!email || !password) {
    return { ...initialState, error: "Email and password are required." };
  }

  if (repeatPassword && password !== repeatPassword) {
    return { ...initialState, error: "Passwords do not match." };
  }

  const origin = await getRequestOrigin();
  const emailRedirectTo = `${origin}/auth/confirm?next=/protected`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo,
    },
  });

  if (error) {
    return { ...initialState, error: error.message };
  }

  if (data.session) {
    redirect("/protected");
  }

  redirect("/auth/sign-up-success");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

