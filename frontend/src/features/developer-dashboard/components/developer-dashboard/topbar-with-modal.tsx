import { Topbar } from "@/features/developer-dashboard/components/topbar";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";

type TopbarWithModalProps = {
  title: string;
  subtitle: string;
  onNavigate: DeveloperPageProps["onNavigate"];
};

export const TopbarWithModal = ({ title, subtitle, onNavigate }: TopbarWithModalProps) => {
  return (
    <div style={{ position: "relative" }}>
      <Topbar title={title} subtitle={subtitle} onNavigate={onNavigate} />
    </div>
  );
};
