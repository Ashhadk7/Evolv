"use client";

const BRAND_INK = "#0f1c18";

type Role = "founder" | "developer";

export function SignupProgress({ step }: { step: number; role: Role | "" }) {
  const labels = ["Role", "Account", "Verify email"];
  return (
    <div className="mb-3 grid grid-cols-3 gap-2">
      {labels.map((label, index) => {
        const active = step >= index;
        return (
          <div key={label}>
            <div
              className="h-1.5 rounded-full"
              style={{ background: active ? BRAND_INK : "rgba(15,28,24,0.1)" }}
            />
            <div
              className="mt-1.5 text-[10px] font-bold uppercase"
              style={{ color: active ? BRAND_INK : "rgba(15,28,24,0.35)" }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
