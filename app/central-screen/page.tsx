"use client";
import { Order } from "@/components/order";
import { useState, useEffect } from "react";
import { ddsConnector } from "@/lib/dds-connector";
import type { Prescription } from "@/lib/dds-connector";

export default function CentralScreen() {
  const [prescriptions, setPrescriptions] = useState<
    Record<string, Prescription>
  >({});

  useEffect(() => {
    // Subscribe to prescription updates
    const timer = ddsConnector.startSubscription((prescription) => {
      setPrescriptions((prev) => ({
        ...prev,
        [prescription.prescriptionId]: prescription,
      }));
    });

    return () => ddsConnector.stopSubscription(timer);
  }, []);

  // Get ready tickets sorted by timestamp
  const readyTickets = Object.values(prescriptions)
    .filter((p) => p.status === "ready" && p.ticketNumber !== null)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .map((p) => p.ticketNumber as number);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {readyTickets.length > 0 ? (
        readyTickets.map((ticket, index) => (
          <div key={ticket} className="mb-8">
            <Order
              value={ticket}
              title={index === 0 ? "Now Serving" : "Up Next"}
            />
          </div>
        ))
      ) : (
        <p className="text-2xl text-gray-500">
          No prescriptions ready for pickup
        </p>
      )}
    </main>
  );
}
