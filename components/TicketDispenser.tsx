
import { useEffect, useState } from 'react';
import { Connector } from 'rticonnextdds-connector';

export function TicketDispenser() {
  const [ticketNumber, setTicketNumber] = useState(0);

  useEffect(() => {
    const connector = new Connector('MyParticipantLibrary::Zero', 'DDS.xml');
    const output = connector.getOutput('MyPublisher::TicketWriter');

    const issueTicket = async () => {
      const newTicket = { number: ticketNumber + 1, issuedAt: new Date().toISOString() };
      setTicketNumber(newTicket.number);
      output.instance.setFromJSON(newTicket);
      await output.write();
    };

    return () => connector.close();
  }, []);

  return <button onClick={issueTicket}>Issue Ticket</button>;
}