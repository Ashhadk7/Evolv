import { SidePanel } from "@/features/auth/components/side-panel";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden lg:flex-row-reverse"
      style={{ background: "#f5f6f4" }}
    >
      <SidePanel />
      <SignUpForm />
    </div>
  );
}
