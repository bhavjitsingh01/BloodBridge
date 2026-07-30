// Transform backend API data to frontend component format

export interface MockHospitalData {
  profile: {
    name: string;
    location: string;
    contactEmail: string;
    phone: string;
  };
  inventory: Array<{
    bloodGroup: string;
    available: number;
    reserved: number;
    expiring: number;
  }>;
  bloodRequests: Array<{
    id: string;
    hospital: string;
    bloodGroup: string;
    units: number;
    status: string;
    timestamp: string;
  }>;
  nearbyBloodBanks: Array<{
    id: string;
    name: string;
    distance: number;
    availableStock: Record<string, number>;
  }>;
}

export function transformBackendInventoryToMockData(
  inventory: any[],
  hospitals: any[] = [],
  profile?: any
): MockHospitalData {
  // Group inventory by blood group
  const inventoryByGroup: Record<string, any> = {};

  inventory.forEach((item) => {
    if (!inventoryByGroup[item.bloodGroup]) {
      inventoryByGroup[item.bloodGroup] = {
        available: 0,
        reserved: 0,
        expiring: 0,
      };
    }

    if (item.status === 'Available') {
      inventoryByGroup[item.bloodGroup].available += item.units;
    } else if (item.status === 'Reserved') {
      inventoryByGroup[item.bloodGroup].reserved += item.units;
    }

    // Check if expiring in next 7 days
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      inventoryByGroup[item.bloodGroup].expiring += item.units;
    }
  });

  // Convert to array format
  const inventoryArray = Object.entries(inventoryByGroup).map(([bloodGroup, data]) => ({
    bloodGroup,
    available: data.available,
    reserved: data.reserved,
    expiring: data.expiring,
  }));

  // Transform nearby blood banks
  const nearbyBloodBanks = hospitals.slice(0, 5).map((hospital) => ({
    id: hospital._id,
    name: hospital.name,
    distance: Math.floor(Math.random() * 50) + 5, // Mock distance
    availableStock: {
      'O+': Math.floor(Math.random() * 100),
      'O-': Math.floor(Math.random() * 50),
      'A+': Math.floor(Math.random() * 80),
      'A-': Math.floor(Math.random() * 40),
      'B+': Math.floor(Math.random() * 70),
      'B-': Math.floor(Math.random() * 30),
      'AB+': Math.floor(Math.random() * 20),
      'AB-': Math.floor(Math.random() * 10),
    },
  }));

  return {
    profile: {
      name: profile?.name || 'Your Hospital',
      location: profile?.city || 'City, State',
      contactEmail: profile?.email || 'hospital@example.com',
      phone: profile?.phone || '+91-XXXXXXXXXX',
    },
    inventory: inventoryArray,
    bloodRequests: [],
    nearbyBloodBanks,
  };
}

export function transformEmergencyRequests(requests: any[]) {
  return requests.map((req) => ({
    id: req._id,
    bloodGroup: req.bloodGroup,
    units: req.unitsRequired,
    status: req.priority.toLowerCase(),
    eta: `${Math.floor(Math.random() * 60) + 30} minutes`,
    hospital: req.requesterType === 'Hospital' ? 'Hospital Network' : 'Blood Bank Network',
    priority: req.priority,
  }));
}

export function transformDonorsData(donors: any[]) {
  return donors.map((donor) => ({
    id: donor._id,
    name: donor.fullName,
    bloodGroup: donor.bloodGroup,
    status: donor.availabilityStatus,
    distance: Math.floor(Math.random() * 50) + 1,
    city: donor.city,
    state: donor.state,
  }));
}

export function transformPredictionsData(predictions: any) {
  if (!predictions || !predictions.predictions) return null;

  return {
    data: predictions.predictions.map((pred: any) => ({
      bloodGroup: pred.bloodGroup,
      predictedDemand: pred.predictedUnits,
      trend: pred.trend,
      riskLevel: pred.riskLevel,
      confidence: Math.round(pred.confidenceScore * 100),
    })),
    generatedAt: new Date(predictions.generatedAt),
  };
}

export function transformShortagesData(shortages: any) {
  if (!shortages) return null;

  return {
    shortageLocations: shortages.shortageLocations.slice(0, 10),
    surplusLocations: shortages.surplusLocations.slice(0, 10),
    recommendations: shortages.transferRecommendations.slice(0, 5),
  };
}

export function transformExpiryRisksData(expiryRisks: any) {
  if (!expiryRisks) return null;

  return {
    threeDays: expiryRisks.expiryWindows.threeDays,
    sevenDays: expiryRisks.expiryWindows.sevenDays,
    fourteenDays: expiryRisks.expiryWindows.fourteenDays,
    summary: expiryRisks.summary,
  };
}
