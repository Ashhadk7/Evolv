import type { ReactNode } from "react";

export function getInitials(
  profile?: { firstName?: string; lastName?: string },
  fallback = "U"
) {
  if (!profile) return fallback;
  return (
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || fallback
  );
}

export function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold text-[#6b8e7e]">
      {children}
      {required && <span className="ml-1 align-super text-[10px] text-red-500">*</span>}
    </span>
  );
}
