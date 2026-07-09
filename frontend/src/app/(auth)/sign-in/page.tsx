import { AuthVisual } from "@/features/auth/components/auth-visual";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <AuthVisual />
      <SignInForm />
    </div>
  );
}
