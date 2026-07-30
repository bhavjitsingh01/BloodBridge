import { useEffect, useState } from 'react';
import { apiClient } from './api';
import {
  mockDonorData,
  mockHospitalData,
  mockBloodBankData,
  mockAdminData,
  mockAIPredictionData,
  mockEmergencyCoordinationData
} from './mockData';

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

      try {
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
      } catch (apiErr) {
        // Fallback to mock data when API is unavailable
        setData({
          inventory: mockHospitalData.inventory,
          emergencyRequests: mockHospitalData.bloodRequests,
          nearbyHospitals: mockHospitalData.nearbyHospitals,
          nearbyBloodBanks: mockHospitalData.nearbyBloodBanks,
          nearbyDonors: mockHospitalData.nearbyDonors,
          predictions: null,
          shortages: null,
          expiryRisks: null,
          recommendations: null,
        });
      }
    } catch (err: any) {
      setError('Using demo data');
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

      try {
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
      } catch (apiErr) {
        // Fallback to mock data
        setData({
          inventory: [],
          emergencyRequests: mockEmergencyCoordinationData.emergencyRequests,
          nearbyHospitals: mockDonorData.nearbyDonationCenters,
          nearbyBloodBanks: [],
          nearbyDonors: [],
          predictions: null,
          shortages: null,
          expiryRisks: null,
          recommendations: null,
        });
      }
    } catch (err: any) {
      setError('Using demo data');
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

      try {
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
      } catch (apiErr) {
        // Fallback to mock data
        setData({
          inventory: mockBloodBankData.inventory,
          emergencyRequests: mockBloodBankData.incomingDonations,
          nearbyHospitals: [],
          nearbyBloodBanks: [],
          nearbyDonors: [],
          predictions: null,
          shortages: null,
          expiryRisks: mockBloodBankData.expiringBlood,
          recommendations: null,
        });
      }
    } catch (err: any) {
      setError('Using demo data');
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

      try {
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
      } catch (apiErr) {
        // Fallback to mock data
        setData({
          inventory: mockAdminData.allInventory,
          emergencyRequests: mockAdminData.emergencyRequests,
          nearbyHospitals: mockAdminData.hospitalsList,
          nearbyBloodBanks: mockAdminData.bloodBanksList,
          nearbyDonors: [],
          predictions: null,
          shortages: null,
          expiryRisks: null,
          recommendations: null,
        });
      }
    } catch (err: any) {
      setError('Using demo data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
