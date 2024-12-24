"use client";

import Welcome from "@/components/welcome";
import PrescriptionForm from "@/components/forms/prescription-form";

export default function DoctorPage() {
  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Welcome
        primaryText="Doctor&#39;s Prescription Dashboard"
        secondaryText="Fill out the patient&#39;s prescription details below."
      />

      <PrescriptionForm />
    </div>
  );
}
