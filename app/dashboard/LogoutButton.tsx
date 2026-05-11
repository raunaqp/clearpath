"use client";

import { useTransition } from "react";
import { logoutAction } from "../(auth)/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={() => {
        startTransition(() => {
          logoutAction();
        });
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-[#0E1411] border border-[#D9D5C8] hover:bg-white rounded-full px-3 py-1.5 disabled:opacity-50"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
