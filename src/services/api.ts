// Determine the API base URL based on environment
const getBaseURL = (): string => {
  // First check environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in production (Vercel deployment)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    // Production - use the Vercel backend URL
    return 'https://tikidan-backend.vercel.app/api';
  }
  
  // Development - use localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseURL();

// Helper function to get the API URL
export const getApiUrl = (): string => {
  return API_BASE_URL;
};

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

export interface ContactPerson {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  designation?: string;
}

export interface BranchLocation {
  _id?: string;
  id?: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  contacts?: ContactPerson[];
}

export interface Client {
  _id?: string;
  id?: string;
  category: string;
  clientName: string;
  salesPerson?: string;
  status?: string;
  totalMeetings?: number;
  totalProjects?: number;
  locations?: BranchLocation[];
  createdBy?: string | { name?: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
  transferHistory?: Array<{
    from?: { name?: string; email?: string };
    to?: { name?: string; email?: string };
    transferredAt?: string;
  }>;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration?: number;
  location?: string;
  type: string;
  status: string;
  client: string;
  attendees?: Array<{
    name: string;
    email: string;
    role?: string;
  }>;
  meetingNotes?: string;
  followUpRequired?: boolean;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status: string;
  priority: string;
  client: string;
  teamMembers?: Array<{
    name: string;
    role: string;
    email?: string;
  }>;
  progress?: number;
  notes?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get authentication token from localStorage
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Client API functions
export const clientApi = {
  // Get all clients
  getAll: async (): Promise<ApiResponse<Client[]>> => {
    return apiCall<Client[]>('/clients');
  },

  // Get single client
  getById: async (id: string): Promise<ApiResponse<{ client: Client; meetings: Meeting[]; projects: Project[] }>> => {
    return apiCall<{ client: Client; meetings: Meeting[]; projects: Project[] }>(`/clients/${id}`);
  },

  // Create new client
  create: async (clientData: Partial<Client> & { locations?: BranchLocation[] }): Promise<ApiResponse<Client>> => {
    return apiCall<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  // Update client
  update: async (id: string, clientData: Partial<Client>): Promise<ApiResponse<Client>> => {
    return apiCall<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },

  // Delete client with cascade deletion
  delete: async (id: string): Promise<ApiResponse<{ clientName: string; deletedItems: any }>> => {
    return apiCall<{ clientName: string; deletedItems: any }>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

export default clientApi;