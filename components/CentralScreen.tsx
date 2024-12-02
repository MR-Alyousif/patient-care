
import { useEffect, useState } from 'react';
import { Connector } from 'rticonnextdds-connector';

export function CentralScreen() {
  const [currentTicket, setCurrentTicket] = useState(null);

  useEffect(() => {
    const connector = new Connector('MyParticipantLibrary::Zero', 'DDS.xml');
    const input = connector.getInput('MySubscriber::TicketReader');

    const readTickets = async () => {
      while (true) {
        await input.wait();
        input.take();
        for (const sample of input.samples.validDataIterator) {
          const ticket = sample.getJson();
          setCurrentTicket(ticket);
        }
      }
    };

    readTickets();
  }, []);

  return <h1>Now Serving Ticket: {currentTicket?.number || 'None'}</h1>;
}