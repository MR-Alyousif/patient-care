import { io, Socket } from 'socket.io-client';
import type { QueueEntry } from '../types/api-types';

interface QueueUpdate {
  type: 'add' | 'update' | 'delete';
  data: QueueEntry;
}

class SocketService {
  private socket: Socket | null = null;
  private queueUpdateCallbacks: ((update: QueueUpdate) => void)[] = [];

  connect() {
    if (this.socket) return;

    this.socket = io('https://patient-care-api.vercel.app/api');

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('queueUpdate', (update: QueueUpdate) => {
      this.queueUpdateCallbacks.forEach(callback => callback(update));
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  onQueueUpdate(callback: (update: QueueUpdate) => void) {
    this.queueUpdateCallbacks.push(callback);
    return () => {
      this.queueUpdateCallbacks = this.queueUpdateCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const socketService = new SocketService();
