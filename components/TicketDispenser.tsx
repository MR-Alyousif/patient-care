import { useEffect, useState } from 'react';
import Connector from 'rticonnextdds-connector';

interface TicketCounters {
  [severity: number]: number;
}

export function TicketDispenser() {
  const [counters, setCounters] = useState<TicketCounters>({});
  const [issueTicket, setIssueTicket] = useState<((severityImpact: number) => Promise<void>) | null>(null);

  useEffect(() => {
    const connector = new Connector('MyParticipantLibrary::Zero', 'DDS.xml');
    const output = connector.getOutput('MyPublisher::TicketWriter');

    const generateTicketNumber = (severityImpact: number): number => {
      const currentCounter = counters[severityImpact] || 0;
      const newCounter = (currentCounter + 1) % 100; // Keep it 2 digits

      setCounters(prev => ({
        ...prev,
        [severityImpact]: newCounter
      }));

      // Combine severity (first digit) with sequential number (last 2 digits)
      return severityImpact * 100 + newCounter;
    };

    setIssueTicket(() => async (severityImpact: number) => {
      const newTicketNumber = generateTicketNumber(severityImpact);
      const ticket = { 
        number: newTicketNumber, 
        severity: severityImpact,
        issuedAt: new Date().toISOString() 
      };

      output.instance.setFromJSON(ticket);
      await output.write();
    });

    return () => connector.close();
  }, [counters]);

  return <button onClick={() => issueTicket?.(1)}>Issue Ticket</button>;
}