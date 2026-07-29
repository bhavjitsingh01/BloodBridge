# API Endpoints Quick Reference

Complete list of all API endpoints organized by feature with HTTP methods, request/response examples.

**Base URL**: `http://localhost:5000/api/v1`

---

## Authentication Endpoints

### Register User

```
POST /auth/register

Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "phone": "+919876543210",
  "role": "donor|hospital|blood-bank",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "coordinates": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  }
}

Response (201):
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "donor",
    "verified": false,
    "createdAt": "2026-07-29T10:30:00Z"
  }
}
```

### Login

```
POST /auth/login

Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "donor"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Refresh Token

```
POST /auth/refresh-token

Headers:
Authorization: Bearer <access_token>

Request:
{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

### Logout

```
POST /auth/logout

Headers:
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful"
}
```

### Get Current User

```
GET /auth/me

Headers:
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "donor",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## Hospital Management Endpoints

### List All Hospitals

```
GET /hospitals?page=1&limit=20&city=Mumbai&verified=true

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Hospitals retrieved",
  "data": [
    {
      "_id": "hospital_id",
      "name": "City Hospital",
      "email": "hospital@example.com",
      "address": { ... },
      "verified": true,
      "createdAt": "2026-07-29T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Get Hospital Details

```
GET /hospitals/:hospitalId

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Hospital retrieved",
  "data": {
    "_id": "hospital_id",
    "name": "City Hospital",
    "licenseNumber": "LIC-123456",
    "email": "hospital@example.com",
    "phone": "+919876543210",
    "address": { ... },
    "verified": true,
    "registrationNumber": "REG-123456",
    "adminUser": "admin_user_id",
    "bloodInventory": ["inv_1", "inv_2"],
    "operatingHours": {
      "open": "08:00",
      "close": "22:00",
      "daysOpen": [1, 2, 3, 4, 5, 6]
    }
  }
}
```

### Create Hospital

```
POST /hospitals

Headers:
Authorization: Bearer <access_token>

Request:
{
  "name": "City Hospital",
  "licenseNumber": "LIC-123456",
  "email": "hospital@example.com",
  "phone": "+919876543210",
  "address": { ... },
  "registrationNumber": "REG-123456",
  "operatingHours": {
    "open": "08:00",
    "close": "22:00",
    "daysOpen": [1, 2, 3, 4, 5, 6, 0]
  }
}

Response (201): Hospital object
```

### Update Hospital

```
PUT /hospitals/:hospitalId

Headers:
Authorization: Bearer <access_token>

Request:
{
  "name": "Updated Hospital Name",
  "phone": "+919999999999"
}

Response (200): Updated hospital object
```

### Get Hospital Blood Inventory

```
GET /hospitals/:hospitalId/inventory

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Inventory retrieved",
  "data": [
    {
      "_id": "inv_id",
      "bloodGroup": "O+",
      "totalUnits": 50,
      "availableUnits": 30,
      "reservedUnits": 20,
      "units": [
        {
          "batchNumber": "BATCH-001",
          "collectionDate": "2026-07-15",
          "expiryDate": "2026-08-26",
          "quantity": 10,
          "status": "available"
        }
      ]
    }
  ]
}
```

### Find Nearby Hospitals/Blood Banks

```
GET /hospitals/:hospitalId/nearby?radius=50&type=hospital

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Nearby facilities retrieved",
  "data": [
    {
      "facilityId": "facility_id",
      "facilityName": "Near Hospital",
      "facilityType": "hospital",
      "distance": 12.5,
      "eta": 25,
      "coordinates": { ... }
    }
  ]
}
```

---

## Blood Bank Endpoints

### List All Blood Banks

```
GET /blood-banks?page=1&limit=20&verified=true

Response (200): Paginated list of blood banks
```

### Get Blood Bank Details

```
GET /blood-banks/:bankId

Response (200): Blood bank details
```

### Create Blood Bank

```
POST /blood-banks

Headers:
Authorization: Bearer <access_token>

Request:
{
  "name": "Central Blood Bank",
  "licenseNumber": "LIC-789012",
  "email": "bank@example.com",
  "phone": "+919876543210",
  "address": { ... },
  "registrationNumber": "REG-789012"
}

Response (201): Created blood bank
```

### Get Blood Bank Inventory

```
GET /blood-banks/:bankId/inventory

Response (200): Blood bank inventory
```

### Get Expiring Blood

```
GET /blood-banks/:bankId/expiring?days=5

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Expiring blood retrieved",
  "data": [
    {
      "_id": "inv_id",
      "bloodGroup": "AB-",
      "expiryDate": "2026-08-03",
      "daysRemaining": 5,
      "units": [...]
    }
  ]
}
```

---

## Donor Portal Endpoints

### Get Donor Profile

```
GET /donors/me

Headers:
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Donor profile retrieved",
  "data": {
    "_id": "donor_id",
    "user": "user_id",
    "bloodGroup": "O+",
    "lastDonationDate": "2026-06-15",
    "eligibilityStatus": "eligible",
    "availabilityStatus": "available",
    "totalDonations": 5,
    "donationHistory": [
      {
        "date": "2026-06-15",
        "location": "hospital_id",
        "unitsCollected": 1,
        "healthStatus": "healthy"
      }
    ],
    "medicalHistory": { ... }
  }
}
```

### Update Donor Profile

```
PUT /donors/:donorId

Headers:
Authorization: Bearer <access_token>

Request:
{
  "phone": "+919999999999",
  "address": { ... }
}

Response (200): Updated donor profile
```

### Update Availability Status

```
PUT /donors/:donorId/availability

Headers:
Authorization: Bearer <access_token>

Request:
{
  "availabilityStatus": "available|busy|not-available"
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Availability status updated",
  "data": {
    "availabilityStatus": "available"
  }
}
```

### Get Donation History

```
GET /donors/:donorId/history?page=1&limit=20

Response (200): Paginated donation history
```

### Check Eligibility

```
GET /donors/:donorId/eligibility

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Eligibility checked",
  "data": {
    "isEligible": true,
    "status": "eligible",
    "nextEligibleDate": "2026-09-10",
    "reasons": []
  }
}
```

---

## Blood Inventory Endpoints

### Get All Inventory

```
GET /blood-inventory?page=1&limit=20&bloodGroup=O+&facility=hospital_id

Response (200): Paginated inventory
```

### Get Inventory by ID

```
GET /blood-inventory/:inventoryId

Response (200): Inventory details
```

### Add Blood Units

```
POST /blood-inventory

Headers:
Authorization: Bearer <access_token>

Request:
{
  "facility": "facility_id",
  "bloodGroup": "O+",
  "units": [
    {
      "batchNumber": "BATCH-001",
      "collectionDate": "2026-07-29",
      "expiryDate": "2026-09-09",
      "quantity": 10
    }
  ]
}

Response (201): Created inventory
```

### Update Inventory

```
PUT /blood-inventory/:inventoryId

Headers:
Authorization: Bearer <access_token>

Request:
{
  "availableUnits": 25,
  "reservedUnits": 15
}

Response (200): Updated inventory
```

### Transfer Blood

```
POST /blood-inventory/:inventoryId/transfer

Headers:
Authorization: Bearer <access_token>

Request:
{
  "toFacility": "target_facility_id",
  "units": 10,
  "reason": "Critical shortage"
}

Response (201):
{
  "success": true,
  "statusCode": 201,
  "message": "Transfer initiated",
  "data": {
    "_id": "transaction_id",
    "fromFacility": "source_facility_id",
    "toFacility": "target_facility_id",
    "bloodGroup": "O+",
    "units": 10,
    "status": "requested",
    "distance": 25.5,
    "estimatedTime": 45
  }
}
```

---

## Blood Request Endpoints

### List All Requests

```
GET /blood-requests?page=1&limit=20&status=pending&priority=high

Response (200): Paginated requests
```

### Get Request Details

```
GET /blood-requests/:requestId

Response (200): Request details
```

### Create Blood Request

```
POST /blood-requests

Headers:
Authorization: Bearer <access_token>

Request:
{
  "bloodGroup": "A+",
  "unitsRequired": 5,
  "priority": "high",
  "requestReason": "Surgery scheduled",
  "patientInfo": {
    "age": 45,
    "bloodGroup": "A+",
    "condition": "Acute anemia"
  },
  "requiredBy": "2026-07-30T14:00:00Z"
}

Response (201): Created request
```

### Update Request Status

```
PUT /blood-requests/:requestId/status

Headers:
Authorization: Bearer <access_token>

Request:
{
  "status": "fulfilled|rejected|partial"
}

Response (200): Updated request
```

### Fulfill Request

```
POST /blood-requests/:requestId/fulfill

Headers:
Authorization: Bearer <access_token>

Request:
{
  "sourceHospital": "source_hospital_id",
  "unitsReceived": 5
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Request fulfilled",
  "data": { ... }
}
```

---

## Emergency Request Endpoints

### Create Emergency Request

```
POST /emergency-requests

Headers:
Authorization: Bearer <access_token>

Request:
{
  "hospital": "hospital_id",
  "bloodGroup": "O-",
  "unitsNeeded": 10,
  "priority": "critical",
  "patientInfo": {
    "age": 32,
    "bloodGroup": "O-",
    "condition": "Road accident",
    "reason": "Emergency surgery required"
  }
}

Response (201):
{
  "success": true,
  "statusCode": 201,
  "message": "Emergency request created",
  "data": {
    "_id": "emergency_id",
    "hospital": "hospital_id",
    "bloodGroup": "O-",
    "unitsNeeded": 10,
    "priority": "critical",
    "status": "active",
    "sources": {
      "hospitals": [],
      "bloodBanks": [],
      "eligibleDonors": []
    },
    "createdAt": "2026-07-29T10:30:00Z"
  }
}
```

### Get Emergency Request

```
GET /emergency-requests/:emergencyId

Response (200): Emergency details with sources
```

### Find Matching Sources

```
GET /emergency-requests/:emergencyId/matches

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Matching sources found",
  "data": {
    "fastestSource": {
      "facility": "facility_id",
      "eta": 20,
      "distance": 10.5
    },
    "matches": [
      {
        "sourceType": "hospital",
        "sourceId": "hospital_id",
        "sourceName": "Near Hospital",
        "distance": 10.5,
        "eta": 20,
        "availableUnits": 15,
        "compatibility": 100
      }
    ]
  }
}
```

### Resolve Emergency

```
POST /emergency-requests/:emergencyId/resolve

Headers:
Authorization: Bearer <access_token>

Request:
{
  "sourceId": "source_facility_id"
}

Response (200): Resolved emergency
```

### Get Active Emergencies

```
GET /emergency-requests/active

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Active emergencies retrieved",
  "data": [...]
}
```

---

## Appointment Endpoints

### Book Appointment

```
POST /appointments

Headers:
Authorization: Bearer <access_token>

Request:
{
  "facility": "facility_id",
  "appointmentDate": "2026-08-05",
  "appointmentTime": "14:30"
}

Response (201):
{
  "success": true,
  "statusCode": 201,
  "message": "Appointment booked",
  "data": {
    "_id": "appointment_id",
    "donor": "donor_id",
    "facility": "facility_id",
    "appointmentDate": "2026-08-05",
    "appointmentTime": "14:30",
    "status": "scheduled",
    "bloodGroup": "O+",
    "unitsToCollect": 1
  }
}
```

### Get Donor Appointments

```
GET /appointments?donorId=donor_id&status=scheduled

Response (200): Paginated appointments
```

### Update Appointment

```
PUT /appointments/:appointmentId

Headers:
Authorization: Bearer <access_token>

Request:
{
  "appointmentDate": "2026-08-06",
  "appointmentTime": "15:00"
}

Response (200): Updated appointment
```

### Cancel Appointment

```
DELETE /appointments/:appointmentId

Headers:
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Appointment cancelled"
}
```

### Complete Appointment

```
POST /appointments/:appointmentId/complete

Headers:
Authorization: Bearer <access_token>

Request:
{
  "unitsCollected": 1,
  "healthStatus": "healthy"
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Appointment completed",
  "data": { ... }
}
```

---

## AI Prediction Endpoints

### Get Blood Shortage Predictions

```
GET /predictions/blood-shortage

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Shortage predictions retrieved",
  "data": [
    {
      "bloodGroup": "O-",
      "facility": "facility_id",
      "riskLevel": "critical",
      "currentLevel": 5,
      "predictedLevel": 0,
      "forecast": {
        "timeframe": "next-7-days",
        "estimatedDemand": 15,
        "estimatedSupply": 5,
        "shortage": 10
      },
      "confidence": 92,
      "recommendations": [
        "Urgently request O- blood from nearby hospitals",
        "Initiate emergency donor notification"
      ]
    }
  ]
}
```

### Get Demand Forecast

```
GET /predictions/demand-forecast?bloodGroup=O+&facility=facility_id&timeframe=next-7-days

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Demand forecast retrieved",
  "data": {
    "bloodGroup": "O+",
    "facility": "facility_id",
    "timeframe": "next-7-days",
    "estimatedDemand": 25,
    "confidence": 88,
    "factors": {
      "historicalUsage": 22,
      "seasonalTrends": "Moderate increase in summer",
      "upcomingEvents": "Annual mela - high donations expected"
    }
  }
}
```

### Get Supply Forecast

```
GET /predictions/supply-forecast?bloodGroup=A+&timeframe=next-14-days

Response (200): Supply forecast data
```

### Get Expiry Risk Analysis

```
GET /predictions/expiry-risk

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Expiry risk analysis retrieved",
  "data": [
    {
      "inventory": "inventory_id",
      "bloodGroup": "AB-",
      "facility": "facility_id",
      "batchNumber": "BATCH-001",
      "expiryDate": "2026-08-05",
      "daysRemaining": 7,
      "riskLevel": "high",
      "recommendation": "Transfer to facility with higher AB- demand"
    }
  ]
}
```

### Get Redistribution Recommendations

```
GET /predictions/redistribution

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Redistribution recommendations retrieved",
  "data": [
    {
      "bloodGroup": "O-",
      "fromFacility": "blood_bank_id",
      "toFacility": "hospital_id",
      "units": 10,
      "reason": "Preventing expiry and meeting demand",
      "distance": 25.5,
      "eta": 45,
      "confidence": 95
    }
  ]
}
```

---

## Analytics Endpoints

### Get Dashboard Statistics

```
GET /analytics/dashboard

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard statistics retrieved",
  "data": {
    "totalDonors": 5420,
    "totalHospitals": 125,
    "totalBloodBanks": 18,
    "totalInventory": 12500,
    "lowStockAlerts": 8,
    "criticalAlerts": 2,
    "pendingRequests": 24,
    "activeEmergencies": 3,
    "bloodGroupDistribution": {
      "O+": 3200,
      "O-": 1200,
      "A+": 2400,
      "A-": 800,
      "B+": 2100,
      "B-": 900,
      "AB+": 1500,
      "AB-": 400
    }
  }
}
```

### Get Blood Supply Heatmap

```
GET /analytics/blood-supply-map

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Supply map retrieved",
  "data": {
    "timestamp": "2026-07-29T10:30:00Z",
    "facilities": [
      {
        "facility_id": "facility_id",
        "name": "City Hospital",
        "coordinates": { latitude: 19.0760, longitude: 72.8777 },
        "totalUnits": 500,
        "bloodGroups": {
          "O+": 150,
          "O-": 50
        },
        "criticalGroups": ["O-"]
      }
    ]
  }
}
```

### Get Blood Demand Heatmap

```
GET /analytics/demand-map

Response (200): Demand heatmap data by facility
```

### Get Hospital Analytics

```
GET /analytics/hospital/:hospitalId

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Hospital analytics retrieved",
  "data": {
    "hospital": "hospital_id",
    "totalRequests": 156,
    "fulfilledRequests": 148,
    "fulfillmentRate": 94.9,
    "averageFulfillmentTime": 2.5,
    "bloodGroupUsage": { ... },
    "topRequestedGroups": ["O+", "A+"],
    "trends": { ... }
  }
}
```

### Get Donation Trends

```
GET /analytics/donation-trends?period=month

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Donation trends retrieved",
  "data": {
    "totalDonations": 450,
    "newDonors": 45,
    "repeatDonors": 405,
    "donationsByBloodGroup": { ... },
    "trendChart": [
      { date: "2026-07-01", donations: 15 },
      { date: "2026-07-02", donations: 18 }
    ]
  }
}
```

### Get Expiry Statistics

```
GET /analytics/expiry-statistics?days=30

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Expiry statistics retrieved",
  "data": {
    "totalExpiredUnits": 45,
    "expiredByBloodGroup": { ... },
    "wastedValue": 450000,
    "expiringWithin30Days": 125,
    "preventedExpiry": 89
  }
}
```

---

## Admin Endpoints

### List All Users

```
GET /admin/users?page=1&limit=20&role=donor&verified=true

Headers:
Authorization: Bearer <admin_token>

Response (200): Paginated users
```

### Get Pending Verifications

```
GET /admin/verify-pending?type=hospital|blood-bank

Headers:
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Pending verifications retrieved",
  "data": [
    {
      "_id": "facility_id",
      "name": "Hospital Name",
      "type": "hospital",
      "licenseNumber": "LIC-123456",
      "email": "hospital@example.com",
      "submittedAt": "2026-07-25T10:30:00Z"
    }
  ]
}
```

### Verify Facility

```
POST /admin/verify-facility/:facilityId

Headers:
Authorization: Bearer <admin_token>

Request:
{
  "verified": true,
  "notes": "License verified"
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Facility verified successfully"
}
```

### Reject Facility Verification

```
DELETE /admin/verify-facility/:facilityId

Headers:
Authorization: Bearer <admin_token>

Request:
{
  "reason": "License number not valid"
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Facility verification rejected"
}
```

---

## Error Response Examples

### 400 Bad Request

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ],
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access forbidden - admin role required",
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### 404 Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Hospital not found",
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### 409 Conflict

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already registered",
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2026-07-29T10:30:00Z"
}
```

---

## Pagination

All list endpoints support pagination:

```
GET /endpoint?page=1&limit=20&sort=-createdAt

Response:
{
  "success": true,
  "statusCode": 200,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (prefix with `-` for descending)
- `search`: Search term for applicable fields

---

## Rate Limiting

API implements rate limiting:
- Window: 15 minutes
- Max requests: 100 per window

**Rate limit headers** in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1690698600
```

If limit exceeded: **429 Too Many Requests**

---

## Authentication

All protected endpoints require:

```
Authorization: Bearer <access_token>
```

Token format: JWT with header:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Payload:
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "donor|hospital|blood-bank|admin",
  "iat": 1690703400,
  "exp": 1690789800
}
```

---

## Implementation Status Checklist

Use this to track implementation progress:

- [ ] Authentication endpoints
- [ ] Hospital management
- [ ] Blood bank management
- [ ] Donor portal
- [ ] Blood inventory
- [ ] Blood requests
- [ ] Emergency requests
- [ ] Appointment booking
- [ ] AI predictions
- [ ] Analytics
- [ ] Admin functions
- [ ] Error handling
- [ ] Input validation
- [ ] Rate limiting
- [ ] Logging
- [ ] Testing
- [ ] Documentation
