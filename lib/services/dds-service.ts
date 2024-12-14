import Connector from "rticonnextdds-connector";
import path from "path";
import type { Prescription } from "../types/dds-types";

export class DDSConnector {
  private static instance: DDSConnector;
  private connector: Connector;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private writer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private reader: any;

  private constructor() {
    const xmlPath = path.join(process.cwd(), "DDS.xml");
    this.connector = new Connector(
      "PrescriptionSystem::PrescriptionPublisher",
      xmlPath
    );
    this.writer = this.connector.getOutput("PrescriptionWriter");
    this.reader = this.connector.getInput("PrescriptionReader");
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
      console.error("Error publishing prescription:", error);
      throw error;
    }
  }

  public startSubscription(
    callback: (prescription: Prescription) => void
  ): NodeJS.Timeout {
    return setInterval(() => {
      this.reader.take();
      for (const sample of this.reader.samples) {
        if (sample.info.valid) {
          const prescription = sample.getJson() as Prescription;
          callback(prescription);
        }
      }
    }, 100);
  }

  public stopSubscription(timer: NodeJS.Timeout): void {
    clearInterval(timer);
  }
}
