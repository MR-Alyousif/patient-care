"use client";
import { Order } from "@/components/order";
import { useState, useEffect } from "react";

interface Prescription {
  prescriptionId: string;
  patientId: string;
  medicines: any[];
  status: string;
  ticketNumber: number | null;
}

export default function CentralScreen() {
  const [readyTickets, setReadyTickets] = useState<number[]>([]);

  useEffect(() => {
    const checkPrescriptions = () => {
      const prescriptions = JSON.parse(localStorage.getItem("prescriptions") || "{}");
      const ready = Object.values(prescriptions)
        .filter((p: any) => p.status === "ready")
        .map((p: any) => p.ticketNumber)
        .filter((n): n is number => n !== null)
        .sort((a, b) => a - b);
      setReadyTickets(ready);
    };

    // Check immediately and then every 5 seconds
    checkPrescriptions();
    const interval = setInterval(checkPrescriptions, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {readyTickets.length > 0 ? (
        readyTickets.map((ticket, index) => (
          <div key={ticket} className="mb-8">
            <Order value={ticket} title={index === 0 ? "Now Serving" : "Up Next"} />
          </div>
        ))
      ) : (
        <p className="text-2xl text-gray-500">No prescriptions ready for pickup</p>
      )}
    </main>
  );
}
