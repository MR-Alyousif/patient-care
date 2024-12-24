import Connector from "rticonnextdds-connector";
import path from "path";
import type { Prescription } from "../types/dds-types";

export class DDSConnector {
  private static instance: DDSConnector;
  private connector!: Connector;
  private writer: any = null;
  private reader: any = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 1000; // 1 second
  private callbacks: Array<(prescription: Prescription) => void> = [];

  private constructor() {
    this.initializeDDS();
  }

  private async initializeDDS() {
    try {
      const xmlPath = path.join(process.cwd(), "DDS.xml");
      this.connector = new Connector(
        "PrescriptionSystem::PrescriptionPublisher",
        xmlPath
      );
      this.writer = this.connector.getOutput("PrescriptionWriter");
      this.reader = this.connector.getInput("PrescriptionReader");
      
      // Set up DDS listener
      this.reader.on('data', (data: any) => {
        if (data.info.valid) {
          this.handlePrescriptionUpdate(data.getJson());
        }
      });

      this.reader.on('error', (error: Error) => {
        console.error('DDS Reader error:', error);
        this.handleError(error);
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('DDS connection established successfully');
    } catch (error) {
      console.error('Failed to initialize DDS:', error);
      await this.handleConnectionFailure();
    }
  }

  private async handleConnectionFailure() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
      await this.initializeDDS();
    } else {
      throw new Error('Failed to establish DDS connection after maximum attempts');
    }
  }

  private handleError(error: Error) {
    console.error('DDS error occurred:', error);
    if (!this.isConnected) {
      this.handleConnectionFailure();
    }
  }

  private handlePrescriptionUpdate(prescription: Prescription) {
    // Emit the prescription update to all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(prescription);
      } catch (error) {
        console.error('Error in prescription callback:', error);
      }
    });
  }

  public static getInstance(): DDSConnector {
    if (!DDSConnector.instance) {
      DDSConnector.instance = new DDSConnector();
    }
    return DDSConnector.instance;
  }

  public async publishPrescription(prescription: Prescription): Promise<void> {
    if (!this.isConnected) {
      throw new Error('DDS not connected');
    }

    try {
      this.writer.instance.setFromJSON({
        ...prescription,
        timestamp: new Date().toISOString(),
      });
      await this.writer.write();
      console.log('Published prescription:', prescription.prescriptionId);
    } catch (error) {
      console.error('Failed to publish prescription:', error);
      throw error;
    }
  }

  public subscribe(callback: (prescription: Prescription) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public cleanup(): void {
    try {
      if (this.reader) {
        this.reader.removeAllListeners();
      }
      if (this.connector) {
        this.connector.close();
      }
      this.callbacks = [];
      this.isConnected = false;
      console.log('DDS resources cleaned up successfully');
    } catch (error) {
      console.error('Error during DDS cleanup:', error);
    }
  }
}
