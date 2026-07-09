import { AuthVisual } from "@/features/auth/components/auth-visual";
import { SignInForm } from "@/features/auth/components/sign-in-form";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = searchParams ? await searchParams : {};
  const verifiedParam = params.verified;
  const nextParam = params.next;
  const verifiedEmail = Array.isArray(verifiedParam)
    ? (verifiedParam[0] ?? "")
    : (verifiedParam ?? "");
  const nextPath = Array.isArray(nextParam) ? (nextParam[0] ?? "") : (nextParam ?? "");

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <AuthVisual />
      <SignInForm verifiedEmail={verifiedEmail} nextPath={nextPath} />
    </div>
  );
}
