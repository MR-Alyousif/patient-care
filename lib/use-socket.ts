import { useEffect } from "react";
import type { QueueEntry } from "@/lib/types/api-types";
import { socketService } from "@/lib/services/socket-service";

type UseSocketReturn = {
  publishQueueUpdate: (update: { type: string; data: QueueEntry }) => void;
};

export function useSocket(
  onQueueUpdate: (update: { type: string; data: QueueEntry }) => void
): UseSocketReturn {
  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    // Subscribe to queue updates
    const unsubscribe = socketService.onQueueUpdate(onQueueUpdate);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [onQueueUpdate]);

  return {
    publishQueueUpdate: (update: { type: string; data: QueueEntry }): void => {
      // You can add any additional logic here if needed
      onQueueUpdate(update);
    },
  };
}
