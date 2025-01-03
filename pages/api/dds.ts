/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { DDSConnector } from "@/lib/services/dds-service";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("*First use, starting socket.io");

    const io = new SocketIOServer((res.socket as any).server);
    (res.socket as any).server.io = io;
    
    // Increase max listeners limit to prevent warning
    io.setMaxListeners(20);
    
    const ddsConnector = DDSConnector.getInstance();

    io.on("connection", (socket) => {
      console.log("Client connected");
      let subscriptionTimer: any = null;

      // Subscribe to DDS updates and forward to connected clients
      subscriptionTimer = ddsConnector.startSubscription((prescription) => {
        if (socket.connected) {
          socket.emit("prescription-update", prescription);
        }
      });

      // Handle new prescriptions from clients
      socket.on("new-prescription", async (prescription) => {
        try {
          await ddsConnector.publishPrescription(prescription);
          socket.emit("prescription-published", { success: true });
        } catch (error) {
          console.error("Error publishing prescription:", error);
          socket.emit("prescription-published", { success: false, error });
        }
      });

      // Cleanup on disconnect
      socket.on("disconnect", () => {
        console.log("Client disconnected");
        if (subscriptionTimer) {
          clearInterval(subscriptionTimer);
          subscriptionTimer = null;
        }
        socket.removeAllListeners();
      });
    });

    res.end();
  }

  res.end();
}
