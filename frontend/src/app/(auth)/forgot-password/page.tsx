import { AuthVisual } from "@/features/auth/components/auth-visual";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <AuthVisual />
      <ForgotPasswordForm />
    </div>
  );
}
