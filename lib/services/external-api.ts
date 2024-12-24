import type { LoginResponse, ApiPrescription, QueueEntry } from '../types/api-types';
import axios from 'axios';

const API_BASE_URL = 'https://patient-care-api.vercel.app/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function fetchApi<T>(endpoint: string, options: { method?: string; data?: any; headers?: any } = {}): Promise<T> {
  try {
    const response = await axiosInstance({
      url: endpoint,
      method: options.method || 'GET',
      data: options.data,
      headers: options.headers,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'API request failed');
    }
    throw error;
  }
}

interface SystemMetrics {
  queueLength: number;
  averageServiceTime: number;
  averageWaitTime: number;
  timestamp: string;
}

interface SystemMetricsResponse {
  timestamp: string;
  queue_length: string;
  average_service_time: string;
  average_wait_time: string;
  id: number;
}

interface PrescriptionMetrics {
  totalPrescriptions: number;
  uniquePatients: number;
}

interface PrescriptionResponse {
  id: number;
  doctor_id: string;
  patient_id: string;
  created_at: string;
  service_time: {
    minutes: number;
    seconds: number;
  };
  severity_impact: number;
}

export const api = {
  auth: {
    login: (userId: string, password: string) => 
      fetchApi<LoginResponse>('/auth/login', {
        method: 'POST',
        data: { id: userId, password },
      }),
  },
  medicines: {
    updateStock: (medicineName: string, neededQuantity: number) =>
      fetchApi<{ message: string; updatedStockQuantity: number }>('/medicines/update-stock', {
        method: 'POST',
        data: { medicineName, neededQuantity },
      }),
    checkStock: () =>
      fetchApi<Array<{ name: string; stock_quantity: number; threshold_quantity: number }>>('/medicines/check-stock'),
    getUsage: () =>
      fetchApi<{ data: Array<{ name: string; used_quantity: number }> }>('/medicines/used'),
    getStock: () =>
      fetchApi<{ data: Array<{ name: string; stock_quantity: number }> }>('/medicines/stock'),
  },
  pharmacists: {
    getQueue: () =>
      fetchApi<Array<{
        queueNumber: string;
        prescription_id: string;
        patient_id: string;
        status: string;
        medicines: any[];
        wait_time: string;
        served_time: string;
        entry_time: string;
      }>>('/pharmacists/queue'),
    addToQueue: (entry: {
      queueNumber: string;
      prescriptionId: string;
      patientId: string;
      medicines: any[];
      waitTime: string;
      servedTime: string;
      entryTime: string;
    }) =>
      fetchApi<{
        message: string;
        data: {
          queueNumber: string;
          prescription_id: string;
          patient_id: string;
          status: string;
          medicines: any[];
          wait_time: string;
          served_time: string;
          entry_time: string;
        };
      }>('/pharmacists/queue/add', {
        method: 'POST',
        data: entry,
      }),
    complete: (prescriptionId: string) =>
      fetchApi<{ message: string }>('/pharmacists/complete', {
        method: 'POST',
        data: { prescriptionId },
      }),
  },
  prescriptions: {
    create: (data: {
      doctorId: string;
      patientId: string;
      serviceTime?: string;
      severityImpact?: number;
    }) =>
      fetchApi<{ message: string; id: string }>('/prescription', {
        method: 'POST',
        data,
      }),
    notify: (patientId: string, prescriptionNumber: string) =>
      fetchApi<{ message: string }>('/prescription/notify', {
        method: 'POST',
        data: { patientId, prescriptionNumber },
      }),
  },
  metrics: {
    system: () => fetchApi<SystemMetricsResponse[]>('/metrics/system'),
    prescription: () => fetchApi<PrescriptionResponse[]>('/metrics/prescription'),
  },
};
