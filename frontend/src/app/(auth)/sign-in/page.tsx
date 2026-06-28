import { AuthVisual } from "@/components/auth/AuthVisual";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <AuthVisual />
      <SignInForm />
    </div>
  );
}
