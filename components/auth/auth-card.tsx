"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import type { AuthActionState } from "@/app/auth/actions";
import { login, signUp } from "@/app/auth/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type AuthMode = "login" | "signup";

const initialState: AuthActionState = { error: null };

function SubmitButton(props: { mode: AuthMode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : props.mode === "signup" ? (
        "Create Ambassador Account"
      ) : (
        "Access My Portal"
      )}
    </button>
  );
}

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginState, loginAction] = useActionState(login, initialState);
  const [signUpState, signUpAction] = useActionState(signUp, initialState);

  const activeState = mode === "signup" ? signUpState : loginState;
  const formAction = mode === "signup" ? signUpAction : loginAction;

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

      <form action={formAction} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="full-name" className="mb-1 block text-sm text-zinc-300">
              Full name
            </label>
            <input
              id="full-name"
              name="full_name"
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
              name="email"
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
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-300/70"
            minLength={8}
            required
          />
        </div>

        <SubmitButton mode={mode} />
      </form>

      {activeState.error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-300">
          {activeState.error}
        </p>
      )}
    </motion.section>
  );
}
