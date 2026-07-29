import BloodRequest, { IBloodRequest } from '../models/BloodRequest';
import Hospital from '../models/Hospital';
import BloodInventory from '../models/BloodInventory';
import { NotFoundError, ValidationError } from '../utils/errors';
import { REQUEST_STATUSES, PRIORITY_LEVELS } from '../config/constants';
import { Types } from 'mongoose';

interface CreateRequestInput {
  requestingFacilityId: string;
  bloodGroup: string;
  unitsRequired: number;
  priority: string;
  requestReason: string;
  patientInfo: {
    age: number;
    bloodGroup: string;
    condition: string;
  };
  requiredBy: Date;
}

interface UpdateRequestInput {
  status?: string;
  unitsReceived?: number;
  sourceHospital?: string;
}

export class BloodRequestService {
  /**
   * Create a blood request
   */
  static async createRequest(input: CreateRequestInput): Promise<IBloodRequest> {
    // Verify facility exists
    const facility = await Hospital.findById(input.requestingFacilityId);
    if (!facility) {
      throw new NotFoundError('Hospital');
    }

    const request = await BloodRequest.create(input);

    // Add to hospital's request list
    facility.bloodRequests.push(request._id);
    await facility.save();

    return request;
  }

  /**
   * Get request by ID
   */
  static async getRequestById(requestId: string): Promise<IBloodRequest> {
    const request = await BloodRequest.findById(requestId)
      .populate('requestingFacility', 'name email phone')
      .populate('sourceHospital', 'name email phone');

    if (!request) {
      throw new NotFoundError('Blood Request');
    }

    return request;
  }

  /**
   * Get requests for a facility
   */
  static async getFacilityRequests(facilityId: string, skip: number = 0, limit: number = 20): Promise<{
    requests: IBloodRequest[];
    total: number;
  }> {
    const [requests, total] = await Promise.all([
      BloodRequest.find({ requestingFacility: facilityId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('requestingFacility', 'name'),
      BloodRequest.countDocuments({ requestingFacility: facilityId }),
    ]);

    return { requests, total };
  }

  /**
   * Get all pending requests
   */
  static async getPendingRequests(skip: number = 0, limit: number = 20): Promise<{
    requests: IBloodRequest[];
    total: number;
  }> {
    const [requests, total] = await Promise.all([
      BloodRequest.find({ status: 'pending' })
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('requestingFacility', 'name email phone'),
      BloodRequest.countDocuments({ status: 'pending' }),
    ]);

    return { requests, total };
  }

  /**
   * Update request status
   */
  static async updateRequest(requestId: string, input: UpdateRequestInput): Promise<IBloodRequest> {
    const request = await BloodRequest.findByIdAndUpdate(requestId, input, { new: true });

    if (!request) {
      throw new NotFoundError('Blood Request');
    }

    // If fulfilled, update request status
    if (input.status === 'fulfilled') {
      request.fulfilledAt = new Date();
      await request.save();
    }

    return request;
  }

  /**
   * Fulfill a request
   */
  static async fulfillRequest(
    requestId: string,
    sourceHospitalId: string,
    unitsReceived: number
  ): Promise<IBloodRequest> {
    const request = await BloodRequest.findById(requestId);

    if (!request) {
      throw new NotFoundError('Blood Request');
    }

    if (unitsReceived > request.unitsRequired) {
      throw new ValidationError('Cannot fulfill with more units than requested');
    }

    request.unitsReceived = unitsReceived;
    request.sourceHospital = new Types.ObjectId(sourceHospitalId);
    request.status = unitsReceived === request.unitsRequired ? 'fulfilled' : 'partial';
    request.fulfilledAt = new Date();

    await request.save();
    return request;
  }

  /**
   * Reject a request
   */
  static async rejectRequest(requestId: string): Promise<IBloodRequest> {
    const request = await BloodRequest.findByIdAndUpdate(
      requestId,
      { status: 'rejected' },
      { new: true }
    );

    if (!request) {
      throw new NotFoundError('Blood Request');
    }

    return request;
  }

  /**
   * Find compatible requests for available blood
   */
  static async findRequestsForBlood(bloodGroup: string): Promise<IBloodRequest[]> {
    const requests = await BloodRequest.find({
      bloodGroup,
      status: 'pending',
      'patientInfo.bloodGroup': bloodGroup,
    })
      .sort({ priority: -1, createdAt: 1 })
      .limit(10);

    return requests;
  }
}
