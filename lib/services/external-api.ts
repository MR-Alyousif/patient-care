import type { LoginResponse, ApiPrescription, QueueEntry } from "../types/api-types";
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
  id: string;
  prescriptionNumber: string;
}

// interface Medicine {
//   name: string;
//   quantity: string;
// }

export const api = {
  auth: {
    login: (userId: string, password: string) =>
      fetchApi<LoginResponse>("/auth/login", {
        method: "POST",
        data: { id: userId, password },
      }),
  },
  medicines: {
    updateStock: (medicineName: string, neededQuantity: number) =>
      fetchApi<{ message: string; updatedStockQuantity: number }>(
        "/medicines/update-stock",
        {
          method: "POST",
          data: { medicineName, neededQuantity },
        }
      ),
    checkStock: () =>
      fetchApi<
        Array<{
          name: string;
          stock_quantity: number;
          threshold_quantity: number;
        }>
      >("/medicines/check-stock"),
    getUsage: () =>
      fetchApi<{ data: Array<{ name: string; used_quantity: number }> }>(
        "/medicines/used"
      ),
    getStock: () =>
      fetchApi<{ data: Array<{ name: string; stock_quantity: number }> }>(
        "/medicines/stock"
      ),
  },
  pharmacists: {
    async getQueue() {
      return fetchApi<{ data: QueueEntry[] }>("/pharmacists/queue");
    },
    async addToQueue(entry: Omit<QueueEntry, 'id'>) {
      return fetchApi<{ data: QueueEntry }>("/pharmacists/queue", {
        method: "POST",
        data: entry,
      });
    },
    async complete(prescriptionId: string) {
      return fetchApi<{ data: QueueEntry }>(`/pharmacists/queue/${prescriptionId}/complete`, {
        method: "POST",
      });
    },
    onQueueUpdate(callback: Parameters<typeof socketService.onQueueUpdate>[0]) {
      socketService.connect();
      return socketService.onQueueUpdate(callback);
    }
  },
  queue: {
    async getQueue() {
      return fetchApi<{ data: QueueEntry[] }>("/queue");
    },
    async addToQueue(entry: Omit<QueueEntry, 'id'>) {
      return fetchApi<{ data: QueueEntry }>("/queue", {
        method: "POST",
        data: entry,
      });
    },
    async complete(prescriptionId: string) {
      return fetchApi<{ data: QueueEntry }>(`/queue/${prescriptionId}/complete`, {
        method: "POST",
      });
    },
    onQueueUpdate(callback: Parameters<typeof socketService.onQueueUpdate>[0]) {
      socketService.connect();
      return socketService.onQueueUpdate(callback);
    }
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
        data,
      });
    },
    get(prescriptionId: string) {
      return fetchApi<{ data: ApiPrescription }>(
        `/prescriptions/${prescriptionId}`
      );
    },
    notify(patientId: string, prescriptionNumber: string) {
      return fetchApi<{ message: string }>("/prescriptions/notify", {
        method: "POST",
        data: { patientId, prescriptionNumber },
      });
    },
  },
  metrics: {
    system: () => fetchApi<SystemMetricsResponse[]>("/metrics/system"),
    prescription: () =>
      fetchApi<PrescriptionResponse[]>("/metrics/prescription"),
  },
};
