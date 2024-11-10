import { PatientForm } from "@/components/forms/patient-form";
import Welcome from "../components/welcome";

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Welcome
        primaryText="Your Health, Our Priority"
        secondaryText="We're committed to your health and well-being."
      />
      <PatientForm />
    </div>
  );
}
