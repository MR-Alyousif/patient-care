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
  prescription_id: string;
  patient_id: string;
  medicines: Medicine[];
  wait_time: string;
  served_time: string;
  entry_time: string;
  status: 'processing' | 'ready' | 'completed';
  severity_impact: number;
}
