export interface Medicine {
  name: string;
  quantity: string;
  dosage: string;
}

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
  id: string;
  queueNumber: string;
  prescriptionId: string;
  patientId: string;
  medicines: Medicine[];
  waitTime: string;
  servedTime: string;
  entryTime: string;
  status: 'processing' | 'ready' | 'completed';
  severityImpact: number;
}
