"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/features/auth/components/signup/types";
import { clearAuthSession, getStoredAuthSession } from "../lib/auth-session";

export function useRequireAuth(role: Role) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getStoredAuthSession();
      if (!session || session.role !== role) {
        clearAuthSession();
        const next = encodeURIComponent(pathname || `/${role}/dashboard`);
        router.replace(`/sign-in?next=${next}`);
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname, role, router]);

  return authorized;
}
