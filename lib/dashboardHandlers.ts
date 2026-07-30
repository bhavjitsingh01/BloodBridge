import { apiClient } from './api'

export const dashboardHandlers = {
  async acceptEmergencyRequest(requestId: string) {
    return await apiClient.updateEmergencyStatus(requestId, 'In Progress')
  },

  async fulfillEmergencyRequest(requestId: string) {
    return await apiClient.updateEmergencyStatus(requestId, 'Fulfilled')
  },

  async deleteEmergencyRequest(requestId: string) {
    return await apiClient.deleteEmergencyRequest(requestId)
  },

  async createBloodRequest(data: {
    bloodGroup: string
    units: number
    priority: string
  }) {
    return await apiClient.createEmergencyRequest({
      bloodGroup: data.bloodGroup,
      unitsNeeded: data.units,
      priority: data.priority,
      status: 'Pending',
    })
  },

  async addInventory(data: {
    bloodGroup: string
    units: number
    expiryDate?: string
  }) {
    return await apiClient.createInventory({
      bloodGroup: data.bloodGroup,
      units: data.units,
      status: 'Available',
      expiryDate: data.expiryDate,
    })
  },

  async updateDonorProfile(userId: string, data: any) {
    return await apiClient.updateDonor(userId, data)
  },

  async createDonorProfile(data: any) {
    return await apiClient.createDonor(data)
  },
}
