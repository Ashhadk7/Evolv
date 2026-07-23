import { Topbar } from "@/features/developer-dashboard/components/topbar";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";

type TopbarWithModalProps = {
  title: string;
  subtitle: string;
  profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
  onNavigate: DeveloperPageProps["onNavigate"];
};

export const TopbarWithModal = ({ title, subtitle, profile, onNavigate }: TopbarWithModalProps) => {
  return (
    <div style={{ position: "relative" }}>
      <Topbar title={title} subtitle={subtitle} profile={profile} onNavigate={onNavigate} />
    </div>
  );
};
