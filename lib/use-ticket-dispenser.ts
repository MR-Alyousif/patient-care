import { useState } from 'react';

interface TicketCounters {
  [severity: number]: number;
}

export function useTicketDispenser() {
  const [counters, setCounters] = useState<TicketCounters>({});

  const issueTicket = async (severityImpact: number) => {
    const currentCounter = counters[severityImpact] || 0;
    const newCounter = (currentCounter + 1) % 100; // Keep it 2 digits

    setCounters(prev => ({
      ...prev,
      [severityImpact]: newCounter
    }));

    // Combine severity (first digit) with sequential number (last 2 digits)
    const ticketNumber = severityImpact * 100 + newCounter;

    return {
      number: ticketNumber,
      severity: severityImpact,
      issuedAt: new Date().toISOString()
    };
  };

  return { issueTicket };
}
