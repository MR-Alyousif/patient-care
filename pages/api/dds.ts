/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { DDSConnector } from '@/lib/dds-connector';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log('*First use, starting socket.io');

    const io = new SocketIOServer((res.socket as any).server);
    const ddsConnector = DDSConnector.getInstance();

    io.on('connection', (socket) => {
      console.log('Client connected');

      // Subscribe to DDS updates and forward to connected clients
      const timer = ddsConnector.startSubscription((prescription) => {
        socket.emit('prescription-update', prescription);
      });

      // Handle new prescriptions from clients
      socket.on('new-prescription', async (prescription) => {
        try {
          await ddsConnector.publishPrescription(prescription);
          socket.emit('prescription-published', { success: true });
        } catch (error) {
          console.error('Error publishing prescription:', error);
          socket.emit('prescription-published', { success: false, error });
        }
      });

      // Clean up on disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected');
        ddsConnector.stopSubscription(timer);
      });
    });

    (res.socket as any).server.io = io;
  }

  res.end();
}
