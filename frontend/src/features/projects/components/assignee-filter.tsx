"use client";

export type AssigneeOption = { id: string; name: string; count: number };

export const MINE = "__mine__";
export const EVERYONE = "__all__";

/**
 * Narrows a panel to one person's work. "Mine" stays a first-class choice
 * because it is the developer's default view of their own queue.
 */
export function AssigneeFilter({
  options,
  value,
  mineCount,
  totalCount,
  onChange,
}: {
  options: AssigneeOption[];
  value: string;
  mineCount: number;
  totalCount: number;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="border-bp-border flex overflow-hidden rounded-lg border">
        <button
          type="button"
          onClick={() => onChange(MINE)}
          aria-pressed={value === MINE}
          className={`focus-visible:ring-bp-teal cursor-pointer border-none px-2.5 py-1.5 text-[11px] font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
            value === MINE ? "bg-bp-forest text-bp-mint" : "bg-bp-card text-bp-muted"
          }`}
        >
          Mine ({mineCount})
        </button>
        <button
          type="button"
          onClick={() => onChange(EVERYONE)}
          aria-pressed={value === EVERYONE}
          className={`focus-visible:ring-bp-teal cursor-pointer border-none px-2.5 py-1.5 text-[11px] font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
            value === EVERYONE ? "bg-bp-forest text-bp-mint" : "bg-bp-card text-bp-muted"
          }`}
        >
          All ({totalCount})
        </button>
      </div>

      {options.length > 0 && (
        <select
          value={value === MINE || value === EVERYONE ? "" : value}
          onChange={(e) => onChange(e.target.value || EVERYONE)}
          aria-label="Filter by assignee"
          className="text-bp-muted border-bp-border bg-bp-card focus-visible:ring-bp-teal cursor-pointer rounded-lg border px-2 py-1.5 text-[11px] font-bold outline-none focus-visible:ring-2"
        >
          <option value="">Anyone…</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} ({option.count})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
