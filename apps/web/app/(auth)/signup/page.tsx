import { AuthForm } from "~/components/auth/auth-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background px-4 py-12">
        <AuthForm mode="signup" />
    </div>
  );
}
