import Welcome from "@/components/welcome";
import {Queue}  from "@/components/queue";

export default function PharmacistPage() {
  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Welcome
        primaryText="Pharmacist&#39;s Prescription Dashboard"
        secondaryText="Stay on top of your game. Manage and prepare prescriptions with ease."
      />
      <Queue />
    </div>
  );
}