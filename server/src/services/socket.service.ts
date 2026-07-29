import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../utils/logger';
import { Types } from 'mongoose';

interface SocketUser {
  id: string;
  email: string;
  role: string;
  locationId?: string;
  state?: string;
  city?: string;
}

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupNamespaces();
  }

  private setupMiddleware(): void {
    // Authenticate socket connections
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      const user = socket.handshake.auth.user;

      if (!user || !user.id) {
        return next(new Error('Authentication error'));
      }

      socket.data.user = user;
      next();
    });

    // Log connections
    this.io.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;
      this.connectedUsers.set(socket.id, user);
      logger.info(`User connected: ${user.email} (${socket.id})`);

      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        logger.info(`User disconnected: ${user.email} (${socket.id})`);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error for ${user.email}:`, error);
      });
    });
  }

  private setupNamespaces(): void {
    this.setupHospitalNamespace();
    this.setupBloodBankNamespace();
    this.setupDonorNamespace();
    this.setupAdminNamespace();
  }

  private setupHospitalNamespace(): void {
    const hospitalNS = this.io.of('/hospital');

    hospitalNS.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;

      if (user.role !== 'Hospital') {
        socket.disconnect();
        return;
      }

      logger.info(`Hospital user connected: ${user.email}`);

      // Join rooms based on location
      if (user.state) socket.join(`state_${user.state}`);
      if (user.city) socket.join(`city_${user.city}`);
      if (user.locationId) socket.join(`hospital_${user.locationId}`);

      socket.on('error', (error) => {
        logger.error(`Hospital socket error:`, error);
      });
    });
  }

  private setupBloodBankNamespace(): void {
    const bloodBankNS = this.io.of('/blood-bank');

    bloodBankNS.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;

      if (user.role !== 'BloodBank') {
        socket.disconnect();
        return;
      }

      logger.info(`Blood Bank user connected: ${user.email}`);

      // Join rooms based on location
      if (user.state) socket.join(`state_${user.state}`);
      if (user.city) socket.join(`city_${user.city}`);
      if (user.locationId) socket.join(`blood_bank_${user.locationId}`);

      socket.on('error', (error) => {
        logger.error(`Blood Bank socket error:`, error);
      });
    });
  }

  private setupDonorNamespace(): void {
    const donorNS = this.io.of('/donor');

    donorNS.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;

      if (user.role !== 'Donor') {
        socket.disconnect();
        return;
      }

      logger.info(`Donor user connected: ${user.email}`);

      // Join rooms based on location
      if (user.state) socket.join(`state_${user.state}`);
      if (user.city) socket.join(`city_${user.city}`);

      socket.on('error', (error) => {
        logger.error(`Donor socket error:`, error);
      });
    });
  }

  private setupAdminNamespace(): void {
    const adminNS = this.io.of('/admin');

    adminNS.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;

      if (user.role !== 'Admin') {
        socket.disconnect();
        return;
      }

      logger.info(`Admin user connected: ${user.email}`);

      // Admins get all events
      socket.join('admin_all');

      socket.on('error', (error) => {
        logger.error(`Admin socket error:`, error);
      });
    });
  }

  /**
   * Emit event: Emergency request created
   * Notifies hospitals and blood banks in the area
   */
  emitEmergencyRequestCreated(
    bloodGroup: string,
    unitsRequired: number,
    priority: string,
    requesterCity: string,
    requesterState: string,
    requesterName: string,
    emergencyId: string
  ): void {
    const event = {
      type: 'EMERGENCY_REQUEST_CREATED',
      timestamp: new Date(),
      data: {
        emergencyId,
        bloodGroup,
        unitsRequired,
        priority,
        requesterCity,
        requesterState,
        requesterName,
      },
    };

    // Emit to hospitals in the city and state
    this.io.of('/hospital').to(`city_${requesterCity}`).emit('emergency_created', event);
    this.io.of('/hospital').to(`state_${requesterState}`).emit('emergency_created', event);

    // Emit to blood banks in the city and state
    this.io.of('/blood-bank').to(`city_${requesterCity}`).emit('emergency_created', event);
    this.io.of('/blood-bank').to(`state_${requesterState}`).emit('emergency_created', event);

    // Emit to admins
    this.io.of('/admin').to('admin_all').emit('emergency_created', event);

    logger.info(`Emergency request created event emitted: ${emergencyId}`);
  }

  /**
   * Emit event: Emergency request accepted
   * Notifies relevant hospitals and admins
   */
  emitEmergencyRequestAccepted(emergencyId: string, acceptingHospitalName: string): void {
    const event = {
      type: 'EMERGENCY_REQUEST_ACCEPTED',
      timestamp: new Date(),
      data: {
        emergencyId,
        acceptingHospitalName,
      },
    };

    this.io.of('/hospital').emit('emergency_accepted', event);
    this.io.of('/blood-bank').emit('emergency_accepted', event);
    this.io.of('/admin').to('admin_all').emit('emergency_accepted', event);

    logger.info(`Emergency request accepted event emitted: ${emergencyId}`);
  }

  /**
   * Emit event: Emergency request completed
   * Notifies all relevant parties
   */
  emitEmergencyRequestCompleted(emergencyId: string, completionDetails: any): void {
    const event = {
      type: 'EMERGENCY_REQUEST_COMPLETED',
      timestamp: new Date(),
      data: {
        emergencyId,
        completionDetails,
      },
    };

    this.io.of('/hospital').emit('emergency_completed', event);
    this.io.of('/blood-bank').emit('emergency_completed', event);
    this.io.of('/admin').to('admin_all').emit('emergency_completed', event);

    logger.info(`Emergency request completed event emitted: ${emergencyId}`);
  }

  /**
   * Emit event: Blood inventory updated
   * Notifies hospitals/blood banks in the location and admins
   */
  emitBloodInventoryUpdated(
    locationId: string,
    locationType: 'Hospital' | 'BloodBank',
    bloodGroup: string,
    units: number,
    city: string,
    state: string
  ): void {
    const event = {
      type: 'BLOOD_INVENTORY_UPDATED',
      timestamp: new Date(),
      data: {
        locationId,
        locationType,
        bloodGroup,
        units,
        city,
        state,
      },
    };

    const room = locationType === 'Hospital' ? `hospital_${locationId}` : `blood_bank_${locationId}`;

    if (locationType === 'Hospital') {
      this.io.of('/hospital').to(room).emit('inventory_updated', event);
    } else {
      this.io.of('/blood-bank').to(room).emit('inventory_updated', event);
    }

    this.io.of('/hospital').to(`city_${city}`).emit('inventory_updated', event);
    this.io.of('/blood-bank').to(`city_${city}`).emit('inventory_updated', event);
    this.io.of('/admin').to('admin_all').emit('inventory_updated', event);

    logger.info(`Inventory updated event emitted: ${bloodGroup} at ${locationType}`);
  }

  /**
   * Emit event: Blood inventory running low
   * Notifies relevant hospitals/blood banks with shortage alerts
   */
  emitBloodInventoryLow(
    locationId: string,
    locationType: 'Hospital' | 'BloodBank',
    bloodGroup: string,
    currentUnits: number,
    minimumRequired: number,
    city: string,
    state: string
  ): void {
    const event = {
      type: 'BLOOD_INVENTORY_LOW',
      timestamp: new Date(),
      data: {
        locationId,
        locationType,
        bloodGroup,
        currentUnits,
        minimumRequired,
        shortfall: Math.max(0, minimumRequired - currentUnits),
        city,
        state,
      },
    };

    const room = locationType === 'Hospital' ? `hospital_${locationId}` : `blood_bank_${locationId}`;

    if (locationType === 'Hospital') {
      this.io.of('/hospital').to(room).emit('inventory_low', event);
    } else {
      this.io.of('/blood-bank').to(room).emit('inventory_low', event);
    }

    this.io.of('/admin').to('admin_all').emit('inventory_low', event);

    logger.info(`Inventory low alert emitted: ${bloodGroup} at ${locationType}`);
  }

  /**
   * Emit event: New donor becomes available
   * Notifies hospitals and blood banks in the area
   */
  emitNewDonorAvailable(
    donorId: string,
    bloodGroup: string,
    donorName: string,
    city: string,
    state: string
  ): void {
    const event = {
      type: 'NEW_DONOR_AVAILABLE',
      timestamp: new Date(),
      data: {
        donorId,
        bloodGroup,
        donorName,
        city,
        state,
      },
    };

    this.io.of('/hospital').to(`city_${city}`).emit('donor_available', event);
    this.io.of('/hospital').to(`state_${state}`).emit('donor_available', event);
    this.io.of('/blood-bank').to(`city_${city}`).emit('donor_available', event);
    this.io.of('/blood-bank').to(`state_${state}`).emit('donor_available', event);
    this.io.of('/admin').to('admin_all').emit('donor_available', event);

    logger.info(`New donor available event emitted: ${bloodGroup} in ${city}`);
  }

  /**
   * Emit event: Donor availability changes
   * Notifies hospitals/blood banks when donor status changes
   */
  emitDonorAvailabilityChanged(
    donorId: string,
    bloodGroup: string,
    donorName: string,
    newStatus: 'Available' | 'Unavailable',
    city: string,
    state: string
  ): void {
    const event = {
      type: 'DONOR_AVAILABILITY_CHANGED',
      timestamp: new Date(),
      data: {
        donorId,
        bloodGroup,
        donorName,
        newStatus,
        city,
        state,
      },
    };

    this.io.of('/hospital').to(`city_${city}`).emit('donor_status_changed', event);
    this.io.of('/hospital').to(`state_${state}`).emit('donor_status_changed', event);
    this.io.of('/blood-bank').to(`city_${city}`).emit('donor_status_changed', event);
    this.io.of('/blood-bank').to(`state_${state}`).emit('donor_status_changed', event);
    this.io.of('/donor').emit('donor_status_changed', event);
    this.io.of('/admin').to('admin_all').emit('donor_status_changed', event);

    logger.info(`Donor availability changed event emitted: ${donorName} -> ${newStatus}`);
  }

  /**
   * Emit event: New notification created
   * Notifies specific user of new notification
   */
  emitNewNotification(userId: string, notification: any): void {
    const event = {
      type: 'NEW_NOTIFICATION',
      timestamp: new Date(),
      data: notification,
    };

    // Find user's socket(s) and emit
    const userSockets = Array.from(this.connectedUsers.entries())
      .filter(([_, user]) => user.id === userId)
      .map(([socketId, _]) => socketId);

    userSockets.forEach((socketId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('new_notification', event);
      }
    });

    logger.info(`New notification event emitted to user ${userId}`);
  }

  /**
   * Emit event: AI shortage prediction generated
   * Notifies admins and relevant hospitals of predicted shortages
   */
  emitAIShortagePredicition(
    predictions: any[],
    affectedLocations: string[],
    recommendations: any[]
  ): void {
    const event = {
      type: 'AI_SHORTAGE_PREDICTION',
      timestamp: new Date(),
      data: {
        predictions,
        affectedLocations,
        recommendations,
        generatedAt: new Date(),
      },
    };

    // Emit to admins
    this.io.of('/admin').to('admin_all').emit('shortage_prediction', event);

    // Emit to affected hospitals
    affectedLocations.forEach((locationId) => {
      this.io.of('/hospital').to(`hospital_${locationId}`).emit('shortage_prediction', event);
      this.io.of('/blood-bank').to(`blood_bank_${locationId}`).emit('shortage_prediction', event);
    });

    logger.info(`AI shortage prediction event emitted to ${affectedLocations.length} locations`);
  }

  /**
   * Broadcast message to specific room
   */
  broadcastToRoom(namespace: string, room: string, event: string, data: any): void {
    this.io.of(`/${namespace}`).to(room).emit(event, data);
    logger.info(`Broadcast to room ${room} in namespace ${namespace}`);
  }

  /**
   * Send direct message to user
   */
  sendToUser(userId: string, event: string, data: any): void {
    const userSockets = Array.from(this.connectedUsers.entries())
      .filter(([_, user]) => user.id === userId)
      .map(([socketId, _]) => socketId);

    userSockets.forEach((socketId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });

    logger.info(`Direct message sent to user ${userId}`);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users by role
   */
  getConnectedUsersByRole(role: string): string[] {
    return Array.from(this.connectedUsers.values())
      .filter((user) => user.role === role)
      .map((user) => user.email);
  }

  /**
   * Get all connected users
   */
  getAllConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }
}

let socketService: SocketService;

export function initializeSocketService(httpServer: HTTPServer): SocketService {
  socketService = new SocketService(httpServer);
  logger.info('Socket.IO service initialized');
  return socketService;
}

export function getSocketService(): SocketService {
  return socketService;
}
