import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <div className="mb-4 flex items-center justify-end gap-3">
          <Suspense>
            <AuthButton />
          </Suspense>
          <ThemeSwitcher />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
