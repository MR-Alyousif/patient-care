import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Prescription } from "@/lib/types/dds-types";

type UseSocketReturn = {
  publishPrescription: (prescription: Prescription) => Promise<void>;
};

export function useSocket(
  onPrescriptionUpdate: (prescription: Prescription) => void
): UseSocketReturn {
  const socketRef = useRef<Socket | undefined>();

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      await fetch("/api/dds");
      socketRef.current = io();

      socketRef.current.on("connect", () => {
        console.log("Connected to WebSocket");
      });

      socketRef.current.on("prescription-update", onPrescriptionUpdate);

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from WebSocket");
      });
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onPrescriptionUpdate]);

  return {
    publishPrescription: async (prescription: Prescription): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error("Socket not connected"));
          return;
        }

        socketRef.current.emit("new-prescription", prescription);
        socketRef.current.once(
          "prescription-published",
          (response: { success: boolean; error?: Error }) => {
            if (response.success) {
              resolve();
            } else {
              reject(response.error);
            }
          }
        );
      });
    },
  };
}
