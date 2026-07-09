"use client";

import { CalendarBlank, Clock, Plus } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { fmtDate, type ProjectDeadline } from "@/features/blueprints/blueprint-content";

export function DeadlinesPanel({
  deadlines,
  today,
  phaseNameFor,
  onOpenModal,
  onSetStatus,
}: {
  deadlines: ProjectDeadline[];
  today: string;
  phaseNameFor: (phaseIndex: number) => string | undefined;
  onOpenModal: () => void;
  onSetStatus: (id: string, status: ProjectDeadline["status"]) => void;
}) {
  return (
    <div className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[16px_20px] shrink-0">
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-bp-amber-bg flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg">
          <CalendarBlank size={13} weight="duotone" className="text-bp-amber" />
        </div>
        <span className="text-bp-ink text-[13px] font-extrabold">Upcoming Deadlines</span>
        <button onClick={onOpenModal} className="bp-primary-btn ml-auto">
          <Plus size={11} weight="bold" /> New
        </button>
      </div>
      {deadlines.length === 0 ? (
        <div className="text-bp-muted text-[11.5px]">No custom deadlines defined.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {deadlines.map((dl) => {
            const late = dl.status === "Pending" && dl.date < today;
            return (
              <div
                key={dl.id}
                className="border-bp-border-soft bg-bp-tint flex flex-col gap-1.5 rounded-[10px] border px-3.5 py-3"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-bp-ink text-[12.5px] font-bold">{dl.note}</span>
                  <Chip
                    tone={
                      dl.priority === "High" ? "red" : dl.priority === "Medium" ? "amber" : "mint"
                    }
                  >
                    {dl.priority}
                  </Chip>
                  <Chip
                    tone={dl.status === "Pending" ? "amber" : dl.status === "Met" ? "mint" : "red"}
                  >
                    {dl.status}
                  </Chip>
                  {late && <Chip tone="red">Overdue</Chip>}
                </div>
                <div className="flex items-center gap-2.5">
                  {dl.phaseIndex !== null && (
                    <span className="text-bp-label text-[10.5px]">
                      {phaseNameFor(dl.phaseIndex)}
                    </span>
                  )}
                  <span className="text-bp-muted flex items-center gap-1 text-[10.5px] tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                    <Clock size={11} /> {fmtDate(dl.date)}
                  </span>
                  <span className="ml-auto flex gap-2.5">
                    {dl.status !== "Met" && (
                      <button
                        onClick={() => onSetStatus(dl.id, "Met")}
                        className="text-bp-success cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold"
                      >
                        Mark Met
                      </button>
                    )}
                    {dl.status !== "Missed" && (
                      <button
                        onClick={() => onSetStatus(dl.id, "Missed")}
                        className="text-bp-red cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold"
                      >
                        Mark Missed
                      </button>
                    )}
                    {dl.status !== "Pending" && (
                      <button
                        onClick={() => onSetStatus(dl.id, "Pending")}
                        className="text-bp-muted cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold"
                      >
                        Reopen
                      </button>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
