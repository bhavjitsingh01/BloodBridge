import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        this.token = storedToken;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    // Interceptor for adding token to requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Interceptor for handling responses
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          // Clear token on unauthorized
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken(): void {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, role: string): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', {
      email,
      password,
      name,
      role,
    });
    return response.data.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearToken();
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data.data;
  }

  // Hospital endpoints
  async getHospitals(params?: { page?: number; limit?: number; search?: string; city?: string; state?: string }) {
    const response = await this.client.get<ApiResponse<any[]>>('/hospitals', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getHospitalById(id: string) {
    const response = await this.client.get(`/hospitals/${id}`);
    return response.data.data;
  }

  async createHospital(data: any) {
    const response = await this.client.post('/hospitals', data);
    return response.data.data;
  }

  async updateHospital(id: string, data: any) {
    const response = await this.client.put(`/hospitals/${id}`, data);
    return response.data.data;
  }

  async deleteHospital(id: string) {
    await this.client.delete(`/hospitals/${id}`);
  }

  // Blood Bank endpoints
  async getBloodBanks(params?: { page?: number; limit?: number; search?: string; city?: string; state?: string }) {
    const response = await this.client.get<ApiResponse<any[]>>('/blood-banks', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getBloodBankById(id: string) {
    const response = await this.client.get(`/blood-banks/${id}`);
    return response.data.data;
  }

  async createBloodBank(data: any) {
    const response = await this.client.post('/blood-banks', data);
    return response.data.data;
  }

  async updateBloodBank(id: string, data: any) {
    const response = await this.client.put(`/blood-banks/${id}`, data);
    return response.data.data;
  }

  async deleteBloodBank(id: string) {
    await this.client.delete(`/blood-banks/${id}`);
  }

  // Donor endpoints
  async getDonors(params?: { page?: number; limit?: number; search?: string; bloodGroup?: string; city?: string; state?: string; availabilityStatus?: string }) {
    const response = await this.client.get<ApiResponse<any[]>>('/donors', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getDonorById(id: string) {
    const response = await this.client.get(`/donors/${id}`);
    return response.data.data;
  }

  async createDonor(data: any) {
    const response = await this.client.post('/donors', data);
    return response.data.data;
  }

  async updateDonor(id: string, data: any) {
    const response = await this.client.put(`/donors/${id}`, data);
    return response.data.data;
  }

  async updateDonorAvailability(id: string, availabilityStatus: 'Available' | 'Unavailable') {
    const response = await this.client.patch(`/donors/${id}/availability`, { availabilityStatus });
    return response.data.data;
  }

  async deleteDonor(id: string) {
    await this.client.delete(`/donors/${id}`);
  }

  // Blood Inventory endpoints
  async getInventory(params?: { page?: number; limit?: number; bloodGroup?: string; status?: string; hospitalId?: string }) {
    const response = await this.client.get<ApiResponse<any[]>>('/inventory', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getInventoryById(id: string) {
    const response = await this.client.get(`/inventory/${id}`);
    return response.data.data;
  }

  async getExpiringInventory(params?: { page?: number; limit?: number }) {
    const response = await this.client.get<ApiResponse<any[]>>('/inventory/expiring', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getInventorySummary() {
    const response = await this.client.get('/inventory/summary');
    return response.data.data;
  }

  async createInventory(data: any) {
    const response = await this.client.post('/inventory', data);
    return response.data.data;
  }

  async updateInventory(id: string, data: any) {
    const response = await this.client.put(`/inventory/${id}`, data);
    return response.data.data;
  }

  async deleteInventory(id: string) {
    await this.client.delete(`/inventory/${id}`);
  }

  // Emergency Request endpoints
  async getEmergencyRequests(params?: { page?: number; limit?: number; status?: string; priority?: string; bloodGroup?: string }) {
    const response = await this.client.get<ApiResponse<any[]>>('/emergency', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getEmergencyRequestById(id: string) {
    const response = await this.client.get(`/emergency/${id}`);
    return response.data.data;
  }

  async createEmergencyRequest(data: any) {
    const response = await this.client.post('/emergency', data);
    return response.data.data;
  }

  async updateEmergencyStatus(id: string, status: string) {
    const response = await this.client.patch(`/emergency/${id}/status`, { status });
    return response.data.data;
  }

  async deleteEmergencyRequest(id: string) {
    await this.client.delete(`/emergency/${id}`);
  }

  async getEmergencyMatching(requestId: string) {
    const response = await this.client.post(`/emergency/matching/${requestId}`);
    return response.data.data;
  }

  // AI Endpoints
  async predictDemand(timeframe: '7days' | '30days' | '90days' = '30days') {
    const response = await this.client.post('/ai/predict-demand', { timeframe });
    return response.data.data;
  }

  async getPredictions(params?: { timeframe?: string; riskLevel?: string }) {
    const response = await this.client.get('/ai/predictions', { params });
    return response.data.data;
  }

  async detectShortages() {
    const response = await this.client.get('/ai/shortages');
    return response.data.data;
  }

  async getExpiryRisks(params?: { window?: string }) {
    const response = await this.client.get('/ai/expiry-risk', { params });
    return response.data.data;
  }

  async getAIDashboard() {
    const response = await this.client.get('/ai/dashboard');
    return response.data.data;
  }

  // Notification endpoints
  async getNotifications(params?: { page?: number; limit?: number }) {
    const response = await this.client.get<ApiResponse<any[]>>('/notifications', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getUnreadNotificationCount() {
    const response = await this.client.get('/notifications/unread/count');
    return response.data.data.unreadCount;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.client.patch(`/notifications/${id}/read`);
    return response.data.data;
  }

  async markAllNotificationsAsRead() {
    await this.client.patch('/notifications/read/all');
  }

  async deleteNotification(id: string) {
    await this.client.delete(`/notifications/${id}`);
  }

  // Recommendation endpoints
  async getTransferRecommendations(params?: { hospitalId?: string }) {
    const response = await this.client.get('/recommendations/transfers', { params });
    return response.data.data;
  }

  async getDonorRecommendations(params: { emergencyRequestId: string; bloodGroup: string; unitsRequired: number; latitude: number; longitude: number }) {
    const response = await this.client.get('/recommendations/donors', { params });
    return response.data.data;
  }
}

export const apiClient = new ApiClient();

export type { ApiResponse, AuthResponse, ErrorResponse };
