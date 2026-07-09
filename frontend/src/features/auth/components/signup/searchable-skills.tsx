// Skill search + add-custom control backed by ChoiceGrid, used in the developer
// profile step of the sign-up wizard.
import { useMemo, useState } from "react";
import { ChoiceGrid } from "@/features/auth/components/choice-grid";
import { BRAND_INK, BRAND_MINT } from "./constants";
import { normalize } from "./helpers";

export function SearchableSkills({
  skills,
  selected,
  onToggle,
}: {
  skills: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const normalizedQuery = normalize(trimmedQuery);
  const matchingSkills = useMemo(() => {
    if (!normalizedQuery) return skills.slice(0, 14);
    return skills.filter((skill) => normalize(skill).includes(normalizedQuery)).slice(0, 14);
  }, [normalizedQuery, skills]);
  const exactMatch = skills.some((skill) => normalize(skill) === normalizedQuery);
  const canAddCustom =
    trimmedQuery.length > 1 &&
    !exactMatch &&
    !selected.some((skill) => normalize(skill) === normalizedQuery);

  return (
    <div>
      <span
        className="mb-2 block text-[12px] font-semibold"
        style={{ color: "rgba(15,28,24,0.68)" }}
      >
        Core skills
      </span>
      <div className="mb-3 flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search or add a skill"
          className="h-10 min-w-0 flex-1 rounded-lg border bg-white px-3.5 pl-6 text-[13px] transition outline-none placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
          style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
        />
        {canAddCustom && (
          <button
            type="button"
            onClick={() => {
              onToggle(trimmedQuery);
              setQuery("");
            }}
            className="h-10 rounded-lg px-4 text-[12px] font-bold transition hover:opacity-90"
            style={{ background: BRAND_INK, color: BRAND_MINT }}
          >
            Add
          </button>
        )}
      </div>
      <ChoiceGrid items={matchingSkills} selected={selected} onToggle={onToggle} />
      {selected.length > 0 && (
        <div className="mt-3">
          <span
            className="mb-2 block text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "rgba(15,28,24,0.35)" }}
          >
            Selected
          </span>
          <ChoiceGrid items={selected} selected={selected} onToggle={onToggle} />
        </div>
      )}
    </div>
  );
}
