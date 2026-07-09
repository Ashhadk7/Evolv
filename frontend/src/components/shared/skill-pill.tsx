export function SkillPill({ label }: { label: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ background: "#f5f7f5", border: "1px solid #e8ede9", color: "#428475" }}
    >
      {label}
    </span>
  );
}
