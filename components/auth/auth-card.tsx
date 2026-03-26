"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;
        setMessage("Account created. Check your email to confirm and continue.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        setMessage("Welcome back, Ambassador. Redirecting to your dashboard...");
        router.push("/protected");
        router.refresh();
      }
    } catch (err) {
      const fallback = "Something went wrong. Please try again.";
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full rounded-3xl border border-amber-300/20 bg-zinc-900/70 p-5 shadow-2xl shadow-amber-400/10 backdrop-blur-xl sm:p-7"
    >
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-amber-400" />
        <p className="text-sm font-semibold text-zinc-100">
          Secure Ambassador Access
        </p>
      </div>

      <div className="mb-5 inline-flex rounded-full border border-emerald-600/60 p-1">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            mode === "signup"
              ? "bg-amber-400 text-zinc-900"
              : "text-zinc-300 hover:text-white"
          }`}
        >
          Sign up
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            mode === "login"
              ? "bg-amber-400 text-zinc-900"
              : "text-zinc-300 hover:text-white"
          }`}
        >
          Log in
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="full-name" className="mb-1 block text-sm text-zinc-300">
              Full name
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. Chidinma Okoro"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-300/70"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-zinc-300">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 py-2.5 pl-9 pr-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-300/70"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-zinc-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-300/70"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : mode === "signup" ? (
            "Create Ambassador Account"
          ) : (
            "Access My Portal"
          )}
        </button>
      </form>

      {message && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-300">
          {error}
        </p>
      )}
    </motion.section>
  );
}
