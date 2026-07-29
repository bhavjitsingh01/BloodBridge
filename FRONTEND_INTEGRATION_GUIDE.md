# BloodBridge Frontend-Backend Integration Guide

## Overview

This guide explains how the frontend connects to the backend APIs using Axios and manages authentication and state.

## Architecture

### API Client (`lib/api.ts`)

The `apiClient` is a singleton instance of the `ApiClient` class that handles all backend communication.

**Features:**
- JWT token management
- Automatic header injection
- Error handling with 401 redirect
- localStorage persistence
- Comprehensive type definitions

**Usage:**
```typescript
import { apiClient } from '@/lib/api';

// Login
const auth = await apiClient.login(email, password);

// Get data
const hospitals = await apiClient.getHospitals({ city: 'Boston' });

// Create resource
const emergency = await apiClient.createEmergencyRequest(data);

// Update resource
const updated = await apiClient.updateInventory(id, { units: 50 });

// Delete resource
await apiClient.deleteNotification(id);
```

### Authentication Hook (`lib/useAuth.ts`)

Manages authentication state and user session.

**Features:**
- Token persistence in localStorage
- Automatic redirect on login
- Logout with cleanup
- Error handling
- Loading state

**Usage:**
```typescript
import { useAuth } from '@/lib/useAuth';

function LoginForm() {
  const { login, logout, user, loading, error, isAuthenticated } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Automatically redirected to dashboard
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // Form JSX
  );
}
```

### API Call Hook (`lib/useApiCall.ts`)

Generic hook for handling async API calls with loading and error states.

**Usage:**
```typescript
import { useApiCall } from '@/lib/useApiCall';

function MyComponent() {
  const { data, loading, error, execute } = useApiCall(
    async () => apiClient.getHospitals()
  );

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>{/* Render data */}</div>}
    </>
  );
}
```

### Dashboard Hooks (`lib/useDashboardData.ts`)

Pre-built hooks that fetch all necessary data for each dashboard role.

**Available Hooks:**
- `useHospitalDashboardData()` - Hospital dashboard
- `useDonorDashboardData()` - Donor dashboard
- `useBloodBankDashboardData()` - Blood Bank dashboard
- `useAdminDashboardData()` - Admin dashboard

**Usage:**
```typescript
import { useHospitalDashboardData } from '@/lib/useDashboardData';

function HospitalDashboard() {
  const { data, loading, error, refetch } = useHospitalDashboardData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const {
    inventory,
    emergencyRequests,
    nearbyHospitals,
    nearbyBloodBanks,
    nearbyDonors,
    predictions,
    shortages,
    expiryRisks,
    recommendations
  } = data;

  return (
    // Dashboard JSX
  );
}
```

### Data Transformers (`lib/dataTransformers.ts`)

Convert backend API responses to formats expected by existing UI components.

**Available Transformers:**
- `transformBackendInventoryToMockData()` - Inventory data
- `transformEmergencyRequests()` - Emergency requests
- `transformDonorsData()` - Donor information
- `transformPredictionsData()` - AI predictions
- `transformShortagesData()` - Shortage data
- `transformExpiryRisksData()` - Expiry risks

**Usage:**
```typescript
import { transformBackendInventoryToMockData } from '@/lib/dataTransformers';

function Dashboard() {
  const { data } = useHospitalDashboardData();
  
  const mockData = transformBackendInventoryToMockData(
    data.inventory,
    data.nearbyHospitals,
    profile
  );

  return <HospitalDashboardUI mockData={mockData} />;
}
```

## Integration Pattern

### 1. Replace Mock Data with API Calls

**Before:**
```typescript
import { mockHospitalData } from '@/lib/mockData';

export default function HospitalDashboard() {
  const { profile, inventory } = mockHospitalData;
  // ...
}
```

**After:**
```typescript
'use client';

import { useHospitalDashboardData } from '@/lib/useDashboardData';
import { transformBackendInventoryToMockData } from '@/lib/dataTransformers';

export default function HospitalDashboard() {
  const { data, loading, error, refetch } = useHospitalDashboardData();

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;

  const mockData = transformBackendInventoryToMockData(
    data.inventory,
    data.nearbyHospitals
  );

  return <DashboardContent data={mockData} />;
}
```

### 2. Handle Loading States

Add loading indicators for better UX:

```typescript
{loading && (
  <div className="flex items-center justify-center p-8">
    <Loader className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading dashboard...</span>
  </div>
)}
```

### 3. Handle Error States

Display errors gracefully:

```typescript
{error && (
  <Alert type="danger" title="Error" message={error}>
    <Button onClick={refetch}>Retry</Button>
  </Alert>
)}
```

### 4. Handle Empty States

Show helpful messages when no data:

```typescript
{data?.inventory.length === 0 && (
  <Card>
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">No inventory data available</p>
      <Button onClick={refetch} className="mt-4">Refresh Data</Button>
    </div>
  </Card>
)}
```

## API Endpoints Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout current user
- `GET /auth/profile` - Get current user profile

### Resources
- `GET/POST/PUT/DELETE /hospitals` - Hospital management
- `GET/POST/PUT/DELETE /blood-banks` - Blood bank management
- `GET/POST/PUT/PATCH/DELETE /donors` - Donor management
- `GET/POST/PUT/DELETE /inventory` - Blood inventory
- `GET /inventory/expiring` - Expiring blood units
- `GET /inventory/summary` - Inventory summary by blood group

### Emergency Management
- `GET/POST/PATCH/DELETE /emergency` - Emergency requests
- `POST /emergency/matching/:requestId` - Execute matching engine

### AI & Predictions
- `POST /ai/predict-demand` - Demand prediction
- `GET /ai/predictions` - Get predictions
- `GET /ai/shortages` - Shortage detection
- `GET /ai/expiry-risk` - Expiry risks
- `GET /ai/dashboard` - Complete AI dashboard

### Notifications & Recommendations
- `GET /notifications` - User notifications
- `PATCH /notifications/:id/read` - Mark as read
- `GET /recommendations/transfers` - Transfer recommendations
- `GET /recommendations/donors` - Donor recommendations

## Error Handling

The API client automatically handles common errors:

**401 Unauthorized:**
- Clears token and redirects to login

**Network Errors:**
- Caught in try-catch blocks
- Display error message to user

**Validation Errors:**
- Return detailed error messages from API
- Use these to show field-specific errors

**Example:**
```typescript
try {
  await apiClient.createEmergencyRequest(data);
} catch (err) {
  const message = err.response?.data?.message || 'Request failed';
  showErrorAlert(message);
}
```

## Environment Variables

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Token Management

Tokens are stored in localStorage and automatically sent with every request:

```typescript
// Manual token management if needed
const token = localStorage.getItem('authToken');
const user = JSON.parse(localStorage.getItem('authUser'));

// Clear on logout
localStorage.removeItem('authToken');
localStorage.removeItem('authUser');
```

## Socket.IO Integration (Future)

Real-time updates can be connected:

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: {
    token: localStorage.getItem('authToken'),
    user: JSON.parse(localStorage.getItem('authUser'))
  }
});

socket.on('emergency_created', (event) => {
  // Update UI with new emergency
});
```

## Testing API Integration

### Test Login
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hospital@example.com","password":"SecurePass123!"}'
```

### Test with Token
```bash
curl -X GET http://localhost:5001/api/v1/hospitals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Debugging

### Enable Request Logging
```typescript
// In lib/api.ts
this.client.interceptors.request.use((config) => {
  console.log('Request:', config.method, config.url);
  return config;
});

this.client.interceptors.response.use((response) => {
  console.log('Response:', response.status);
  return response;
});
```

### Check Stored Token
```javascript
// In browser console
localStorage.getItem('authToken');
localStorage.getItem('authUser');
```

### Monitor API Calls
```javascript
// Browser DevTools > Network tab
// Filter by Fetch/XHR to see API requests
```

## Best Practices

1. **Always use `useAuth()` for authentication** - Ensures consistent state
2. **Use dashboard hooks for bulk data** - Fetches everything needed at once
3. **Transform data before rendering** - Keeps components clean
4. **Show loading states** - Better UX during data fetching
5. **Handle errors gracefully** - Display meaningful messages
6. **Cache frequently accessed data** - Reduce API calls
7. **Refetch on user actions** - Keep data fresh
8. **Use proper TypeScript types** - Catch errors early

## Migration Checklist

When integrating a component:

- [ ] Add `'use client'` directive
- [ ] Import necessary hooks
- [ ] Replace mock data with API calls
- [ ] Add loading state handling
- [ ] Add error state handling
- [ ] Add empty state handling
- [ ] Test with real backend data
- [ ] Handle edge cases
- [ ] Remove mock data imports
- [ ] Test authentication flow
