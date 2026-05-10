"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Logging out..." : "Logout"}
    </Button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <SubmitButton />
    </form>
  );
}
