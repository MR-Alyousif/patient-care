export interface Medicine {
  name: string;
  quantity: string;
  dosage: string;
}

export interface Prescription {
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  medicines: Medicine[];
  status: string;
  ticketNumber: number | null;
  timestamp: string;
  severityImpact: number;
}
