import { SidePanel } from "@/features/auth/components/side-panel";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

type VerifyEmailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = searchParams ? await searchParams : {};
  const emailParam = params.email;
  const initialEmail = Array.isArray(emailParam) ? (emailParam[0] ?? "") : (emailParam ?? "");

  return (
    <div
      className="flex h-screen w-full overflow-hidden lg:flex-row-reverse"
      style={{ background: "#f5f6f4" }}
    >
      <SidePanel />
      <VerifyEmailForm initialEmail={initialEmail} />
    </div>
  );
}
