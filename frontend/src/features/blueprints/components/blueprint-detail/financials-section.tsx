"use client";

import { motion } from "framer-motion";
import { Calculator, ChartBar, Clock, CloudArrowUp, Lock, Money } from "@phosphor-icons/react";
import type { CostModel, Financials, Phase } from "@/features/blueprints/blueprint-content";
import { fmtMoney } from "@/features/blueprints/blueprint-content";
import { cardStyle, EASE, NUM } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Label } from "@/components/shared/label";

export function FinancialsSection({
  cost,
  fin,
  phases,
  reduce,
}: {
  cost: CostModel;
  fin: Financials;
  phases: Phase[];
  reduce: boolean | null;
}) {
  return (
    <Reveal>
      <SectionHead
        icon={<Money size={18} weight="duotone" className="text-bp-success" />}
        kicker="The Money"
        title="Project Cost & Financials"
        desc="What it costs to build — estimated from real market developer rates for each phase's skills — how developers are paid per milestone, and when the product earns that investment back."
      />

      {/* COST TO BUILD */}
      <div style={cardStyle({ padding: "28px 30px", marginBottom: 18 })}>
        <div className="border-bp-border-soft bg-bp-tint mb-[18px] flex gap-[9px] rounded-[11px] border px-3.5 py-2.5">
          <Calculator size={14} weight="duotone" className="text-bp-teal mt-px shrink-0" />
          <span className="text-bp-muted text-[11.5px] leading-[1.5]">
            Estimated bottom-up: each phase&apos;s required skill is matched to current market
            contractor rates and multiplied by its duration. This is a data-driven estimate, not a
            fixed budget.
          </span>
        </div>
        <div className="mb-[22px] grid grid-cols-4 gap-3.5">
          {[
            {
              l: "Total Build Cost",
              v: fmtMoney(cost.total),
              ic: <Money size={18} weight="duotone" className="text-bp-success" />,
            },
            {
              l: "Build Time",
              v: cost.timelineLabel,
              ic: <Clock size={18} weight="duotone" className="text-bp-teal" />,
            },
            {
              l: "Run Cost / month",
              v: cost.monthlyRunCost,
              ic: <CloudArrowUp size={18} weight="duotone" className="text-bp-teal" />,
            },
            {
              l: "Break-even",
              v: fin.breakEvenMonth ? `Month ${fin.breakEvenMonth}` : "24+ months",
              ic: <ChartBar size={18} weight="duotone" className="text-bp-success" />,
            },
          ].map((s) => (
            <div
              key={s.l}
              className="border-bp-border-soft bg-bp-tint rounded-2xl border px-[18px] py-[18px]"
            >
              <div className="flex items-center justify-between">
                <Label>{s.l}</Label>
                {s.ic}
              </div>
              <div style={NUM} className="text-bp-ink text-xl font-extrabold">
                {s.v}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_1.35fr] gap-[22px]">
          {/* composition */}
          <div>
            <Label>Where the money goes</Label>
            <div className="mb-3.5 flex h-3 overflow-hidden rounded-full">
              {cost.composition.map((b) => (
                <div
                  key={b.label}
                  style={{ width: `${(b.value / cost.total) * 100}%`, background: b.tone }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-[9px]">
              {cost.composition.map((b) => (
                <div key={b.label} className="flex items-center justify-between">
                  <span className="text-bp-body flex items-center gap-2 text-[12.5px]">
                    <span
                      className="h-[9px] w-[9px] rounded-[3px]"
                      style={{ background: b.tone }}
                    />
                    {b.label}
                  </span>
                  <span style={NUM} className="text-bp-ink text-[12.5px] font-bold">
                    {fmtMoney(b.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* milestone schedule with per-phase rate math */}
          <div>
            <Label>Milestone payments to developers</Label>
            <div className="border-bp-border-soft overflow-hidden rounded-xl border">
              {phases.map((ph, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-2.5 px-[15px] py-2.5 ${
                    i === 0 ? "border-t-0" : "border-bp-border-soft border-t"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      style={NUM}
                      className="bg-bp-forest text-bp-mint flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="text-bp-ink block overflow-hidden text-[12.5px] font-semibold text-ellipsis whitespace-nowrap">
                        {ph.name}
                      </span>
                      <span className="font-mono-app text-bp-label block text-[10.5px]">
                        {ph.primarySkill} · {ph.weeks}w × {fmtMoney(ph.weeklyRate)}/wk
                      </span>
                    </span>
                  </span>
                  <span style={NUM} className="text-bp-success text-[13px] font-bold">
                    {fmtMoney(ph.cost)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-bp-border-soft bg-bp-tint mt-3 flex gap-[9px] rounded-[11px] border px-3.5 py-2.5">
              <Lock size={14} weight="duotone" className="text-bp-teal mt-px shrink-0" />
              <span className="text-bp-muted text-[11.5px] leading-[1.5]">
                Each milestone is funded into Evolv escrow and released to the developer on your
                approval, net of Evolv&apos;s {Math.round(cost.platformFeePct * 100)}% platform fee
                — via Stripe Connect.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE & BREAK-EVEN */}
      <div style={cardStyle({ padding: "28px 30px" })}>
        <Label>Revenue &amp; break-even</Label>
        <p className="text-bp-muted mb-2.5 text-[13px] leading-[1.65]">
          {fin.revenueModel} Modelled at{" "}
          <strong className="text-bp-ink">${fin.pricePerUser}/user per month</strong>, starting near{" "}
          {fin.startingUsers} paying users and growing ~{fin.monthlyGrowthPct}% each month.{" "}
          <strong className="text-bp-ink">MRR</strong> is monthly recurring revenue;{" "}
          <strong className="text-bp-ink">ARR</strong> is that figure annualised.
        </p>
        <div className="border-bp-border-soft bg-bp-tint mb-[18px] flex gap-[9px] rounded-[11px] border px-3.5 py-2.5">
          <Calculator size={14} weight="duotone" className="text-bp-amber mt-px shrink-0" />
          <span className="text-bp-muted text-[11.5px] leading-[1.5]">
            <strong>Illustrative model, not a forecast.</strong> {fin.assumptions.join(" · ")}
          </span>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-3.5">
          {[
            {
              l: "MRR by month 12",
              v: fmtMoney(fin.eoyMrr),
              sub: `${fin.year1[11].users} paying users`,
            },
            { l: "ARR by month 12", v: fmtMoney(fin.eoyArr), sub: "annual run-rate" },
            {
              l: "Break-even",
              v: fin.breakEvenMonth ? `Month ${fin.breakEvenMonth}` : "24+ months",
              sub: `cumulative revenue clears ${fmtMoney(cost.total)}`,
            },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`rounded-2xl px-[18px] py-[18px] ${
                i === 2
                  ? "bg-bp-forest border border-transparent"
                  : "border-bp-border-soft bg-bp-tint border"
              }`}
            >
              <div
                className={`font-mono-app mb-2 text-[9.5px] font-bold tracking-[0.1em] uppercase ${
                  i === 2 ? "text-bp-mint-soft" : "text-bp-label"
                }`}
              >
                {s.l}
              </div>
              <div
                style={NUM}
                className={`text-[22px] font-extrabold ${i === 2 ? "text-white" : "text-bp-ink"}`}
              >
                {s.v}
              </div>
              <div
                className={`mt-1 text-[11px] ${i === 2 ? "text-bp-mint-soft" : "text-bp-muted"}`}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>
        <Label>Year-1 monthly recurring revenue</Label>
        <div className="mt-1.5 flex h-[130px] items-end gap-1.5">
          {fin.year1.map((y) => {
            const isBreakEven = fin.breakEvenMonth === y.month;
            return (
              <div key={y.month} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  style={NUM}
                  className={`text-[10px] font-bold ${isBreakEven ? "text-bp-success" : "text-bp-muted"}`}
                >
                  {fmtMoney(y.mrr)}
                </span>
                <motion.div
                  initial={reduce ? false : { height: 0 }}
                  whileInView={{ height: `${Math.max(4, (y.mrr / fin.eoyMrr) * 90)}px` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE, delay: y.month * 0.03 }}
                  className={`w-full rounded-t-[6px] ${
                    isBreakEven ? "bg-bp-forest" : "bg-[linear-gradient(180deg,#89d7b7,#cfe3d8)]"
                  }`}
                />
                <span className="font-mono-app text-bp-label text-[9.5px]">M{y.month}</span>
              </div>
            );
          })}
        </div>
        {fin.breakEvenMonth && fin.breakEvenMonth <= 12 && (
          <div className="mt-3.5 flex items-center gap-[7px]">
            <span className="bg-bp-forest inline-block h-3 w-3 rounded-[3px]" />
            <span className="text-bp-muted text-[11.5px]">
              Break-even month — cumulative revenue overtakes the {fmtMoney(cost.total)} build cost.
            </span>
          </div>
        )}
      </div>
    </Reveal>
  );
}
