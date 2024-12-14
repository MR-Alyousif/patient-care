import type { LoginResponse, ApiPrescription, QueueEntry } from '../types/api-types';

const API_BASE_URL = 'https://patient-care-api.vercel.app/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (userId: string, password: string) => 
      fetchApi<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ id: userId, password }),
      }),
  },
  patients: {
    verify: (patientId: string, prescriptionNumber: string) =>
      fetchApi<{ valid: boolean; prescription?: ApiPrescription }>('/patients/verify', {
        method: 'POST',
        body: JSON.stringify({ patientId, prescriptionNumber }),
      }),
  },
  prescriptions: {
    create: (prescription: ApiPrescription) =>
      fetchApi<{ prescriptionId: string }>('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(prescription),
      }),
  },
  queue: {
    add: (entry: QueueEntry) =>
      fetchApi<{ message: string }>('/queue/add', {
        method: 'POST',
        body: JSON.stringify(entry),
      }),
    complete: (prescriptionId: string) =>
      fetchApi<{ message: string }>('/queue/complete', {
        method: 'POST',
        body: JSON.stringify({ prescriptionId }),
      }),
  },
  metrics: {
    system: () => fetchApi('/metrics/system'),
    prescriptions: () => fetchApi('/metrics/prescriptions'),
  },
};
