"use client";

import { Order } from "@/components/order";
import { useState, useEffect } from "react";
import type { QueueEntry } from "@/lib/types/api-types";
import { api } from "@/lib/services/external-api";
import { socketService } from "@/lib/services/socket-service";

export default function CentralScreen() {
  const [queueEntries, setQueueEntries] = useState<Record<string, QueueEntry>>({});
  const [completedEntries, setCompletedEntries] = useState<QueueEntry[]>([]);

  useEffect(() => {
    // Initial queue fetch
    const fetchQueue = async () => {
      try {
        const response = await api.queue.getQueue();
        const entries = response.data.reduce<Record<string, QueueEntry>>((acc, entry) => {
          acc[entry.prescription_id] = entry;
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
      const entry = update.data;
      if (entry.status === 'completed') {
        setCompletedEntries(prev => [entry, ...prev].slice(0, 10));
        setQueueEntries(prev => {
          const newState = { ...prev };
          delete newState[entry.prescription_id];
          return newState;
        });
      } else {
        setQueueEntries(prev => ({
          ...prev,
          [entry.prescription_id]: entry
        }));
      }
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Current Queue</h2>
          <div className="space-y-4">
            {Object.values(queueEntries)
              .sort((a, b) => b.severity_impact - a.severity_impact)
              .map(entry => (
                <Order 
                  key={entry.prescription_id}
                  value={entry.queueNumber}
                  status={entry.status}
                  severity={entry.severity_impact}
                />
              ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Recently Completed</h2>
          <div className="space-y-4">
            {completedEntries.map(entry => (
              <Order 
                key={entry.prescription_id}
                value={entry.queueNumber}
                status={entry.status}
                severity={entry.severity_impact}
                completed
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
