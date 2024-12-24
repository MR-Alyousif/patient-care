'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/services/external-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TicketCounters {
  [severity: number]: number;
}

export function TicketDispenser() {
  const [counters, setCounters] = useState<TicketCounters>({});
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    isError?: boolean;
  } | null>(null);

  const generateTicketNumber = (severityImpact: number): string => {
    const currentCounter = counters[severityImpact] || 0;
    const newCounter = (currentCounter + 1) % 100; // Keep it 2 digits

    setCounters(prev => ({
      ...prev,
      [severityImpact]: newCounter
    }));

    // Combine severity (first digit) with sequential number (last 2 digits)
    return `${severityImpact}${newCounter.toString().padStart(2, '0')}`;
  };

  const issueTicket = async (severityImpact: number) => {
    try {
      const queueNumber = generateTicketNumber(severityImpact);
      const entry = {
        queueNumber,
        prescription_id: '', // This will be set when prescription is created
        patient_id: '', // This will be set when prescription is created
        medicines: [],
        wait_time: '0',
        served_time: '',
        entry_time: new Date().toISOString(),
        status: 'processing' as const,
        severity_impact: severityImpact
      };

      await api.queue.addToQueue(entry);
      
      setNotification({
        title: 'Ticket Issued',
        description: `Your ticket number is ${queueNumber}`,
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error issuing ticket:', error);
      setNotification({
        title: 'Error',
        description: 'Failed to issue ticket',
        isError: true,
      });
    }
  };

  return (
    <>
      <Button 
        onClick={() => issueTicket(1)}
        className="bg-primary text-white hover:bg-primary/90"
      >
        Issue Ticket
      </Button>

      <Dialog open={!!notification} onOpenChange={() => setNotification(null)}>
        <DialogContent className={notification?.isError ? "border-red-500" : ""}>
          <DialogHeader>
            <DialogTitle>{notification?.title}</DialogTitle>
            <DialogDescription>{notification?.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}