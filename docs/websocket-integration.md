# Patient Care Management System Implementation Guide

## Overview

The **Patient Care Management System** is a distributed priority queue management application designed to streamline interactions between patients, doctors, and pharmacists. It uses **WebSocket connections** within a Next.js application to ensure real-time data exchange, eliminating the need for database dependency during communication.

### Key Features:

- **Ticket Dispenser**: Issues tickets to patients and notifies doctors and the central screen in real time.
- **Central Screen**: Displays the current ticket being served.
- **Doctor Interface**: Receives tickets, assigns priority levels, and communicates updates to the pharmacist.
- **Pharmacist Interface**: Processes prescriptions based on ticket priority.
- **Direct Communication**: Utilizes WebSocket connections to enable real-time interaction between components.

---

## Implementation Steps

Follow these steps to implement direct communication between system components using WebSockets in a Next.js environment.

---

### 1. Set Up WebSocket Communication with Next.js API Routes

#### Steps:

1. **Utilize Next.js API Routes**: Create a WebSocket server within an API route.
2. **Employ the `ws` Library**: Use the `ws` library to manage WebSocket connections effectively.

**Code:**

```typescript
import { WebSocketServer } from 'ws';

let websocketServer;

export default function handler(req, res) {
  if (!websocketServer) {
    websocketServer = new WebSocketServer({ noServer: true });

    websocketServer.on('connection', (socket) => {
      socket.on('message', (message) => {
        // Broadcast message to all connected clients except the sender
        websocketServer.clients.forEach((client) => {
          if (client !== socket && client.readyState === 1) {
            client.send(message);
          }
        });
      });
    });

    // Upgrade HTTP server to handle WebSocket connections
    res.socket.server.on('upgrade', (request, socket, head) => {
      if (request.url === '/api/socket') {
        websocketServer.handleUpgrade(request, socket, head, (ws) => {
          websocketServer.emit('connection', ws, request);
        });
      }
    });
  }
  res.end();
}
```

---

### 2. Modify the Ticket Dispenser Component

- **Establish WebSocket Connection**: Connect to the WebSocket server.
- **Emit Ticket Data**: Send new ticket data to other components.

**Code:**

```typescript
import { useEffect, useRef, useState } from 'react';

export function TicketDispenser() {
  const [ticketNumber, setTicketNumber] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000/api/socket');
    return () => socketRef.current?.close();
  }, []);

  const issueTicket = () => {
    const newTicket = { number: ticketNumber + 1, issuedAt: new Date() };
    setTicketNumber(newTicket.number);
    socketRef.current?.send(JSON.stringify({ type: 'new-ticket', ticket: newTicket }));
  };

  return <button onClick={issueTicket}>Issue Ticket</button>;
}
```

---

### 3. Update the Central Screen Component

- **Listen for Updates**: Receive new ticket messages in real time.
- **Display Tickets**: Show the ticket currently being served.

**Code:**

```typescript
import { useEffect, useRef, useState } from 'react';

export function CentralScreen() {
  const [currentTicket, setCurrentTicket] = useState(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000/api/socket');

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'new-ticket') {
        setCurrentTicket(message.ticket);
      }
    };

    return () => socketRef.current?.close();
  }, []);

  return <h1>Now Serving Ticket: {currentTicket?.number || 'None'}</h1>;
}
```

---

### 4. Adjust the Doctor Interface

- **Handle Incoming Tickets**: Receive tickets via WebSocket.
- **Assign Priorities**: Enable doctors to prioritize tickets.
- **Send Updates**: Communicate priority changes to the pharmacist.

**Code:**

```typescript
import { useEffect, useRef, useState } from 'react';

export default function DoctorPage() {
  const [tickets, setTickets] = useState([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000/api/socket');

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'new-ticket') {
        setTickets((prev) => [...prev, message.ticket]);
      }
    };

    return () => socketRef.current?.close();
  }, []);

  const updatePriority = (ticket, priority) => {
    const updatedTicket = { ...ticket, priority };
    socketRef.current?.send(JSON.stringify({ type: 'priority-update', ticket: updatedTicket }));
  };

  return (
    <>
      {tickets.map((ticket) => (
        <div key={ticket.number}>
          <span>Ticket {ticket.number}</span>
          <button onClick={() => updatePriority(ticket, 'high')}>Set High Priority</button>
        </div>
      ))}
    </>
  );
}
```

---

### 5. Modify the Pharmacist Interface

- **Receive Priority Updates**: Listen for ticket priority changes.
- **Process Prescriptions**: Display and handle tickets based on priority.

**Code:**

```typescript
import { useEffect, useRef, useState } from 'react';

export default function PharmacistPage() {
  const [tickets, setTickets] = useState([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000/api/socket');

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'priority-update') {
        setTickets((prev) => [...prev, message.ticket]);
      }
    };

    return () => socketRef.current?.close();
  }, []);

  return (
    <>
      {tickets
        .sort((a, b) => (a.priority === 'high' ? -1 : 1))
        .map((ticket) => (
          <div key={ticket.number}>
            <span>
              Ticket {ticket.number} - Priority: {ticket.priority || 'normal'}
            </span>
          </div>
        ))}
    </>
  );
}
```

---

### 6. Update the Prescription Form Component

- **Emit Prescription Data**: Send prescription details upon submission.

**Code:**

```typescript
import { useEffect, useRef } from 'react';

export function PrescriptionForm() {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000/api/socket');
    return () => socketRef.current?.close();
  }, []);

  const onSubmit = (data) => {
    socketRef.current?.send(JSON.stringify({ type: 'prescription-submitted', data }));
  };

  return (
    // Form JSX...
  );
}
```

---

### 7. Finalize Communication Without Database Dependency

- **Real-Time Exchange**: Ensure all communication is handled directly via WebSockets.
- **Database Use**: Reserve database for system statistics, not real-time data transfer.

---

By following this guide, you can implement a fully distributed real-time system with WebSocket-based direct communication, eliminating the dependency on databases for interaction between components.

---