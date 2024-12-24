import type { LoginResponse, ApiPrescription, QueueEntry, Medicine } from "../types/api-types";
import axios from "axios";
import { socketService } from './socket-service';

const API_BASE_URL = "https://patient-care-api.vercel.app/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RequestOptions {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  try {
    const response = await axiosInstance({
      url: endpoint,
      method: options.method || "GET",
      data: options.data,
      headers: options.headers,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "API request failed");
    }
    throw error;
  }
}

interface SystemMetricsResponse {
  timestamp: string;
  queue_length: string;
  average_service_time: string;
  average_wait_time: string;
  id: number;
}

interface PrescriptionResponse {
  message: string;
  data: ApiPrescription;
}

interface StockMedicine extends Medicine {
  stock_quantity: number;
  threshold_quantity: number;
}

export const api = {
  auth: {
    login(userId: string, password: string) {
      return fetchApi<LoginResponse>("/auth/login", {
        method: "POST",
        data: { userId, password },
      });
    },
  },
  medicines: {
    updateStock(medicineName: string, neededQuantity: number) {
      return fetchApi<{ message: string }>("/medicines/update-stock", {
        method: "POST",
        data: { medicineName, neededQuantity },
      });
    },
    checkStock() {
      return fetchApi<{ data: StockMedicine[] }>("/medicines/check-stock", {
        method: "GET",
      });
    },
    getUsage() {
      return fetchApi<{ data: StockMedicine[] }>("/medicines/used");
    },
    getStock() {
      return fetchApi<{ data: StockMedicine[] }>("/medicines/stock");
    },
  },
  pharmacists: {
    getQueue() {
      return fetchApi<{ data: QueueEntry[] }>("/pharmacists/queue");
    },
    addToQueue(entry: Omit<QueueEntry, 'id'>) {
      return fetchApi<{ data: QueueEntry }>("/pharmacists/queue", {
        method: "POST",
        data: entry,
      });
    },
    complete(prescriptionId: string) {
      return fetchApi<{ data: QueueEntry }>(`/pharmacists/queue/${prescriptionId}/complete`, {
        method: "PUT",
      });
    },
    onQueueUpdate(callback: Parameters<typeof socketService.onQueueUpdate>[0]) {
      return socketService.onQueueUpdate(callback);
    },
  },
  queue: {
    getQueue() {
      return fetchApi<{ data: QueueEntry[] }>("/queue");
    },
    addToQueue(entry: Omit<QueueEntry, 'id'>) {
      return fetchApi<{ data: QueueEntry }>("/queue", {
        method: "POST",
        data: entry,
      });
    },
    complete(prescriptionId: string) {
      return fetchApi<{ data: QueueEntry }>(`/queue/${prescriptionId}/complete`, {
        method: "PUT",
      });
    },
    onQueueUpdate(callback: Parameters<typeof socketService.onQueueUpdate>[0]) {
      return socketService.onQueueUpdate(callback);
    },
  },
  prescriptions: {
    create(data: {
      doctorId: string;
      patientId: string;
      serviceTime?: string;
      severityImpact?: number;
    }) {
      return fetchApi<PrescriptionResponse>("/prescriptions", {
        method: "POST",
        data: {
          doctor_id: data.doctorId,
          patient_id: data.patientId,
          service_time: data.serviceTime,
          severity_impact: data.severityImpact,
        },
      });
    },
    get(prescriptionId: string) {
      return fetchApi<{ data: ApiPrescription }>(`/prescriptions/${prescriptionId}`);
    },
    notify(patientId: string, prescriptionNumber: string) {
      return fetchApi<{ message: string }>("/prescriptions/notify", {
        method: "POST",
        data: { patientId, prescriptionNumber },
      });
    },
  },
  metrics: {
    system() {
      return fetchApi<{ data: SystemMetricsResponse[] }>("/metrics/system");
    },
    prescription() {
      return fetchApi<{ data: ApiPrescription[] }>("/metrics/prescription");
    },
  },
};
