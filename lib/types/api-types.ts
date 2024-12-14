import type { Medicine } from '../dds-connector';

export interface LoginResponse {
  message: string;
  token: string;
}

export interface ApiPrescription {
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  severityImpact: number;
  medicines: Medicine[];
}

export interface QueueEntry {
  queueNumber: number;
  prescriptionId: string;
  patientId: string;
  medicines: string;
  waitTime: string;
  servedTime: string;
  entryTime: string;
}
