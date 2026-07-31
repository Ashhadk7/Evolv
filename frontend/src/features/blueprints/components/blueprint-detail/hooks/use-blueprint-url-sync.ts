// Back-navigation for the blueprint detail view. WorkspaceTab already owns the
// `?blueprint=` query param (it pushes/strips it off `viewingId`), so this hook
// no longer keeps its own separate history entries — it only decides how to
// leave: real browser back when there's somewhere to go back to, or a direct
// close when the blueprint URL was opened with no prior history (e.g. a
// bookmarked/shared link in a fresh tab).
"use client";

import { useRouter } from "next/navigation";

export function useBlueprintUrlSync(onBack: () => void) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      onBack();
    }
  };

  return { handleBack };
}
