import Welcome from "@/components/welcome";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Welcome
        primaryText="Welcome to the Medical Management System"
        secondaryText="Please log in with your credentials to access the dashboard."
      />

      <LoginForm />
    </div>
  );
}
