"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { QueueEntry } from "@/lib/types/api-types";
import { api } from "@/lib/services/external-api";

export function Queue() {
  const [queueEntries, setQueueEntries] = useState<Record<string, QueueEntry>>({});

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
    const unsubscribe = api.queue.onQueueUpdate((update) => {
      setQueueEntries((prev) => {
        switch (update.type) {
          case 'add':
          case 'update':
            return {
              ...prev,
              [update.data.prescription_id]: update.data,
            };
          case 'delete': {
            const newState = { ...prev };
            delete newState[update.data.prescription_id];
            return newState;
          }
          default:
            return prev;
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleComplete = async (prescriptionId: string) => {
    try {
      await api.queue.complete(prescriptionId);
    } catch (error) {
      console.error('Error completing prescription:', error);
    }
  };

  const activeEntries = Object.values(queueEntries).filter(
    (entry) => entry.status === "processing"
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activeEntries.map((entry) => (
              <Card key={entry.prescription_id}>
                <CardHeader>
                  <CardTitle>Prescription #{entry.prescription_id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>Queue Number: {entry.queueNumber}</div>
                    <div>Patient ID: {entry.patient_id}</div>
                    <div>Wait Time: {entry.wait_time}</div>
                    <Separator />
                    <div>Medicines:</div>
                    <ul className="list-disc pl-6">
                      {entry.medicines.map((medicine, index) => (
                        <li key={index}>
                          {medicine.name} - {medicine.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleComplete(entry.prescription_id)}
                    className="w-full"
                  >
                    Mark as Complete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
