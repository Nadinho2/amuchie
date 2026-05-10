import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function LoginContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/protected");
  }

  return <LoginForm />;
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-6 text-sm text-zinc-300">
              Loading...
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
