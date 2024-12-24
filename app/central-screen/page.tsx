"use client";

import { Order } from "@/components/order";
import { useState, useEffect } from "react";
import type { QueueEntry } from "@/lib/types/api-types";
import { api } from "@/lib/services/external-api";
import { socketService } from "@/lib/services/socket-service";

export default function CentralScreen() {
  const [queueEntries, setQueueEntries] = useState<Record<string, QueueEntry>>({});

  useEffect(() => {
    // Initial queue fetch
    const fetchQueue = async () => {
      try {
        const response = await api.queue.getQueue();
        const entries = response.data.reduce<Record<string, QueueEntry>>((acc, entry) => {
          acc[entry.prescriptionId] = entry;
          return acc;
        }, {});
        setQueueEntries(entries);
      } catch (error) {
        console.error('Error fetching queue:', error);
      }
    };

    fetchQueue();

    // Subscribe to real-time updates
    socketService.connect();
    const unsubscribe = socketService.onQueueUpdate((update) => {
      setQueueEntries((prev) => {
        switch (update.type) {
          case 'add':
          case 'update':
            return {
              ...prev,
              [update.data.prescriptionId]: update.data,
            };
          case 'delete': {
            const newState = { ...prev };
            delete newState[update.data.prescriptionId];
            return newState;
          }
          default:
            return prev;
        }
      });
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  // Get ready tickets sorted by entry time
  const readyTickets = Object.values(queueEntries)
    .filter((entry) => entry.status === "ready")
    .sort(
      (a, b) =>
        new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()
    )
    .map((entry) => parseInt(entry.queueNumber, 10));

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
