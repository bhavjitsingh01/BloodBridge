import { useEffect, useState } from 'react';
import { apiClient } from './api';

interface DashboardData {
  inventory: any[];
  emergencyRequests: any[];
  nearbyHospitals: any[];
  nearbyBloodBanks: any[];
  nearbyDonors: any[];
  predictions: any;
  shortages: any;
  expiryRisks: any;
  recommendations: any;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHospitalDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventory, emergencyRequests, nearbyHospitals, nearbyBloodBanks, donors, predictions, shortages, expiryRisks, recommendations] = await Promise.all([
        apiClient.getInventory({ limit: 100 }).then(res => res.data),
        apiClient.getEmergencyRequests({ limit: 10 }).then(res => res.data),
        apiClient.getHospitals({ limit: 10 }).then(res => res.data),
        apiClient.getBloodBanks({ limit: 10 }).then(res => res.data),
        apiClient.getDonors({ limit: 20 }).then(res => res.data),
        apiClient.getPredictions().catch(() => null),
        apiClient.detectShortages().catch(() => null),
        apiClient.getExpiryRisks().catch(() => null),
        apiClient.getTransferRecommendations().catch(() => null),
      ]);

      setData({
        inventory,
        emergencyRequests,
        nearbyHospitals,
        nearbyBloodBanks,
        nearbyDonors: donors,
        predictions,
        shortages,
        expiryRisks,
        recommendations,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useDonorDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [emergencyRequests, nearbyHospitals, nearbyBloodBanks, donors] = await Promise.all([
        apiClient.getEmergencyRequests({ limit: 10 }).then(res => res.data),
        apiClient.getHospitals({ limit: 10 }).then(res => res.data),
        apiClient.getBloodBanks({ limit: 10 }).then(res => res.data),
        apiClient.getDonors({ limit: 50 }).then(res => res.data),
      ]);

      setData({
        inventory: [],
        emergencyRequests,
        nearbyHospitals,
        nearbyBloodBanks,
        nearbyDonors: donors,
        predictions: null,
        shortages: null,
        expiryRisks: null,
        recommendations: null,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useBloodBankDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventory, emergencyRequests, nearbyHospitals, nearbyBloodBanks, donors, predictions, shortages, expiryRisks] = await Promise.all([
        apiClient.getInventory({ limit: 100 }).then(res => res.data),
        apiClient.getEmergencyRequests({ limit: 10 }).then(res => res.data),
        apiClient.getHospitals({ limit: 10 }).then(res => res.data),
        apiClient.getBloodBanks({ limit: 10 }).then(res => res.data),
        apiClient.getDonors({ limit: 20 }).then(res => res.data),
        apiClient.getPredictions().catch(() => null),
        apiClient.detectShortages().catch(() => null),
        apiClient.getExpiryRisks().catch(() => null),
      ]);

      setData({
        inventory,
        emergencyRequests,
        nearbyHospitals,
        nearbyBloodBanks,
        nearbyDonors: donors,
        predictions,
        shortages,
        expiryRisks,
        recommendations: null,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useAdminDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventory, emergencyRequests, hospitals, bloodBanks, donors, predictions, shortages, expiryRisks, aiDashboard] = await Promise.all([
        apiClient.getInventory({ limit: 100 }).then(res => res.data),
        apiClient.getEmergencyRequests({ limit: 20 }).then(res => res.data),
        apiClient.getHospitals({ limit: 50 }).then(res => res.data),
        apiClient.getBloodBanks({ limit: 50 }).then(res => res.data),
        apiClient.getDonors({ limit: 50 }).then(res => res.data),
        apiClient.getPredictions().catch(() => null),
        apiClient.detectShortages().catch(() => null),
        apiClient.getExpiryRisks().catch(() => null),
        apiClient.getAIDashboard().catch(() => null),
      ]);

      setData({
        inventory,
        emergencyRequests,
        nearbyHospitals: hospitals,
        nearbyBloodBanks: bloodBanks,
        nearbyDonors: donors,
        predictions,
        shortages,
        expiryRisks,
        recommendations: aiDashboard,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
