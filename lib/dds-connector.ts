import Connector from 'rticonnextdds-connector';
import path from 'path';

export interface Medicine {
  name: string;
  quantity: string;
  dosage: string;
}

export interface Prescription {
  prescriptionId: string;
  patientId: string;
  medicines: Medicine[];
  status: string;
  ticketNumber: number | null;
  timestamp: string;
}

export class DDSConnector {
  private static instance: DDSConnector;
  private connector: Connector;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private writer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private reader: any;

  private constructor() {
    const xmlPath = path.join(process.cwd(), 'DDS.xml');
    this.connector = new Connector('PrescriptionSystem::PrescriptionPublisher', xmlPath);
    this.writer = this.connector.getOutput('PrescriptionWriter');
    this.reader = this.connector.getInput('PrescriptionReader');
  }

  public static getInstance(): DDSConnector {
    if (!DDSConnector.instance) {
      DDSConnector.instance = new DDSConnector();
    }
    return DDSConnector.instance;
  }

  public async publishPrescription(prescription: Prescription): Promise<void> {
    try {
      this.writer.instance.setFromJSON({
        ...prescription,
        timestamp: new Date().toISOString(),
      });
      await this.writer.write();
    } catch (error) {
      console.error('Error publishing prescription:', error);
      throw error;
    }
  }

  public async subscribeToPrescriptions(callback: (prescription: Prescription) => void): Promise<void> {
    try {
      this.reader.read();
      const samples = this.reader.samples;
      
      for (let i = 1; i <= samples.getLength(); i++) {
        if (samples.isValid(i)) {
          const sample = samples.getJSON(i);
          callback(sample);
        }
      }
    } catch (error) {
      console.error('Error reading prescriptions:', error);
      throw error;
    }
  }

  public startSubscription(callback: (prescription: Prescription) => void, interval: number = 1000): NodeJS.Timeout {
    return setInterval(() => {
      this.subscribeToPrescriptions(callback).catch(console.error);
    }, interval);
  }

  public stopSubscription(timer: NodeJS.Timeout): void {
    clearInterval(timer);
  }
}

export const ddsConnector = DDSConnector.getInstance();
