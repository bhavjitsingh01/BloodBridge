# BloodBridge Testing Guide

**Last Updated:** July 29, 2026  
**Status:** Ready for Testing Phase

---

## TESTING STRATEGY

### 1. Unit Tests (API Client & Hooks)

#### API Client Tests (`/lib/api.ts`)

```bash
npm test -- api.test.ts
```

**Test Cases to Implement:**
- ✅ Authentication methods
  - `login()` - Valid/invalid credentials
  - `logout()` - Token cleanup
  - Token persistence in localStorage

- ✅ Inventory API
  - `getInventory()` - Fetch with/without filters
  - `createInventory()` - Valid/invalid data
  - `updateInventory()` - Update existing items
  - `deleteInventory()` - Delete with confirmation

- ✅ Emergency Request API
  - `getEmergencyRequests()` - Pagination, filtering
  - `createEmergencyRequest()` - Form validation
  - `updateEmergencyStatus()` - Status transitions
  - `deleteEmergencyRequest()` - Soft delete behavior

- ✅ AI Prediction API
  - `getPredictions()` - Response structure
  - `detectShortages()` - Data transformation
  - `getExpiryRisks()` - Risk level calculations

#### Authentication Hook Tests (`/lib/useAuth.ts`)

```bash
npm test -- useAuth.test.ts
```

**Test Cases:**
- ✅ User login flow
- ✅ Token management
- ✅ Auto-redirect on role
- ✅ Logout and cleanup
- ✅ Error handling

#### Socket.IO Hook Tests (`/lib/useSocket.ts`)

```bash
npm test -- useSocket.test.ts
```

**Test Cases:**
- ✅ Socket connection
- ✅ Event emission
- ✅ Event listening
- ✅ Namespace selection based on role
- ✅ Reconnection logic

### 2. Integration Tests (Page-to-API)

#### Hospital Dashboard Integration

```bash
npm test -- integration/hospital-dashboard.test.ts
```

**Test Flows:**
1. ✅ Page loads → Data fetches from API
2. ✅ User creates inventory → API called → Table updates
3. ✅ User deletes item → Confirmation → API called → List updates
4. ✅ Error handling → Alert displays correct message
5. ✅ Loading state → Spinner shows during fetch

#### Donor Dashboard Integration

```bash
npm test -- integration/donor-dashboard.test.ts
```

**Test Flows:**
1. ✅ Page loads → User data from useAuth()
2. ✅ Emergency requests display from API
3. ✅ Accept request → Status updates
4. ✅ Error states handled gracefully

#### Blood Bank Dashboard Integration

```bash
npm test -- integration/blood-bank-dashboard.test.ts
```

**Test Flows:**
1. ✅ Inventory management CRUD
2. ✅ Transfer request creation
3. ✅ Real-time inventory updates via Socket.IO

### 3. End-to-End Tests (Complete User Workflows)

#### Scenario 1: Hospital Emergency Request Flow

```gherkin
Feature: Hospital Emergency Request
  Scenario: Hospital creates emergency request for blood
    Given I am logged in as Hospital Admin
    When I navigate to Hospital > Requests
    And I click "Create Emergency Request"
    And I fill form: Blood Group="O-", Units="5", Priority="Critical"
    And I click "Submit Request"
    Then API should call createEmergencyRequest()
    And Request list should update
    And Confirmation message should appear
    And Nearby blood banks should be notified via Socket.IO
```

#### Scenario 2: Admin Inventory Management

```gherkin
Feature: Admin Inventory Management
  Scenario: Admin updates blood inventory
    Given I am logged in as Admin
    When I navigate to Hospital > Inventory
    And I click "Add Inventory"
    And I fill: Blood Group="AB+", Units="20"
    And I click "Save"
    Then Inventory should update in API
    And Table should refresh
    And Critical alert should clear if threshold met
```

#### Scenario 3: Real-time Socket.IO Updates

```gherkin
Feature: Real-time Updates
  Scenario: Emergency created updates connected clients
    Given User A is viewing Hospital Dashboard
    And User B creates emergency request for O- blood
    When Emergency is created
    Then User A should see new request in real-time
    And No page refresh required
```

---

## TESTING CHECKLIST

### Pre-Testing Setup

- [ ] Run TypeScript compiler
  ```bash
  npm run typecheck
  ```

- [ ] Install testing dependencies
  ```bash
  npm install --save-dev @testing-library/react @testing-library/jest-dom jest @types/jest
  ```

- [ ] Create test configuration in `jest.config.js`

- [ ] Set up test environment variables in `.env.test`

### Unit Testing Phase

#### API Client
- [ ] Authentication endpoints (login, logout)
- [ ] GET endpoints (getInventory, getEmergencyRequests, etc.)
- [ ] POST endpoints (createInventory, createEmergencyRequest, etc.)
- [ ] PUT/PATCH endpoints (updateInventory, updateEmergencyStatus, etc.)
- [ ] DELETE endpoints (deleteInventory, deleteEmergencyRequest, etc.)
- [ ] Error handling and response formatting
- [ ] Token management and localStorage

#### Hooks
- [ ] useAuth - Authentication state management
- [ ] useDashboardData - Data fetching and caching
- [ ] useSocket - Socket.IO connections
- [ ] useRealtimeEvent - Event listeners

#### Utilities
- [ ] formatDate functions
- [ ] Data transformers
- [ ] Error handlers

**Target Coverage:** 80%+ code coverage

### Integration Testing Phase

#### Hospital Dashboard
- [ ] Page loads with data
- [ ] Inventory CRUD operations
- [ ] Emergency request creation
- [ ] Status filtering and search
- [ ] Error scenarios
- [ ] Loading states

#### Donor Dashboard
- [ ] User profile displays correctly
- [ ] Emergency requests show
- [ ] Accept/reject functionality
- [ ] Notification handling

#### Blood Bank Dashboard
- [ ] Inventory management
- [ ] Transfer coordination
- [ ] Donor availability
- [ ] Expiry alerts

#### Admin Dashboard
- [ ] System-wide statistics
- [ ] User management
- [ ] Hospital/Blood Bank management
- [ ] Donor management

#### AI Predictions
- [ ] Charts render correctly
- [ ] Data loads from API
- [ ] Time range filtering works

#### Emergency Coordination
- [ ] Emergency requests display
- [ ] Hospital recommendations show
- [ ] Blood bank recommendations show
- [ ] Donor matching works

**Target Coverage:** All critical paths tested

### End-to-End Testing Phase

#### Full User Journeys

1. **Hospital Admin Workflow**
   - [ ] Login as Hospital
   - [ ] Navigate to Dashboard
   - [ ] View inventory
   - [ ] Create emergency request
   - [ ] Check AI recommendations
   - [ ] View analytics
   - [ ] Manage inventory items

2. **Donor Workflow**
   - [ ] Login as Donor
   - [ ] View dashboard
   - [ ] See blood requests
   - [ ] Accept request
   - [ ] View notifications
   - [ ] Check donation history

3. **Blood Bank Workflow**
   - [ ] Login as Blood Bank
   - [ ] View inventory
   - [ ] Manage donations
   - [ ] Handle transfers
   - [ ] View analytics

4. **Admin Workflow**
   - [ ] Login as Admin
   - [ ] View system statistics
   - [ ] Manage hospitals
   - [ ] Manage blood banks
   - [ ] Manage donors
   - [ ] View system analytics

5. **Real-time Updates**
   - [ ] Emergency created → Notify connected clients
   - [ ] Inventory updated → Update dashboard
   - [ ] Shortage detected → Alert system
   - [ ] Notification created → Push to users

#### Cross-browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

#### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## PERFORMANCE TESTING

### Load Testing

```bash
# Test with concurrent users
npm run test:load -- --users 100 --duration 300s
```

**Metrics to Monitor:**
- [ ] API response time < 200ms (p95)
- [ ] Frontend response time < 100ms
- [ ] Socket.IO message latency < 50ms
- [ ] Database query time < 100ms
- [ ] No memory leaks over 5 minutes

### Stress Testing

```bash
# Test with increasing load
npm run test:stress -- --ramp-up 60s --peak-users 500
```

**Success Criteria:**
- [ ] System handles 500+ concurrent users
- [ ] Graceful degradation under load
- [ ] No data corruption
- [ ] Error rate < 1%

---

## SECURITY TESTING

### Authentication Testing
- [ ] Invalid credentials rejected
- [ ] Expired tokens cleared
- [ ] Protected routes require auth
- [ ] CORS headers correct
- [ ] No sensitive data in localStorage

### XSS Prevention
- [ ] All user input sanitized
- [ ] No eval() or dangerous functions
- [ ] CSP headers in place
- [ ] Script injection attempts blocked

### CSRF Protection
- [ ] CSRF tokens implemented
- [ ] State validation on mutations
- [ ] Double submit cookies not used

### API Security
- [ ] Rate limiting enforced
- [ ] SQL injection prevented (Mongoose)
- [ ] NoSQL injection prevented
- [ ] Parameter validation working

---

## TESTING COMMANDS

```bash
# Run all tests
npm test

# Run specific test file
npm test -- hospital-dashboard.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:perf

# Run security tests
npm run test:security
```

---

## TEST DATA SETUP

### Seeding Test Database

```bash
# Seed with test data
npm run seed

# Clear test database
npm run seed:clear
```

**Test Data Includes:**
- ✅ 3 hospitals with inventory
- ✅ 2 blood banks with stock
- ✅ 10 donors with availability
- ✅ Sample emergency requests
- ✅ Inventory transactions

### Test User Accounts

| Role | Email | Password |
|------|-------|----------|
| Hospital | hospital1@example.com | SecurePass123! |
| Blood Bank | bloodbank1@example.com | SecurePass123! |
| Donor | donor1@example.com | SecurePass123! |
| Admin | admin@example.com | SecurePass123! |

---

## TROUBLESHOOTING

### Common Test Failures

#### "Cannot find module '@/lib/api'"
- Run `npm install`
- Check tsconfig paths configuration

#### "API request timeout"
- Ensure backend is running: `npm run dev` (from /server)
- Check .env.test has correct API_URL

#### "Socket.IO connection failed"
- Verify Socket.IO server running on backend
- Check SOCKET_URL environment variable
- Review browser console for connection errors

#### "React/Button component not found"
- Run `npm install`
- Check component paths in imports

### Debug Mode

```bash
# Run with debug logging
DEBUG=* npm test

# Run with verbose output
npm test -- --verbose

# Run with specific test name pattern
npm test -- --testNamePattern="inventory"
```

---

## CONTINUOUS INTEGRATION

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

---

## SIGN-OFF

Testing phase complete when:
- [ ] Unit test coverage >= 80%
- [ ] All integration tests passing
- [ ] All E2E scenarios passing
- [ ] No critical bugs found
- [ ] Performance within targets
- [ ] Security audit passed
- [ ] Cross-browser testing complete
- [ ] QA sign-off obtained

---

**Next Phase:** Deployment
**Target Date:** August 5, 2026
