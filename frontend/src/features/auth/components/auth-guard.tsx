"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/features/auth/lib/session";

interface AuthGuardProps {
  requiredRole: "founder" | "developer";
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const sessionRole = hasMounted ? (getSession()?.user.role ?? null) : null;

  useEffect(() => {
    if (!hasMounted) return;
    if (sessionRole === null) {
      router.replace("/sign-in");
      return;
    }
    if (sessionRole !== requiredRole) {
      router.replace(
        sessionRole === "founder" ? "/founder/dashboard" : "/developer/dashboard"
      );
    }
  }, [hasMounted, sessionRole, requiredRole, router]);

  if (!hasMounted || sessionRole !== requiredRole) return null;
  return <>{children}</>;
}
