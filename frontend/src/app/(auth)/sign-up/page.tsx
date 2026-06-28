import { SidePanel } from "@/components/auth/SidePanel";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden lg:flex-row-reverse" style={{ background: "#f5f6f4" }}>
      <SidePanel />
      <SignUpForm />
    </div>
  );
}
