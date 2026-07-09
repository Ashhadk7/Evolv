import type { Blueprint } from "@/features/blueprints/types";

export function BlueprintPrintCover({
  bp,
  grade,
  viabilityScore,
  tocSections,
}: {
  bp: Blueprint;
  grade: string;
  viabilityScore: number;
  tocSections: string[];
}) {
  return (
    <div className="blueprint-print-only">
      <div className="flex min-h-[70vh] flex-col justify-center px-1 py-[60px]">
        <div className="text-bp-teal mb-[18px] text-[11px] font-bold tracking-[0.18em] uppercase">
          Venture Blueprint
        </div>
        <h1 className="text-bp-ink mb-3.5 text-[44px] font-extrabold tracking-[-0.03em]">
          {bp.name}
        </h1>
        <p className="text-bp-body mb-7 max-w-[560px] text-[15px] leading-[1.7]">{bp.ideaDesc}</p>
        <div className="flex gap-7">
          <div>
            <div className="text-bp-label text-[11px] tracking-[0.08em] uppercase">Grade</div>
            <div className="text-bp-ink text-[22px] font-extrabold">{grade}</div>
          </div>
          <div>
            <div className="text-bp-label text-[11px] tracking-[0.08em] uppercase">Viability</div>
            <div className="text-bp-ink text-[22px] font-extrabold">{viabilityScore} / 100</div>
          </div>
          <div>
            <div className="text-bp-label text-[11px] tracking-[0.08em] uppercase">Industry</div>
            <div className="text-bp-ink text-[22px] font-extrabold">{bp.industry}</div>
          </div>
          <div>
            <div className="text-bp-label text-[11px] tracking-[0.08em] uppercase">Prepared</div>
            <div className="text-bp-ink text-[22px] font-extrabold">{bp.updatedAt}</div>
          </div>
        </div>
      </div>
      <div className="px-1 py-5">
        <div className="text-bp-label mb-4 text-[11px] font-bold tracking-[0.14em] uppercase">
          Contents
        </div>
        <div className="[columns:2] [column-gap:32px]">
          {tocSections.map((section, index) => (
            <div
              key={section}
              className="border-bp-border-soft flex [break-inside:avoid] justify-between gap-2.5 border-b py-2"
            >
              <span className="text-bp-ink text-[13px]">
                {index + 1}. {section}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
