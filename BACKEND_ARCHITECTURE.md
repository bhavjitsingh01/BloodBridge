# BloodBridge Backend Architecture

## Executive Summary

This document outlines the complete backend architecture for BloodBridge, an AI-powered blood management ecosystem. The backend uses **Express.js with TypeScript**, **MongoDB**, and **JWT authentication** to support real-time blood inventory management, AI-driven predictions, and intelligent coordination across hospitals and blood banks.

---

## Technology Stack

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Express.js | ^4.18 | Lightweight, well-tested, excellent ecosystem |
| **Language** | TypeScript | ^5.0 | Type safety, better IDE support, fewer runtime errors |
| **Database** | MongoDB | Atlas (Cloud) | NoSQL flexibility for complex blood inventory structures |
| **ODM** | Mongoose | ^7.0 | Type-safe schema validation, middleware support |
| **Authentication** | JWT | - | Stateless, scalable token-based auth |
| **Validation** | Zod | ^3.22 | Runtime validation with TypeScript inference |
| **Middleware** | Express Middleware | - | Role-based access control, error handling, logging |
| **Environment** | dotenv | ^16.3 | Secure environment variable management |
| **CORS** | cors | ^2.8 | Enable cross-origin requests from Next.js frontend |
| **Logging** | Winston | ^3.10 | Structured logging for debugging and monitoring |
| **Testing** | Jest + Supertest | ^29 | Unit and integration tests |

---

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts           # MongoDB connection
│   │   ├── environment.ts        # Environment variables validation
│   │   └── constants.ts          # Global constants (blood groups, roles, etc)
│   │
│   ├── types/
│   │   ├── express.d.ts         # Extended Express types (Auth user)
│   │   ├── common.ts            # Shared interfaces (Coordinates, Response, etc)
│   │   ├── auth.ts              # Auth-related types (JwtPayload, etc)
│   │   ├── hospital.ts          # Hospital-related types
│   │   ├── donor.ts             # Donor-related types
│   │   ├── blood-inventory.ts   # Blood inventory types
│   │   ├── request.ts           # Blood request types
│   │   └── prediction.ts        # AI prediction types
│   │
│   ├── models/
│   │   ├── User.ts              # User schema (base for all roles)
│   │   ├── Hospital.ts          # Hospital schema
│   │   ├── BloodBank.ts         # Blood bank schema
│   │   ├── Donor.ts             # Donor profile schema
│   │   ├── BloodInventory.ts    # Blood inventory schema
│   │   ├── BloodRequest.ts      # Blood request schema
│   │   ├── EmergencyRequest.ts  # Emergency request schema
│   │   ├── DonationAppointment.ts # Donation appointment
│   │   ├── AIPrediction.ts      # AI prediction results
│   │   ├── Transaction.ts       # Blood transfer transactions
│   │   └── Notification.ts      # Notification logs
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── authorize.ts         # Role-based access control
│   │   ├── validation.ts        # Zod schema validation
│   │   ├── errorHandler.ts      # Centralized error handling
│   │   ├── logger.ts            # Request/response logging
│   │   ├── corsConfig.ts        # CORS configuration
│   │   └── requestParser.ts     # Body parser configuration
│   │
│   ├── utils/
│   │   ├── errors.ts            # Custom error classes
│   │   ├── responses.ts         # Standard response formatting
│   │   ├── jwt.ts               # JWT token generation/verification
│   │   ├── passwordHash.ts      # Password hashing (bcrypt)
│   │   ├── validators.ts        # Common validation helpers
│   │   ├── geolocation.ts       # Distance calculation, nearby facilities
│   │   ├── dateUtils.ts         # Date calculations (expiry, etc)
│   │   └── notification.ts      # Notification service helpers
│   │
│   ├── services/
│   │   ├── auth.service.ts      # Auth business logic
│   │   ├── user.service.ts      # User CRUD and profile management
│   │   ├── hospital.service.ts  # Hospital operations
│   │   ├── blood-bank.service.ts # Blood bank operations
│   │   ├── donor.service.ts     # Donor profile and availability
│   │   ├── blood-inventory.service.ts # Blood tracking and management
│   │   ├── blood-request.service.ts # Blood request handling
│   │   ├── emergency-request.service.ts # Emergency coordination
│   │   ├── donation-appointment.service.ts # Appointment booking
│   │   ├── prediction.service.ts # AI prediction integration
│   │   ├── redistribution.service.ts # Intelligent transfer recommendations
│   │   ├── notification.service.ts # Notification dispatch
│   │   └── analytics.service.ts # Dashboard statistics
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts   # Auth endpoints
│   │   ├── user.controller.ts   # User management
│   │   ├── hospital.controller.ts # Hospital operations
│   │   ├── blood-bank.controller.ts # Blood bank operations
│   │   ├── donor.controller.ts  # Donor portal
│   │   ├── blood-inventory.controller.ts # Inventory management
│   │   ├── blood-request.controller.ts # Request handling
│   │   ├── emergency.controller.ts # Emergency responses
│   │   ├── appointment.controller.ts # Appointment management
│   │   ├── prediction.controller.ts # AI predictions
│   │   ├── redistribution.controller.ts # Transfer recommendations
│   │   ├── analytics.controller.ts # Dashboard data
│   │   └── admin.controller.ts  # Admin operations
│   │
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── auth.routes.ts       # /api/auth/*
│   │   ├── users.routes.ts      # /api/users/*
│   │   ├── hospitals.routes.ts  # /api/hospitals/*
│   │   ├── blood-banks.routes.ts # /api/blood-banks/*
│   │   ├── donors.routes.ts     # /api/donors/*
│   │   ├── blood-inventory.routes.ts # /api/blood-inventory/*
│   │   ├── blood-requests.routes.ts # /api/blood-requests/*
│   │   ├── emergency-requests.routes.ts # /api/emergency-requests/*
│   │   ├── appointments.routes.ts # /api/appointments/*
│   │   ├── predictions.routes.ts # /api/predictions/*
│   │   ├── admin.routes.ts      # /api/admin/*
│   │   └── analytics.routes.ts  # /api/analytics/*
│   │
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
│
├── .env.example
├── .env.local
├── tsconfig.json
├── jest.config.js
├── package.json
└── README.md
```

---

## API Endpoints Design

### 1. Authentication Endpoints

**Base URL**: `/api/auth`

```
POST   /register           - Register new user (donor/hospital/blood-bank)
POST   /login              - Login with email/password
POST   /refresh-token      - Refresh JWT access token
POST   /logout             - Invalidate refresh token
POST   /verify-email       - Email verification
POST   /forgot-password    - Send password reset link
POST   /reset-password     - Reset password with token
GET    /me                 - Get current user profile
```

### 2. User Management Endpoints

**Base URL**: `/api/users`

```
GET    /                   - List all users (Admin only)
GET    /:userId            - Get user details
PUT    /:userId            - Update user profile
DELETE /:userId            - Delete user account (Admin only)
GET    /verify-hospital    - Hospital verification endpoint (Admin)
GET    /verify-blood-bank  - Blood bank verification (Admin)
```

### 3. Hospital Management Endpoints

**Base URL**: `/api/hospitals`

```
GET    /                   - List all hospitals
GET    /:hospitalId        - Get hospital details
POST   /                   - Create hospital (Hospital admin)
PUT    /:hospitalId        - Update hospital info
GET    /:hospitalId/inventory - Get hospital blood inventory
GET    /:hospitalId/nearby - Find nearby hospitals/blood banks
GET    /:hospitalId/requests - Get pending blood requests
POST   /:hospitalId/accept-transfer - Accept blood transfer
```

### 4. Blood Bank Management Endpoints

**Base URL**: `/api/blood-banks`

```
GET    /                   - List all blood banks
GET    /:bankId            - Get blood bank details
POST   /                   - Create blood bank (Blood bank admin)
PUT    /:bankId            - Update blood bank info
GET    /:bankId/inventory  - Get inventory
GET    /:bankId/expiring   - Get expiring blood
POST   /:bankId/process-transfer - Process incoming transfer
```

### 5. Donor Portal Endpoints

**Base URL**: `/api/donors`

```
GET    /                   - Get current donor profile
POST   /register           - Donor registration
PUT    /:donorId           - Update donor profile
PUT    /:donorId/availability - Update availability status
GET    /:donorId/history   - Donation history
GET    /:donorId/eligibility - Check eligibility
GET    /nearby-centers     - Find nearby donation centers
POST   /eligible-for-blood-group/:bloodGroup - Check if eligible
```

### 6. Blood Inventory Endpoints

**Base URL**: `/api/blood-inventory`

```
GET    /                   - Get all inventory records
GET    /:facilityId/stock  - Get facility blood stock
POST   /                   - Add blood units
PUT    /:inventoryId       - Update blood inventory
DELETE /:inventoryId       - Remove blood units
GET    /expiring-soon      - Get blood expiring within N days
POST   /:inventoryId/transfer - Transfer blood between facilities
```

### 7. Blood Request Endpoints

**Base URL**: `/api/blood-requests`

```
GET    /                   - List all requests
POST   /                   - Create blood request
GET    /:requestId         - Get request details
PUT    /:requestId/status  - Update request status (pending/fulfilled/rejected)
GET    /facility/:facilityId - Get facility requests
POST   /:requestId/fulfill - Mark request as fulfilled
```

### 8. Emergency Request Endpoints

**Base URL**: `/api/emergency-requests`

```
POST   /                   - Create emergency request
GET    /                   - List emergency requests
GET    /:emergencyId       - Get emergency details
PUT    /:emergencyId/status - Update emergency status
GET    /:emergencyId/matches - Find matching donors/facilities
POST   /:emergencyId/resolve - Resolve emergency request
GET    /active             - Get currently active emergencies
```

### 9. Donation Appointment Endpoints

**Base URL**: `/api/appointments`

```
POST   /                   - Book donation appointment
GET    /:donorId           - Get donor appointments
GET    /:facilityId/schedule - Get facility schedule
PUT    /:appointmentId     - Reschedule appointment
DELETE /:appointmentId     - Cancel appointment
POST   /:appointmentId/confirm - Confirm appointment
POST   /:appointmentId/complete - Mark donation complete
```

### 10. AI Prediction Endpoints

**Base URL**: `/api/predictions`

```
GET    /blood-shortage     - Get blood shortage predictions
GET    /demand-forecast    - Get demand forecast
GET    /supply-forecast    - Get supply forecast
GET    /expiry-risk        - Get expiry risk analysis
GET    /hospital/:id/forecast - Hospital-specific forecast
GET    /redistribution     - Get redistribution recommendations
GET    /donor-matching/:emergencyId - Get eligible donor matches
GET    /accuracy           - Get prediction accuracy metrics
```

### 11. Analytics & Dashboard Endpoints

**Base URL**: `/api/analytics`

```
GET    /dashboard          - System-wide statistics
GET    /blood-supply-map   - City blood availability heatmap
GET    /demand-map         - City blood demand heatmap
GET    /hospital/:id       - Hospital-specific analytics
GET    /blood-bank/:id     - Blood bank analytics
GET    /donation-trends    - Donation history trends
GET    /expiry-statistics  - Blood expiry statistics
GET    /transfer-history   - Blood transfer trends
```

### 12. Admin Endpoints

**Base URL**: `/api/admin`

```
GET    /users              - Manage all users
GET    /verify-pending     - Pending hospital/bank verifications
POST   /verify-facility    - Approve facility verification
DELETE /verify-facility/:id - Reject facility verification
GET    /analytics          - System-wide analytics
GET    /logs               - System logs
PUT    /settings           - Update system settings
```

---

## MongoDB/Mongoose Data Models

### User Schema

```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  password: string; // hashed
  phone: string;
  role: 'donor' | 'hospital' | 'blood-bank' | 'admin';
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  verified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Hospital Schema

```typescript
interface IHospital {
  _id: ObjectId;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { latitude: number; longitude: number };
  };
  registrationNumber: string;
  adminUser: ObjectId; // Reference to User
  verified: boolean;
  verifiedAt: Date;
  bloodInventory: ObjectId[]; // References to BloodInventory
  bloodRequests: ObjectId[]; // References to BloodRequest
  emergencyRequests: ObjectId[];
  emergencyCapabilities: {
    canFulfillEmergencies: boolean;
    maxEmergencyUnitsPerDay: number;
  };
  operatingHours: {
    open: string; // "08:00"
    close: string; // "22:00"
    daysOpen: number[]; // 0-6 (Sunday-Saturday)
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### BloodBank Schema

```typescript
interface IBloodBank {
  _id: ObjectId;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { latitude: number; longitude: number };
  };
  registrationNumber: string;
  adminUser: ObjectId; // Reference to User
  verified: boolean;
  verifiedAt: Date;
  bloodInventory: ObjectId[]; // References to BloodInventory
  collectionCount: number;
  distributionCount: number;
  operatingHours: {
    open: string;
    close: string;
    daysOpen: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Donor Schema

```typescript
interface IDonor {
  _id: ObjectId;
  user: ObjectId; // Reference to User
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  lastDonationDate: Date;
  eligibilityStatus: 'eligible' | 'ineligible' | 'pending';
  availabilityStatus: 'available' | 'busy' | 'not-available';
  donationHistory: {
    date: Date;
    location: ObjectId; // Hospital or BloodBank
    unitsCollected: number;
    healthStatus: string;
  }[];
  medicalHistory: {
    hasChronicDisease: boolean;
    diseaseDetails: string;
    lastMedicalCheckup: Date;
    bloodPressure: string;
    hemoglobin: number;
  };
  eligibilityCheckDate: Date;
  preferredDonationCenters: ObjectId[];
  notifications: ObjectId[]; // References to Notification
  totalDonations: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### BloodInventory Schema

```typescript
interface IBloodInventory {
  _id: ObjectId;
  facility: ObjectId; // Hospital or BloodBank
  bloodGroup: string;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  units: {
    batchNumber: string;
    collectionDate: Date;
    expiryDate: Date;
    quantity: number;
    status: 'available' | 'reserved' | 'transferred' | 'expired';
  }[];
  lastUpdated: Date;
  criticalLevel: number; // Alert when below this
  lowLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### BloodRequest Schema

```typescript
interface IBloodRequest {
  _id: ObjectId;
  requestingFacility: ObjectId; // Hospital
  bloodGroup: string;
  unitsRequired: number;
  unitsReceived: number;
  priority: 'normal' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'fulfilled' | 'rejected' | 'partial';
  requestReason: string;
  patientInfo: {
    age: number;
    bloodGroup: string;
    condition: string;
  };
  requiredBy: Date;
  sourceHospital: ObjectId; // Fulfilled from where
  createdAt: Date;
  fulfilledAt: Date;
  updatedAt: Date;
}
```

### EmergencyRequest Schema

```typescript
interface IEmergencyRequest {
  _id: ObjectId;
  hospital: ObjectId;
  bloodGroup: string;
  unitsNeeded: number;
  priority: 'critical' | 'high' | 'medium';
  patientInfo: {
    age: number;
    bloodGroup: string;
    condition: string;
    reason: string;
  };
  status: 'active' | 'fulfilled' | 'cancelled';
  sources: {
    hospitals: ObjectId[];
    bloodBanks: ObjectId[];
    eligibleDonors: ObjectId[];
  };
  estimates: {
    fastestSource: {
      facility: ObjectId;
      eta: number; // minutes
      distance: number; // km
    };
    recommendedRoute: {
      from: ObjectId;
      to: ObjectId;
      distance: number;
      eta: number;
    };
  };
  createdAt: Date;
  resolvedAt: Date;
  updatedAt: Date;
}
```

### DonationAppointment Schema

```typescript
interface IDonationAppointment {
  _id: ObjectId;
  donor: ObjectId;
  facility: ObjectId; // Hospital or BloodBank
  appointmentDate: Date;
  appointmentTime: string; // "14:30"
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  bloodGroup: string;
  unitsToCollect: number;
  healthCheckCompleted: boolean;
  donationCompleted: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### AIPrediction Schema

```typescript
interface IAIPrediction {
  _id: ObjectId;
  predictionType: 'shortage' | 'demand-forecast' | 'supply-forecast' | 'expiry-risk';
  facility: ObjectId; // Optional - for facility-specific predictions
  bloodGroup: string;
  prediction: {
    currentLevel: number;
    predictedLevel: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    forecast: {
      timeframe: string; // "next-7-days", "next-14-days", "next-30-days"
      estimatedDemand: number;
      estimatedSupply: number;
      shortage: number;
    };
  };
  confidence: number; // 0-100%
  factors: {
    historicalUsage: number;
    seasonalTrends: string;
    upcomingEvents: string;
    currentInventory: number;
    recentTransactions: number;
  };
  recommendations: string[];
  generatedAt: Date;
  validUntil: Date;
  updatedAt: Date;
}
```

### Transaction Schema

```typescript
interface ITransaction {
  _id: ObjectId;
  type: 'transfer' | 'collection' | 'usage' | 'expiry' | 'wastage';
  fromFacility: ObjectId;
  toFacility: ObjectId;
  bloodGroup: string;
  units: number;
  batchNumbers: string[];
  status: 'requested' | 'approved' | 'in-transit' | 'completed' | 'cancelled';
  distance: number; // km
  estimatedTime: number; // minutes
  actualTime: number;
  reason: string;
  requestedBy: ObjectId; // User
  approvedBy: ObjectId; // User
  createdAt: Date;
  completedAt: Date;
  updatedAt: Date;
}
```

### Notification Schema

```typescript
interface INotification {
  _id: ObjectId;
  recipient: ObjectId; // User
  type: 'blood-needed' | 'emergency' | 'low-stock' | 'expiry-alert' | 'transfer-request' | 'appointment-reminder';
  title: string;
  message: string;
  facility: ObjectId; // Related facility
  bloodGroup: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  read: boolean;
  actionUrl: string;
  metadata: Record<string, any>;
  sentAt: Date;
  readAt: Date;
  createdAt: Date;
}
```

---

## Middleware Stack

### 1. Authentication Middleware

**Location**: `src/middleware/auth.ts`

Verifies JWT token and attaches user to request object.

```typescript
// Validates token and sets req.user
middleware: verifyJWT
```

### 2. Authorization Middleware

**Location**: `src/middleware/authorize.ts`

Role-based access control.

```typescript
// Checks if user has required role
authorize('hospital', 'blood-bank') // Only hospitals and blood banks
```

### 3. Validation Middleware

**Location**: `src/middleware/validation.ts`

Validates request body/params against Zod schemas.

```typescript
// Validates request against Zod schema
validateRequest(CreateBloodRequestSchema)
```

### 4. Error Handler Middleware

**Location**: `src/middleware/errorHandler.ts`

Centralized error handling with proper HTTP status codes.

```typescript
// Catches all errors and returns standardized response
errorHandler(err, req, res, next)
```

### 5. CORS Middleware

**Location**: `src/middleware/corsConfig.ts`

Enables cross-origin requests from Next.js frontend.

```typescript
// Allow requests from http://localhost:3000 and production domain
corsConfig = {
  origin: [process.env.FRONTEND_URL],
  credentials: true
}
```

### 6. Request Logging Middleware

**Location**: `src/middleware/logger.ts`

Logs all incoming requests and responses.

```typescript
// Log request method, path, status, duration
requestLogger(req, res, next)
```

### 7. Request Parser Middleware

**Location**: `src/middleware/requestParser.ts`

Parses JSON and URL-encoded bodies.

```typescript
// Express body parser
express.json({ limit: '10mb' })
express.urlencoded({ limit: '10mb', extended: true })
```

---

## Custom Error Classes

**Location**: `src/utils/errors.ts`

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Specific error classes
class ValidationError extends AppError { }      // 400
class AuthenticationError extends AppError { }  // 401
class AuthorizationError extends AppError { }   // 403
class NotFoundError extends AppError { }        // 404
class ConflictError extends AppError { }        // 409
class InternalServerError extends AppError { }  // 500
```

---

## File Generation Priority & Implementation Order

### Phase 1: Foundation & Configuration

1. **`server/package.json`**
   - Dependencies: express, mongoose, typescript, zod, jwt, bcrypt, cors, dotenv
   - DevDependencies: @types/express, @types/node, ts-node, jest, supertest

2. **`server/tsconfig.json`**
   - Strict mode enabled
   - Target: ES2020
   - Module: commonjs
   - Resolves: src/** paths

3. **`server/.env.example`**
   - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bloodbridge
   - JWT_SECRET=your-secret-key
   - JWT_EXPIRE=24h
   - NODE_ENV=development
   - FRONTEND_URL=http://localhost:3000

4. **`server/src/config/environment.ts`**
   - Zod schema for environment validation
   - Validates all required env vars on startup

5. **`server/src/config/constants.ts`**
   - Blood groups, roles, request statuses
   - Time constants for expiry, predictions
   - Default inventory levels

### Phase 2: Type Definitions

6. **`server/src/types/common.ts`**
   - Standard response types
   - Pagination types
   - Geolocation types

7. **`server/src/types/express.d.ts`**
   - Extend Express Request with user object
   - Add custom properties for auth

8. **`server/src/types/*.ts`** (One for each domain)
   - Hospital, Donor, BloodInventory, Request types
   - Match MongoDB schemas

### Phase 3: Database & Models

9. **`server/src/config/database.ts`**
   - MongoDB connection setup
   - Connection pooling
   - Error handling

10. **`server/src/models/*.ts`** (All 11 models)
    - User, Hospital, BloodBank, Donor
    - BloodInventory, BloodRequest, EmergencyRequest
    - DonationAppointment, AIPrediction, Transaction, Notification
    - Include indexes for performance

### Phase 4: Utilities & Helpers

11. **`server/src/utils/errors.ts`**
    - Custom error classes
    - Error handling logic

12. **`server/src/utils/responses.ts`**
    - Standard response formatting
    - Success/error response builders

13. **`server/src/utils/jwt.ts`**
    - Token generation
    - Token verification
    - Refresh token logic

14. **`server/src/utils/passwordHash.ts`**
    - bcrypt hashing
    - Password comparison

15. **`server/src/utils/validators.ts`**
    - Common validation functions
    - Email, phone, blood group validators

16. **`server/src/utils/geolocation.ts`**
    - Distance calculation (Haversine formula)
    - Find nearby facilities
    - ETA estimation

17. **`server/src/utils/dateUtils.ts`**
    - Expiry date calculations
    - Date range queries
    - Forecast calculations

18. **`server/src/utils/notification.ts`**
    - Notification formatting
    - Notification dispatching helpers

### Phase 5: Middleware

19. **`server/src/middleware/auth.ts`**
    - JWT verification middleware
    - Token validation logic

20. **`server/src/middleware/authorize.ts`**
    - Role-based access control
    - Permission checking

21. **`server/src/middleware/validation.ts`**
    - Zod schema validation
    - Request body validation

22. **`server/src/middleware/errorHandler.ts`**
    - Global error handler
    - Error logging
    - Response formatting

23. **`server/src/middleware/logger.ts`**
    - Request logging
    - Winston logger setup

24. **`server/src/middleware/corsConfig.ts`**
    - CORS configuration
    - Origin whitelist

25. **`server/src/middleware/requestParser.ts`**
    - Body parser setup
    - JSON/URL-encoded parsing

### Phase 6: Services (Business Logic)

26. **`server/src/services/auth.service.ts`**
    - Register, login, token refresh
    - Password reset, email verification

27. **`server/src/services/user.service.ts`**
    - User CRUD operations
    - Profile management
    - Role-specific operations

28. **`server/src/services/hospital.service.ts`**
    - Hospital CRUD
    - Inventory management
    - Request handling

29. **`server/src/services/blood-bank.service.ts`**
    - Blood bank CRUD
    - Collection management
    - Distribution tracking

30. **`server/src/services/donor.service.ts`**
    - Donor profile operations
    - Eligibility checking
    - Availability management
    - Donation history

31. **`server/src/services/blood-inventory.service.ts`**
    - Stock tracking
    - Inventory updates
    - Expiry detection
    - Low stock alerts

32. **`server/src/services/blood-request.service.ts`**
    - Request creation/management
    - Request fulfillment
    - Status tracking

33. **`server/src/services/emergency-request.service.ts`**
    - Emergency request handling
    - Fast matching
    - Resolution tracking

34. **`server/src/services/donation-appointment.service.ts`**
    - Appointment booking
    - Schedule management
    - Confirmation logic

35. **`server/src/services/prediction.service.ts`**
    - AI prediction integration
    - Forecast calculations
    - Risk assessment

36. **`server/src/services/redistribution.service.ts`**
    - Transfer recommendations
    - Optimization logic
    - Route planning

37. **`server/src/services/notification.service.ts`**
    - Notification creation
    - Delivery logic
    - Read status tracking

38. **`server/src/services/analytics.service.ts`**
    - Dashboard statistics
    - Trend analysis
    - Report generation

### Phase 7: Controllers

39. **`server/src/controllers/*.ts`** (One for each endpoint group)
    - Auth controller
    - User controller
    - Hospital controller
    - Blood bank controller
    - Donor controller
    - Blood inventory controller
    - Blood request controller
    - Emergency controller
    - Appointment controller
    - Prediction controller
    - Analytics controller
    - Admin controller

### Phase 8: Routes

40. **`server/src/routes/*.ts`** (One for each endpoint group)
    - Auth routes
    - User routes
    - Hospital routes
    - Blood bank routes
    - Donor routes
    - Blood inventory routes
    - Blood request routes
    - Emergency request routes
    - Appointment routes
    - Prediction routes
    - Analytics routes
    - Admin routes

41. **`server/src/routes/index.ts`**
    - Route aggregator
    - API version prefix handling

### Phase 9: Application Setup

42. **`server/src/app.ts`**
    - Express app initialization
    - Middleware registration (in order)
    - Route registration
    - Error handler registration

43. **`server/src/server.ts`**
    - Server startup
    - Database connection
    - Port listening
    - Graceful shutdown

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    // Items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  },
  "timestamp": "2026-07-29T10:30:00Z"
}
```

---

## Authentication Flow

### JWT Token Structure

**Access Token**: 24 hours validity
```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  sub: userId,
  email: user.email,
  role: user.role,
  iat: issuedAt,
  exp: expiresAt
}
```

**Refresh Token**: 7 days validity
```
Stored in database with user reference
Invalidated on logout
```

### Login Flow

```
1. Client POST /api/auth/login { email, password }
2. Server validates credentials
3. Server generates JWT access token + refresh token
4. Server stores refresh token in database
5. Server returns { accessToken, refreshToken, user }
6. Client stores accessToken in memory, refreshToken in httpOnly cookie
7. Client includes Authorization header: Bearer <accessToken>
```

### Token Refresh Flow

```
1. Access token expires
2. Client POST /api/auth/refresh-token { refreshToken }
3. Server validates refresh token exists in database
4. Server generates new access token
5. Server returns new access token
6. Client updates Authorization header
```

---

## Database Indexes for Performance

```typescript
// User collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Hospital collection
db.hospitals.createIndex({ 'address.coordinates': '2dsphere' })
db.hospitals.createIndex({ verified: 1 })

// BloodBank collection
db.bloodbanks.createIndex({ 'address.coordinates': '2dsphere' })
db.bloodbanks.createIndex({ verified: 1 })

// BloodInventory collection
db.bloods.createIndex({ facility: 1, bloodGroup: 1 })
db.bloods.createIndex({ 'units.expiryDate': 1 })

// BloodRequest collection
db.bloodrequests.createIndex({ status: 1 })
db.bloodrequests.createIndex({ requestingFacility: 1 })

// Notification collection
db.notifications.createIndex({ recipient: 1, read: 1 })
```

---

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodbridge

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRE=7d

# Server
NODE_ENV=development
PORT=5000
SERVER_URL=http://localhost:5000

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug

# CORS
CORS_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX=100 # requests per window
```

---

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Validation functions

### Integration Tests
- API endpoints
- Database operations
- Authentication flows

### Test Structure
```
server/__tests__/
├── unit/
│   ├── services/
│   ├── utils/
│   └── models/
├── integration/
│   ├── auth.integration.test.ts
│   ├── hospital.integration.test.ts
│   └── blood-inventory.integration.test.ts
└── fixtures/
    └── sample-data.ts
```

---

## Performance Considerations

1. **Database Queries**
   - Use pagination for list endpoints
   - Implement pagination with skip/limit
   - Create indexes on frequently queried fields
   - Use lean() for read-only queries

2. **Caching**
   - Cache prediction results for 1 hour
   - Cache facility lookups for 30 minutes
   - Clear cache on inventory updates

3. **Real-time Updates**
   - Use WebSockets for emergency requests
   - Implement Server-Sent Events for notifications
   - Queue heavy AI operations

4. **Geolocation**
   - Use 2dsphere indexes for location queries
   - Implement location caching
   - Use approximate location for initial search

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster created
- [ ] SSL certificates for HTTPS
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging setup
- [ ] Database backups configured
- [ ] Monitoring and alerts setup
- [ ] API documentation generated
- [ ] Security audit completed
- [ ] Load testing performed

---

## Next Steps

1. Create `server/` directory at project root
2. Initialize `package.json` with listed dependencies
3. Set up TypeScript configuration
4. Create environment configuration
5. Build models and database layer
6. Implement middleware stack
7. Build services layer
8. Create API controllers and routes
9. Write integration tests
10. Deploy to staging environment
