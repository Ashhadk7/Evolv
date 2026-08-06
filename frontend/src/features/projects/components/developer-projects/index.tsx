"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, CheckCircle, Coins, ListChecks, Warning } from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { Label } from "@/components/shared/label";
import { LoadingPanel } from "@/components/shared/loading-panel";
import { getApiErrorMessage } from "@/lib/api";
import {
  fmtCents,
  getDeveloperProject,
  listDeveloperInvites,
  listDeveloperProjects,
  respondToInvite,
  type DeveloperInvite,
  type DeveloperProjectDetail,
  type DeveloperProjectSummary,
} from "@/features/projects/developer-projects-api";
import { isClosedStatus } from "@/features/projects/types";
import { useProjectsLiveRefresh } from "@/features/projects/lib/use-projects-live-refresh";
import { ProjectSection } from "../project-section";
import { DeveloperProjectCard } from "./developer-project-card";
import { InviteTray } from "./invite-tray";
import { DeveloperProjectDetailView } from "./project-detail";

const CARD =
  "bg-bp-card border-bp-border rounded-2xl border shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)]";

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-bp-red-line bg-bp-red-bg text-bp-red rounded-lg border px-4 py-2.5 text-[12.5px]">
      {children}
    </div>
  );
}

export default function DeveloperProjects() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams?.get("project") ?? null;

  const [projects, setProjects] = useState<DeveloperProjectSummary[]>([]);
  const [invites, setInvites] = useState<DeveloperInvite[]>([]);
  const [detail, setDetail] = useState<DeveloperProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const load = useCallback(
    () =>
      Promise.all([listDeveloperProjects(), listDeveloperInvites()])
        .then(([nextProjects, nextInvites]) => {
          setProjects(nextProjects);
          setInvites(nextInvites);
          setLoadError(null);
        })
        .catch((error) => setLoadError(getApiErrorMessage(error)))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  useProjectsLiveRefresh(load);

  const reloadDetail = useCallback(() => {
    if (!selectedId) return Promise.resolve();
    return getDeveloperProject(selectedId)
      .then((next) => setDetail(next))
      .catch(() => undefined);
  }, [selectedId]);

  useProjectsLiveRefresh(reloadDetail);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    getDeveloperProject(selectedId)
      .then((next) => {
        if (active) setDetail(next);
      })
      .catch((error) => {
        if (active) setLoadError(getApiErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const activeDetail = selectedId && detail?.id === selectedId ? detail : null;

  const select = (projectId: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (projectId) params.set("project", projectId);
    else params.delete("project");
    router.push(params.toString() ? `?${params.toString()}` : "?", { scroll: false });
  };

  const handleRespond = async (invite: DeveloperInvite, accept: boolean) => {
    setBusyInviteId(invite.id);
    try {
      await respondToInvite(invite.id, accept);
      await load();
      showToast(
        accept ? `You joined ${invite.project_title}` : `Invitation to ${invite.project_title} declined`
      );
    } catch (error) {
      showToast(getApiErrorMessage(error));
    } finally {
      setBusyInviteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <LoadingPanel label="Loading your projects…" />
      </div>
    );
  }

  if (selectedId && !activeDetail) {
    if (loadError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <ErrorBanner>Couldn&apos;t load this project ({loadError}).</ErrorBanner>
          <button
            type="button"
            onClick={() => select(null)}
            className="text-bp-forest cursor-pointer text-[12.5px] font-bold underline underline-offset-2"
          >
            Back to your projects
          </button>
        </div>
      );
    }
    return (
      <div className="flex h-full items-center justify-center p-8">
        <LoadingPanel label="Loading project…" />
      </div>
    );
  }

  if (activeDetail) {
    return (
      <div className="bg-bp-page h-full overflow-hidden px-[28px] pt-[16px] pb-[18px]">
        <DeveloperProjectDetailView
          project={activeDetail}
          onBack={() => select(null)}
          initialIssueId={searchParams?.get("issue") ?? null}
          initialDeliverableId={searchParams?.get("deliverable") ?? null}
        />
      </div>
    );
  }

  const ongoing = projects.filter((p) => !isClosedStatus(p.status));
  const closed = projects.filter((p) => isClosedStatus(p.status));

  const totalAgreed = projects.reduce((sum, p) => sum + p.earnings.agreed_cents, 0);
  const totalPaid = projects.reduce((sum, p) => sum + p.earnings.paid_cents, 0);
  const deliverablesDone = projects.reduce((sum, p) => sum + p.deliverables_done, 0);
  const deliverablesTotal = projects.reduce((sum, p) => sum + p.deliverables_total, 0);
  const openIssues = projects.reduce((sum, p) => sum + p.open_issues, 0);

  const kpis = [
    {
      label: "Active Projects",
      value: String(ongoing.length),
      icon: <Briefcase size={16} weight="duotone" className="text-bp-teal" />,
    },
    {
      label: "Earnings Received",
      value: fmtCents(totalPaid),
      icon: <Coins size={16} weight="duotone" className="text-bp-success" />,
    },
    {
      label: "Deliverables Done",
      value: `${deliverablesDone}/${deliverablesTotal}`,
      icon: <ListChecks size={16} weight="duotone" className="text-bp-teal" />,
    },
    {
      label: "Open Issues",
      value: String(openIssues),
      icon: (
        <Warning
          size={16}
          weight="duotone"
          className={openIssues > 0 ? "text-bp-amber" : "text-bp-teal"}
        />
      ),
    },
  ];

  return (
    <div className="blueprint-scroll bg-bp-page h-full overflow-y-auto px-[28px] pt-[24px] pb-[60px]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-[22px]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Kicker>Your Work</Kicker>
            <h1 className="text-bp-ink text-[27px] font-extrabold tracking-[-0.02em]">Projects</h1>
            <p className="text-bp-muted mt-1.5 max-w-[520px] text-[13.5px]">
              Every project you&apos;ve joined — track your phases, tick off deliverables, and
              follow what you&apos;ve earned.
            </p>
          </div>
          <div className="text-right">
            <Label>Agreed across all projects</Label>
            <div className="text-bp-ink text-[21px] font-extrabold tabular-nums">
              {fmtCents(totalAgreed)}
            </div>
          </div>
        </div>

        {loadError && (
          <ErrorBanner>
            Couldn&apos;t load your projects ({loadError}) —{" "}
            <button
              type="button"
              className="cursor-pointer font-semibold underline underline-offset-2"
              onClick={() => {
                setLoading(true);
                load();
              }}
            >
              retry
            </button>
            .
          </ErrorBanner>
        )}

        <InviteTray invites={invites} onRespond={handleRespond} busyId={busyInviteId} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`${CARD} p-[16px_18px]`}>
              <div className="flex items-center justify-between">
                <Label>{kpi.label}</Label>
                {kpi.icon}
              </div>
              <div className="text-bp-ink text-[21px] font-extrabold tabular-nums">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 ? (
          <div
            className={`${CARD} border-bp-border flex flex-col items-center gap-3.5 border-[1.5px] border-dashed p-[48px_32px] text-center`}
          >
            <div className="bg-bp-tint flex h-[52px] w-[52px] items-center justify-center rounded-[15px]">
              <Briefcase size={24} weight="duotone" className="text-bp-teal" />
            </div>
            <div>
              <div className="text-bp-ink text-[16px] font-extrabold">No projects yet</div>
              <p className="text-bp-muted mt-1.5 max-w-[380px] text-[13px]">
                When a founder invites you to a phase, the invitation appears here. Accept it and
                the project shows up with its roadmap, deliverables and payments.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <ProjectSection title="Ongoing" count={ongoing.length}>
              {ongoing.map((project, index) => (
                <DeveloperProjectCard
                  key={project.id}
                  project={project}
                  idx={index}
                  onClick={() => select(project.id)}
                />
              ))}
            </ProjectSection>
            <ProjectSection title="Completed & cancelled" count={closed.length} collapsible>
              {closed.map((project, index) => (
                <DeveloperProjectCard
                  key={project.id}
                  project={project}
                  idx={index}
                  onClick={() => select(project.id)}
                />
              ))}
            </ProjectSection>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-bp-forest text-bp-mint fixed bottom-[30px] left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-xl px-5 py-[11px] text-[13px] font-semibold shadow-[0_14px_40px_rgba(11,34,27,0.42)]"
          >
            <CheckCircle size={16} weight="fill" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
