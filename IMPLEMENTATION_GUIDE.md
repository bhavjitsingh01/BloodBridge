# Backend Implementation Guide

This guide provides step-by-step instructions for implementing the BloodBridge backend according to the architecture defined in `BACKEND_ARCHITECTURE.md`.

## Overview

The backend will be built in phases, starting with core infrastructure and gradually adding features.

## Phase 1: Setup & Configuration (Hours 1-2)

### Step 1.1: Initialize Server Directory

```bash
mkdir -p server
cd server
```

### Step 1.2: Initialize npm Project

```bash
npm init -y
```

Then copy the pre-created `package.json` content.

### Step 1.3: Install Dependencies

```bash
npm install
```

### Step 1.4: Create Configuration Files

- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment template
- `.env.local` - Actual environment (local only, don't commit)
- `jest.config.js` - Testing configuration
- `Dockerfile` - Container configuration

### Step 1.5: Create Directory Structure

```bash
mkdir -p src/{config,types,models,middleware,utils,services,controllers,routes}
mkdir -p __tests__/{unit,integration,fixtures}
```

## Phase 2: Core Utilities (Hours 3-5)

These utilities form the foundation for the entire application.

### Step 2.1: Logger Utility

**File**: `src/utils/logger.ts`

Winston logger configuration with file and console outputs.

```bash
npm install winston
```

### Step 2.2: Error Classes

**File**: `src/utils/errors.ts`

Custom error classes extending Error with HTTP status codes.

```typescript
// Usage in services/controllers:
throw new ValidationError('Invalid email', errors);
throw new NotFoundError('User');
```

### Step 2.3: Response Formatting

**File**: `src/utils/responses.ts`

Standardized API response helpers.

```typescript
// Usage:
sendSuccess(res, data, 'Operation successful', 200);
sendError(res, 'Not found', 404);
```

### Step 2.4: JWT Utilities

**File**: `src/utils/jwt.ts`

```bash
npm install jsonwebtoken @types/jsonwebtoken
```

Token generation and verification functions.

### Step 2.5: Password Hashing

**File**: `src/utils/passwordHash.ts`

```bash
npm install bcrypt @types/bcrypt
```

Password hashing and validation.

### Step 2.6: Geolocation Utilities

**File**: `src/utils/geolocation.ts`

Distance calculation, nearby facility finding.

### Step 2.7: Validators

**File**: `src/utils/validators.ts`

Email, phone, blood group validation functions.

### Step 2.8: Date Utilities

**File**: `src/utils/dateUtils.ts`

Date manipulation and calculation functions.

## Phase 3: Configuration (Hours 6-7)

### Step 3.1: Environment Configuration

**File**: `src/config/environment.ts`

```bash
npm install zod
```

Validates all environment variables on startup using Zod schemas.

### Step 3.2: Constants

**File**: `src/config/constants.ts`

Blood groups, user roles, request statuses, and other enums.

### Step 3.3: Database Configuration

**File**: `src/config/database.ts`

```bash
npm install mongoose
```

MongoDB connection, connection pooling, event handlers.

## Phase 4: Type Definitions (Hours 8-9)

### Step 4.1: Express Types

**File**: `src/types/express.d.ts`

Extend Express Request interface with user object and custom properties.

### Step 4.2: Common Types

**File**: `src/types/common.ts`

Shared types used across the application:
- Pagination types
- Geolocation types
- Address types
- Medical history
- etc.

### Step 4.3: Domain-Specific Types

Create `src/types/*.ts` files for:
- auth.ts
- hospital.ts
- donor.ts
- blood-inventory.ts
- request.ts
- prediction.ts

## Phase 5: MongoDB Models (Hours 10-16)

Each model file should:
1. Define the interface
2. Create the Mongoose schema
3. Add indexes for performance
4. Export the model

### Step 5.1: User Model

**File**: `src/models/User.ts`

```typescript
// Schema with email as unique index, role validation
// Methods: comparePassword(), generateAuthToken()
```

### Step 5.2: Hospital Model

**File**: `src/models/Hospital.ts`

```typescript
// Schema with admin reference, coordinates for geolocation
// Pre-save hooks for validation
```

### Step 5.3: BloodBank Model

**File**: `src/models/BloodBank.ts`

Similar to Hospital but specific to blood banks.

### Step 5.4: Donor Model

**File**: `src/models/Donor.ts`

```typescript
// Reference to User, blood group, eligibility status
// Donation history, medical information
```

### Step 5.5: BloodInventory Model

**File**: `src/models/BloodInventory.ts`

```typescript
// Track blood units by type
// Expiry dates, batch numbers, status tracking
// Indexes on facility and blood group
```

### Step 5.6: BloodRequest Model

**File**: `src/models/BloodRequest.ts`

```typescript
// Request tracking
// Status: pending, fulfilled, rejected, partial
// Links to requesting facility and source
```

### Step 5.7: EmergencyRequest Model

**File**: `src/models/EmergencyRequest.ts`

```typescript
// Time-critical requests
// Sources: hospitals, blood banks, donors
// Priority levels: medium, high, critical
```

### Step 5.8: DonationAppointment Model

**File**: `src/models/DonationAppointment.ts`

```typescript
// Appointment scheduling
// Status: scheduled, confirmed, completed, cancelled
// Health check flag
```

### Step 5.9: AIPrediction Model

**File**: `src/models/AIPrediction.ts`

```typescript
// Prediction results storage
// Types: shortage, demand-forecast, supply-forecast, expiry-risk
// Confidence scores
```

### Step 5.10: Transaction Model

**File**: `src/models/Transaction.ts`

```typescript
// Blood transfer tracking
// Status: requested, approved, in-transit, completed
// Distance and ETA fields
```

### Step 5.11: Notification Model

**File**: `src/models/Notification.ts`

```typescript
// Notification records
// Types: blood-needed, emergency, alerts, reminders
// Read status tracking
```

## Phase 6: Middleware (Hours 17-19)

Middleware functions that process requests before they reach controllers.

### Step 6.1: Authentication Middleware

**File**: `src/middleware/auth.ts`

```typescript
// Verify JWT token from Authorization header
// Extract user and attach to req.user
// Return 401 if token is missing or invalid
```

### Step 6.2: Authorization Middleware

**File**: `src/middleware/authorize.ts`

```typescript
// Check user role against required roles
// Return 403 if user doesn't have permission
// Usage: authorize('hospital', 'blood-bank')
```

### Step 6.3: Validation Middleware

**File**: `src/middleware/validation.ts`

```bash
npm install zod
```

```typescript
// Validate request body/query against Zod schemas
// Return 400 with validation errors if invalid
```

### Step 6.4: Error Handler Middleware

**File**: `src/middleware/errorHandler.ts`

```typescript
// Catch all errors thrown in async handlers
// Log errors appropriately
// Return standardized error response
// Must be registered last
```

### Step 6.5: Logger Middleware

**File**: `src/middleware/logger.ts`

```typescript
// Log incoming requests
// Log response status and duration
// Log errors
```

### Step 6.6: CORS Configuration

**File**: `src/middleware/corsConfig.ts`

```bash
npm install cors @types/cors
```

```typescript
// Allow requests only from FRONTEND_URL
// Allow credentials (cookies)
// Allow necessary headers
```

### Step 6.7: Request Parser

**File**: `src/middleware/requestParser.ts`

```typescript
// Parse JSON request bodies
// Parse URL-encoded bodies
// Set size limits
```

## Phase 7: Services (Hours 20-30)

Business logic layer - pure logic without Express dependencies.

### Step 7.1: Auth Service

**File**: `src/services/auth.service.ts`

```typescript
async register(email, password, role): Promise<User>
async login(email, password): Promise<{user, accessToken, refreshToken}>
async refreshToken(refreshToken): Promise<{accessToken}>
async logout(userId): Promise<void>
```

### Step 7.2: User Service

**File**: `src/services/user.service.ts`

```typescript
async getUserById(userId)
async updateUser(userId, data)
async deleteUser(userId)
async getUsersByRole(role)
async verifyFacility(facilityId) // Admin only
```

### Step 7.3: Hospital Service

**File**: `src/services/hospital.service.ts`

```typescript
async createHospital(data)
async getHospital(hospitalId)
async updateHospital(hospitalId, data)
async getNearbyHospitals(coordinates, radiusKm)
async getNearbyBloodBanks(coordinates, radiusKm)
```

### Step 7.4: Blood Bank Service

**File**: `src/services/blood-bank.service.ts`

```typescript
async createBloodBank(data)
async getBloodBank(bankId)
async updateBloodBank(bankId, data)
async getNearbyBloodBanks(coordinates, radiusKm)
```

### Step 7.5: Donor Service

**File**: `src/services/donor.service.ts`

```typescript
async getDonorProfile(donorId)
async updateAvailabilityStatus(donorId, status)
async checkEligibility(donorId): Promise<eligibilityStatus>
async recordDonation(donorId, facilityId, unitsCollected)
async getDonationHistory(donorId)
async getNearbyDonors(coordinates, bloodGroup, radiusKm)
```

### Step 7.6: Blood Inventory Service

**File**: `src/services/blood-inventory.service.ts`

```typescript
async addBlood(facilityId, bloodGroup, units, expiryDate)
async getInventory(facilityId)
async updateInventory(inventoryId, quantity)
async getExpiringBlood(days): Promise<blood[]>
async getLowStockAlerts()
async transferBlood(fromFacility, toFacility, bloodGroup, units)
```

### Step 7.7: Blood Request Service

**File**: `src/services/blood-request.service.ts`

```typescript
async createRequest(facilityId, bloodGroup, units, reason)
async getRequest(requestId)
async updateRequestStatus(requestId, status)
async fulfillRequest(requestId, sourceId, units)
async getRequestsByFacility(facilityId)
async getRequestsByStatus(status)
```

### Step 7.8: Emergency Request Service

**File**: `src/services/emergency-request.service.ts`

```typescript
async createEmergency(hospitalId, bloodGroup, units, patientInfo)
async getEmergency(emergencyId)
async updateEmergencyStatus(emergencyId, status)
async findMatchingSources(emergencyId): Promise<matches[]>
async resolveEmergency(emergencyId, sourceId)
async getActiveEmergencies()
```

### Step 7.9: Donation Appointment Service

**File**: `src/services/donation-appointment.service.ts`

```typescript
async bookAppointment(donorId, facilityId, date, time)
async getAppointments(donorId)
async updateAppointment(appointmentId, date, time)
async cancelAppointment(appointmentId)
async completeAppointment(appointmentId)
async getScheduleAvailability(facilityId, date)
```

### Step 7.10: Prediction Service

**File**: `src/services/prediction.service.ts`

```typescript
async getBloodShortagePredictions()
async getDemandForecast(bloodGroup, facilityId?)
async getSupplyForecast(bloodGroup, facilityId?)
async getExpiryRiskAnalysis()
async getPredictionAccuracy()
```

### Step 7.11: Redistribution Service

**File**: `src/services/redistribution.service.ts`

```typescript
async getTransferRecommendations(): Promise<recommendations[]>
async recommendTransfer(fromFacility, toFacility, bloodGroup)
async optimizeBloodDistribution(): Promise<plan>
```

### Step 7.12: Notification Service

**File**: `src/services/notification.service.ts`

```typescript
async createNotification(userId, type, message, metadata)
async sendBloodNeededNotification(bloodGroup, facilityId)
async sendEmergencyNotification(emergencyRequest)
async markAsRead(notificationId)
async getUnreadNotifications(userId)
```

### Step 7.13: Analytics Service

**File**: `src/services/analytics.service.ts`

```typescript
async getDashboardStats()
async getBloodSupplyMap()
async getBloodDemandMap()
async getHospitalAnalytics(hospitalId)
async getDonationTrends(period)
async getExpiryStatistics()
```

## Phase 8: Controllers (Hours 31-40)

Handle HTTP requests and call services.

### Step 8.1: Auth Controller

**File**: `src/controllers/auth.controller.ts`

```typescript
export async function register(req, res, next)
export async function login(req, res, next)
export async function refreshToken(req, res, next)
export async function logout(req, res, next)
export async function verifyEmail(req, res, next)
export async function forgotPassword(req, res, next)
export async function resetPassword(req, res, next)
```

### Step 8.2: User Controller

**File**: `src/controllers/user.controller.ts`

```typescript
export async function getAllUsers(req, res, next)
export async function getUser(req, res, next)
export async function updateUser(req, res, next)
export async function deleteUser(req, res, next)
```

### Step 8.3: Hospital Controller

**File**: `src/controllers/hospital.controller.ts`

```typescript
export async function getAllHospitals(req, res, next)
export async function getHospital(req, res, next)
export async function createHospital(req, res, next)
export async function updateHospital(req, res, next)
export async function getInventory(req, res, next)
export async function getNearby(req, res, next)
```

### Step 8.4: Blood Bank Controller

**File**: `src/controllers/blood-bank.controller.ts`

Similar to Hospital controller but for blood banks.

### Step 8.5: Donor Controller

**File**: `src/controllers/donor.controller.ts`

```typescript
export async function getDonorProfile(req, res, next)
export async function updateDonor(req, res, next)
export async function updateAvailability(req, res, next)
export async function getDonationHistory(req, res, next)
export async function checkEligibility(req, res, next)
```

### Step 8.6: Blood Inventory Controller

**File**: `src/controllers/blood-inventory.controller.ts`

```typescript
export async function getAllInventory(req, res, next)
export async function getInventory(req, res, next)
export async function addBlood(req, res, next)
export async function updateInventory(req, res, next)
export async function getExpiringBlood(req, res, next)
export async function transferBlood(req, res, next)
```

### Step 8.7: Blood Request Controller

**File**: `src/controllers/blood-request.controller.ts`

```typescript
export async function getAllRequests(req, res, next)
export async function getRequest(req, res, next)
export async function createRequest(req, res, next)
export async function updateStatus(req, res, next)
export async function fulfillRequest(req, res, next)
```

### Step 8.8: Emergency Controller

**File**: `src/controllers/emergency.controller.ts`

```typescript
export async function createEmergency(req, res, next)
export async function getEmergency(req, res, next)
export async function updateEmergency(req, res, next)
export async function findMatches(req, res, next)
export async function resolveEmergency(req, res, next)
export async function getActiveEmergencies(req, res, next)
```

### Step 8.9: Appointment Controller

**File**: `src/controllers/appointment.controller.ts`

```typescript
export async function bookAppointment(req, res, next)
export async function getAppointments(req, res, next)
export async function updateAppointment(req, res, next)
export async function cancelAppointment(req, res, next)
export async function completeAppointment(req, res, next)
```

### Step 8.10: Prediction Controller

**File**: `src/controllers/prediction.controller.ts`

```typescript
export async function getShortageRisk(req, res, next)
export async function getDemandForecast(req, res, next)
export async function getSupplyForecast(req, res, next)
export async function getExpiryRisk(req, res, next)
export async function getRedistribution(req, res, next)
```

### Step 8.11: Analytics Controller

**File**: `src/controllers/analytics.controller.ts`

```typescript
export async function getDashboard(req, res, next)
export async function getSupplyMap(req, res, next)
export async function getDemandMap(req, res, next)
export async function getHospitalAnalytics(req, res, next)
export async function getDonationTrends(req, res, next)
```

### Step 8.12: Admin Controller

**File**: `src/controllers/admin.controller.ts`

```typescript
export async function getUsers(req, res, next)
export async function getPendingVerifications(req, res, next)
export async function verifyFacility(req, res, next)
export async function rejectFacility(req, res, next)
export async function getSystemAnalytics(req, res, next)
```

## Phase 9: Routes (Hours 41-45)

Define API endpoints and wire up controllers.

### Step 9.1: Create Route Files

For each feature:
- `auth.routes.ts`
- `users.routes.ts`
- `hospitals.routes.ts`
- `blood-banks.routes.ts`
- `donors.routes.ts`
- `blood-inventory.routes.ts`
- `blood-requests.routes.ts`
- `emergency-requests.routes.ts`
- `appointments.routes.ts`
- `predictions.routes.ts`
- `analytics.routes.ts`
- `admin.routes.ts`

Example:

```typescript
// src/routes/auth.routes.ts
import { Router } from 'express';
import * as authController from '@controllers/auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', verifyJWT, authController.logout);

export default router;
```

### Step 9.2: Create Route Aggregator

**File**: `src/routes/index.ts`

```typescript
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import hospitalRoutes from './hospitals.routes';
// ... import other routes

export function registerRoutes(app: Express) {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/hospitals', hospitalRoutes);
  // ... register other routes
}
```

## Phase 10: Express App Setup (Hours 46-47)

### Step 10.1: Create Express App

**File**: `src/app.ts`

```typescript
import express from 'express';
import 'express-async-errors'; // Handle async errors
import { registerRoutes } from '@routes';
import { errorHandler } from '@middleware/errorHandler';
import { corsConfig } from '@middleware/corsConfig';
// ... import other middleware

export function createApp(): Express {
  const app = express();

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // CORS
  app.use(corsConfig);

  // Request logging
  app.use(requestLogger);

  // Health check endpoint
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // Register routes
  registerRoutes(app);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: 'Endpoint not found',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
```

### Step 10.2: Create Server Entry Point

**File**: `src/server.ts`

```typescript
import env from '@config/environment';
import { connectDatabase } from '@config/database';
import { createApp } from './app';
import logger from '@utils/logger';

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('Database connected');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

## Phase 11: Testing (Hours 48-52)

### Step 11.1: Unit Tests

Create `__tests__/unit/` directory with tests for:
- Services
- Utilities
- Models

Example:

```typescript
// __tests__/unit/utils/geolocation.test.ts
import { calculateDistance } from '@utils/geolocation';

describe('Geolocation Utils', () => {
  it('should calculate distance correctly', () => {
    const distance = calculateDistance(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 }
    );
    expect(distance).toBeGreaterThan(111);
    expect(distance).toBeLessThan(112);
  });
});
```

### Step 11.2: Integration Tests

Create `__tests__/integration/` directory with tests for:
- API endpoints
- Database operations
- Authentication flows

Example:

```typescript
// __tests__/integration/auth.integration.test.ts
import request from 'supertest';
import { createApp } from '@/app';

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(createApp())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'donor',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

### Step 11.3: Test Fixtures

**File**: `__tests__/fixtures/sample-data.ts`

```typescript
export const testUser = {
  email: 'test@example.com',
  password: 'Password123!',
};

export const testHospital = {
  name: 'City Hospital',
  licenseNumber: 'LIC-123456',
  email: 'hospital@example.com',
};

// ... more test data
```

## Phase 12: Documentation (Hours 53-54)

### Step 12.1: API Documentation

Create comprehensive API documentation in Postman or Swagger format.

### Step 12.2: Code Comments

Add JSDoc comments to all public functions.

```typescript
/**
 * Create a new blood request
 * @param facilityId - ID of requesting facility
 * @param bloodGroup - Blood group needed
 * @param units - Number of units needed
 * @returns Created request document
 */
async function createRequest(facilityId: string, bloodGroup: string, units: number) {
  // ...
}
```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Code Quality Checks

```bash
npm run lint
npm run format
npm run typecheck
```

## Common Issues & Solutions

### Issue: MongoDB Connection Fails
- Check `MONGODB_URI` in `.env.local`
- Ensure MongoDB server is running
- Verify network access in MongoDB Atlas (IP whitelist)

### Issue: JWT Token Errors
- Check `JWT_SECRET` length (minimum 32 characters)
- Verify token format in Authorization header (Bearer <token>)

### Issue: CORS Errors
- Check `FRONTEND_URL` matches your frontend URL
- Verify credentials are enabled in CORS config

### Issue: Tests Fail
- Ensure MongoDB is running (or use in-memory MongoDB for tests)
- Clear `.env` variables that might interfere with tests
- Use `--forceExit` flag in jest config if needed

## Performance Optimization Checklist

- [ ] Add database indexes
- [ ] Implement pagination for list endpoints
- [ ] Use lean queries for read-only operations
- [ ] Add caching for frequently accessed data
- [ ] Implement rate limiting
- [ ] Add request timeouts
- [ ] Use connection pooling
- [ ] Monitor database query performance

## Security Checklist

- [ ] Validate all user inputs
- [ ] Hash passwords with bcrypt
- [ ] Implement CORS properly
- [ ] Set secure JWT secrets
- [ ] Add HTTPS in production
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Add audit logging

## Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure all environment variables
- [ ] Run tests before deployment
- [ ] Build application
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Enable HTTPS/SSL
- [ ] Set up auto-scaling
- [ ] Test failover scenarios
- [ ] Document deployment process
