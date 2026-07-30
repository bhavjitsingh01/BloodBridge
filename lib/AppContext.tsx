'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
  mockDonorData,
  mockHospitalData,
  mockBloodBankData,
  mockAdminData,
  mockEmergencyCoordinationData,
} from './mockData'

// Types
export interface BloodRequest {
  id: string
  hospitalId: string
  bloodGroup: string
  unitsNeeded: number
  priority: 'Normal' | 'High' | 'Critical'
  status: 'Pending' | 'Fulfilled' | 'Cancelled'
  createdAt: string
  updatedAt: string
}

export interface BloodInventory {
  id: string
  bloodGroup: string
  total: number
  available: number
  reserved: number
  expiring: number
  expiryDate?: string
  entityId: string
  entityType: 'hospital' | 'bloodbank'
}

export interface Donor {
  id: string
  name: string
  email: string
  phone: string
  bloodGroup: string
  age: number
  gender: string
  city: string
  state: string
  lastDonation?: string
  availability: string
}

export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  state: string
  phone: string
  inventory: BloodInventory[]
  requests: BloodRequest[]
}

export interface BloodBank {
  id: string
  name: string
  address: string
  city: string
  state: string
  phone: string
  inventory: BloodInventory[]
}

interface AppContextType {
  // Hospital Data
  hospitals: Hospital[]
  addHospital: (hospital: Hospital) => void
  updateHospital: (id: string, hospital: Partial<Hospital>) => void
  deleteHospital: (id: string) => void

  // Blood Banks
  bloodBanks: BloodBank[]
  addBloodBank: (bank: BloodBank) => void
  updateBloodBank: (id: string, bank: Partial<BloodBank>) => void
  deleteBloodBank: (id: string) => void

  // Blood Requests
  bloodRequests: BloodRequest[]
  addBloodRequest: (request: BloodRequest) => void
  updateBloodRequest: (id: string, request: Partial<BloodRequest>) => void
  deleteBloodRequest: (id: string) => void

  // Blood Inventory
  bloodInventory: BloodInventory[]
  addBloodInventory: (inventory: BloodInventory) => void
  updateBloodInventory: (id: string, inventory: Partial<BloodInventory>) => void
  deleteBloodInventory: (id: string) => void

  // Donors
  donors: Donor[]
  addDonor: (donor: Donor) => void
  updateDonor: (id: string, donor: Partial<Donor>) => void
  deleteDonor: (id: string) => void

  // Emergency Requests
  emergencyRequests: BloodRequest[]
  addEmergencyRequest: (request: BloodRequest) => void
  updateEmergencyRequest: (id: string, request: Partial<BloodRequest>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // Hospital State
  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      id: 'hospital-001',
      name: 'City Hospital',
      address: '123 Main St',
      city: 'Delhi',
      state: 'Delhi',
      phone: '+91-9876543210',
      inventory: mockHospitalData.inventory,
      requests: mockHospitalData.bloodRequests,
    },
  ])

  // Blood Banks State
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([
    {
      id: 'bank-001',
      name: 'Central Blood Bank',
      address: '456 Blood St',
      city: 'Delhi',
      state: 'Delhi',
      phone: '+91-9876543211',
      inventory: mockBloodBankData.inventory,
    },
  ])

  // Blood Requests State
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(
    mockHospitalData.bloodRequests.map(req => ({
      id: req.id,
      hospitalId: 'hospital-001',
      bloodGroup: req.bloodGroup,
      unitsNeeded: req.unitsNeeded || 5,
      priority: (req.priority || 'Normal') as 'Normal' | 'High' | 'Critical',
      status: (req.status || 'Pending') as 'Pending' | 'Fulfilled' | 'Cancelled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  )

  // Blood Inventory State
  const [bloodInventory, setBloodInventory] = useState<BloodInventory[]>([
    ...mockHospitalData.inventory.map(inv => ({
      ...inv,
      id: inv.id || `inv-hospital-${inv.bloodGroup}`,
      entityId: 'hospital-001',
      entityType: 'hospital' as const,
    })),
    ...mockBloodBankData.inventory.map(inv => ({
      ...inv,
      id: inv.id || `inv-bank-${inv.bloodGroup}`,
      entityId: 'bank-001',
      entityType: 'bloodbank' as const,
    })),
  ])

  // Donors State
  const [donors, setDonors] = useState<Donor[]>([
    {
      id: 'donor-001',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91-98765-43210',
      bloodGroup: 'O+',
      age: 28,
      gender: 'Male',
      city: 'Delhi',
      state: 'Delhi',
      lastDonation: '2024-06-15',
      availability: 'Available',
    },
  ])

  // Emergency Requests State
  const [emergencyRequests, setEmergencyRequests] = useState<BloodRequest[]>(
    mockEmergencyCoordinationData.emergencyRequests.map(req => ({
      id: req.id,
      hospitalId: 'hospital-001',
      bloodGroup: req.bloodGroup,
      unitsNeeded: req.unitsNeeded || 10,
      priority: 'Critical' as const,
      status: (req.status || 'Pending') as 'Pending' | 'Fulfilled' | 'Cancelled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  )

  // Hospital Operations
  const addHospital = useCallback((hospital: Hospital) => {
    setHospitals(prev => [...prev, hospital])
  }, [])

  const updateHospital = useCallback((id: string, hospital: Partial<Hospital>) => {
    setHospitals(prev =>
      prev.map(h => (h.id === id ? { ...h, ...hospital } : h))
    )
  }, [])

  const deleteHospital = useCallback((id: string) => {
    setHospitals(prev => prev.filter(h => h.id !== id))
  }, [])

  // Blood Bank Operations
  const addBloodBank = useCallback((bank: BloodBank) => {
    setBloodBanks(prev => [...prev, bank])
  }, [])

  const updateBloodBank = useCallback((id: string, bank: Partial<BloodBank>) => {
    setBloodBanks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...bank } : b))
    )
  }, [])

  const deleteBloodBank = useCallback((id: string) => {
    setBloodBanks(prev => prev.filter(b => b.id !== id))
  }, [])

  // Blood Request Operations
  const addBloodRequest = useCallback((request: BloodRequest) => {
    setBloodRequests(prev => [...prev, request])
  }, [])

  const updateBloodRequest = useCallback((id: string, request: Partial<BloodRequest>) => {
    setBloodRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, ...request, updatedAt: new Date().toISOString() } : r))
    )
  }, [])

  const deleteBloodRequest = useCallback((id: string) => {
    setBloodRequests(prev => prev.filter(r => r.id !== id))
  }, [])

  // Blood Inventory Operations
  const addBloodInventory = useCallback((inventory: BloodInventory) => {
    setBloodInventory(prev => [...prev, inventory])
  }, [])

  const updateBloodInventory = useCallback((id: string, inventory: Partial<BloodInventory>) => {
    setBloodInventory(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, ...inventory } : inv))
    )
  }, [])

  const deleteBloodInventory = useCallback((id: string) => {
    setBloodInventory(prev => prev.filter(inv => inv.id !== id))
  }, [])

  // Donor Operations
  const addDonor = useCallback((donor: Donor) => {
    setDonors(prev => [...prev, donor])
  }, [])

  const updateDonor = useCallback((id: string, donor: Partial<Donor>) => {
    setDonors(prev =>
      prev.map(d => (d.id === id ? { ...d, ...donor } : d))
    )
  }, [])

  const deleteDonor = useCallback((id: string) => {
    setDonors(prev => prev.filter(d => d.id !== id))
  }, [])

  // Emergency Request Operations
  const addEmergencyRequest = useCallback((request: BloodRequest) => {
    setEmergencyRequests(prev => [...prev, request])
  }, [])

  const updateEmergencyRequest = useCallback((id: string, request: Partial<BloodRequest>) => {
    setEmergencyRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, ...request, updatedAt: new Date().toISOString() } : r))
    )
  }, [])

  const value: AppContextType = {
    hospitals,
    addHospital,
    updateHospital,
    deleteHospital,
    bloodBanks,
    addBloodBank,
    updateBloodBank,
    deleteBloodBank,
    bloodRequests,
    addBloodRequest,
    updateBloodRequest,
    deleteBloodRequest,
    bloodInventory,
    addBloodInventory,
    updateBloodInventory,
    deleteBloodInventory,
    donors,
    addDonor,
    updateDonor,
    deleteDonor,
    emergencyRequests,
    addEmergencyRequest,
    updateEmergencyRequest,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
