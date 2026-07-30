# BloodBridge Socket.IO Events Documentation

## Overview

Socket.IO enables real-time bidirectional communication between the BloodBridge backend and connected clients. Events are organized by namespace and role, with automatic room-based message filtering.

## Connection

### WebSocket URL
```
ws://localhost:5001
```

### Authentication
All socket connections require authentication:

```javascript
const socket = io('http://localhost:5001', {
  auth: {
    token: 'JWT_TOKEN',
    user: {
      id: 'USER_ID',
      email: 'user@example.com',
      role: 'Hospital', // or 'BloodBank', 'Donor', 'Admin'
      locationId: 'LOCATION_ID', // for Hospital/BloodBank
      state: 'STATE',
      city: 'CITY'
    }
  }
});
```

## Namespaces

### /hospital
- **Role Required**: Hospital
- **Auto-Joins**: State and City rooms, Hospital-specific room
- **Events**: Receives emergency, inventory, donor, and shortage alerts

### /blood-bank
- **Role Required**: BloodBank
- **Auto-Joins**: State and City rooms, BloodBank-specific room
- **Events**: Receives emergency, inventory, donor, and shortage alerts

### /donor
- **Role Required**: Donor
- **Auto-Joins**: State and City rooms
- **Events**: Receives donor availability changes and emergency requests

### /admin
- **Role Required**: Admin
- **Auto-Joins**: admin_all room
- **Events**: Receives all system events

## Rooms

Clients automatically join rooms based on their location:

- `state_{STATE}` - All users in a specific state
- `city_{CITY}` - All users in a specific city
- `hospital_{HOSPITAL_ID}` - Specific hospital staff
- `blood_bank_{BLOOD_BANK_ID}` - Specific blood bank staff
- `admin_all` - All admins

## Socket Events

### Emergency Request Events

#### emergency_created
**Emitted When**: A hospital or blood bank creates an emergency request
**Received By**: Hospitals and Blood Banks in the city/state, All Admins
**Event Data**:
```javascript
{
  type: 'EMERGENCY_REQUEST_CREATED',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    emergencyId: '6a6a2b43c538bc3de5b27fc6',
    bloodGroup: 'O+',
    unitsRequired: 30,
    priority: 'Critical', // 'Normal', 'High', 'Critical'
    requesterCity: 'Boston',
    requesterState: 'MA',
    requesterName: 'St Mary Hospital'
  }
}
```

**Client Usage**:
```javascript
socket.on('emergency_created', (event) => {
  console.log(`Emergency: ${event.data.priority} ${event.data.bloodGroup} needed`);
  // Update UI with emergency details
});
```

#### emergency_accepted
**Emitted When**: An emergency request is accepted
**Received By**: All Hospitals, Blood Banks, Admins
**Event Data**:
```javascript
{
  type: 'EMERGENCY_REQUEST_ACCEPTED',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    emergencyId: '6a6a2b43c538bc3de5b27fc6',
    acceptingHospitalName: 'City Hospital'
  }
}
```

#### emergency_completed
**Emitted When**: An emergency request is completed
**Received By**: All Hospitals, Blood Banks, Admins
**Event Data**:
```javascript
{
  type: 'EMERGENCY_REQUEST_COMPLETED',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    emergencyId: '6a6a2b43c538bc3de5b27fc6',
    completionDetails: {
      bloodGroup: 'O+',
      unitsRequired: 30,
      completedAt: '2026-07-29T16:45:00Z'
    }
  }
}
```

### Blood Inventory Events

#### inventory_updated
**Emitted When**: Blood inventory is created or updated
**Received By**: Relevant hospitals/blood banks, other users in the same city
**Event Data**:
```javascript
{
  type: 'BLOOD_INVENTORY_UPDATED',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    locationId: '6a6a27841b6861248d105a3b',
    locationType: 'Hospital', // 'Hospital' or 'BloodBank'
    bloodGroup: 'O+',
    units: 50,
    city: 'Boston',
    state: 'MA'
  }
}
```

**Client Usage**:
```javascript
socket.on('inventory_updated', (event) => {
  console.log(`${event.data.units} units of ${event.data.bloodGroup} updated`);
  // Refresh inventory dashboard
});
```

#### inventory_low
**Emitted When**: Blood inventory drops below minimum threshold (20 units)
**Received By**: Relevant hospital/blood bank, All Admins
**Event Data**:
```javascript
{
  type: 'BLOOD_INVENTORY_LOW',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    locationId: '6a6a27841b6861248d105a3b',
    locationType: 'Hospital',
    bloodGroup: 'AB-',
    currentUnits: 5,
    minimumRequired: 20,
    shortfall: 15,
    city: 'Boston',
    state: 'MA'
  }
}
```

**Client Usage**:
```javascript
socket.on('inventory_low', (event) => {
  showAlert(`ALERT: ${event.data.bloodGroup} inventory low!`);
  // Trigger automatic transfer request
});
```

### Donor Events

#### donor_available
**Emitted When**: A new donor becomes registered and available
**Received By**: All Hospitals and Blood Banks in the city/state
**Event Data**:
```javascript
{
  type: 'NEW_DONOR_AVAILABLE',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    donorId: '6a6a2b43c538bc3de5b27fc6',
    bloodGroup: 'O+',
    donorName: 'John Doe',
    city: 'Boston',
    state: 'MA'
  }
}
```

#### donor_status_changed
**Emitted When**: A donor's availability status changes (Available/Unavailable)
**Received By**: Hospitals/Blood Banks in the city/state, All Donors, All Admins
**Event Data**:
```javascript
{
  type: 'DONOR_AVAILABILITY_CHANGED',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    donorId: '6a6a2b43c538bc3de5b27fc6',
    bloodGroup: 'O+',
    donorName: 'John Doe',
    newStatus: 'Available', // 'Available' or 'Unavailable'
    city: 'Boston',
    state: 'MA'
  }
}
```

**Client Usage**:
```javascript
socket.on('donor_status_changed', (event) => {
  if (event.data.newStatus === 'Available') {
    console.log(`${event.data.donorName} is now available for donation`);
  }
});
```

### Notification Events

#### new_notification
**Emitted When**: A new notification is created for a specific user
**Received By**: Only the specific user
**Event Data**:
```javascript
{
  type: 'NEW_NOTIFICATION',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    _id: 'NOTIFICATION_ID',
    title: 'Emergency Blood Donation Request - O+',
    message: 'An emergency blood request for O+ blood type has been issued...',
    type: 'emergency_donor_request', // see notification types below
    priority: 'Critical',
    isRead: false,
    metadata: {
      emergencyRequestId: '6a6a2b43c538bc3de5b27fc6',
      bloodGroup: 'O+',
      unitsNeeded: 30
    }
  }
}
```

**Client Usage**:
```javascript
socket.on('new_notification', (event) => {
  showNotification(event.data);
  updateNotificationBadge(+1);
});
```

**Notification Types**:
- `emergency_donor_request` - Emergency blood donation request
- `expiry_alert` - Blood units expiring soon
- `transfer_recommendation` - Recommended blood transfer
- `general` - General notification

### AI & Prediction Events

#### shortage_prediction
**Emitted When**: AI shortage prediction engine generates new predictions
**Received By**: Affected hospitals/blood banks, All Admins
**Event Data**:
```javascript
{
  type: 'AI_SHORTAGE_PREDICTION',
  timestamp: '2026-07-29T16:45:00Z',
  data: {
    predictions: [
      {
        bloodGroup: 'O+',
        predictedUnits: 1080,
        trend: 'increasing',
        riskLevel: 'Medium',
        confidenceScore: 0.57
      }
    ],
    affectedLocations: ['6a6a27841b6861248d105a3b'],
    recommendations: [
      {
        from: 'Hospital A',
        to: 'Hospital B',
        bloodGroup: 'O+',
        units: 20,
        priority: 'High'
      }
    ],
    generatedAt: '2026-07-29T16:45:00Z'
  }
}
```

**Client Usage**:
```javascript
socket.on('shortage_prediction', (event) => {
  console.log('AI Predictions Updated');
  event.data.predictions.forEach(pred => {
    if (pred.riskLevel === 'High' || pred.riskLevel === 'Critical') {
      sendAlert(`${pred.bloodGroup} shortage predicted: ${pred.riskLevel}`);
    }
  });
});
```

## Connection & Lifecycle Events

### Standard Socket.IO Events

#### connect
Fires when successfully connected to the server
```javascript
socket.on('connect', () => {
  console.log('Connected to BloodBridge');
});
```

#### disconnect
Fires when connection is lost
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from BloodBridge');
  // Attempt to reconnect
});
```

#### connect_error
Fires when connection fails
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

#### error
Fires for socket-specific errors
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Broadcasting Methods

### Manual Broadcasting (Server-Side)

```typescript
// Broadcast to specific room
broadcastToRoom('hospital', 'city_Boston', 'event_name', data);

// Send direct message to user
sendToUser('userId', 'event_name', data);

// Get connected users
const count = getConnectedUsersCount();
const hospitalUsers = getConnectedUsersByRole('Hospital');
const allUsers = getAllConnectedUsers();
```

## Best Practices

1. **Always Handle Disconnection**: Implement reconnection logic with exponential backoff
2. **Validate Events**: Check event data structure before using in your application
3. **Update UI Dynamically**: Don't require page refreshes for real-time updates
4. **Manage Memory**: Remove old events from UI when they're no longer relevant
5. **Use Rooms Efficiently**: Join/leave rooms based on user navigation
6. **Throttle Updates**: For high-frequency events, consider throttling updates
7. **Log Events**: Track important events for debugging and monitoring

## Example Client Implementation

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001/hospital', {
  auth: {
    token: 'JWT_TOKEN',
    user: {
      id: 'user_123',
      email: 'hospital@example.com',
      role: 'Hospital',
      locationId: 'hospital_123',
      state: 'MA',
      city: 'Boston'
    }
  }
});

// Connection lifecycle
socket.on('connect', () => {
  console.log('Connected');
});

socket.on('disconnect', () => {
  console.log('Disconnected - attempting to reconnect...');
});

// Listen for emergency events
socket.on('emergency_created', (event) => {
  console.log(`New Emergency: ${event.data.bloodGroup} needed`);
  // Update dashboard
});

// Listen for inventory updates
socket.on('inventory_updated', (event) => {
  console.log(`Inventory updated: ${event.data.units} units of ${event.data.bloodGroup}`);
  // Refresh inventory view
});

// Listen for notifications
socket.on('new_notification', (event) => {
  console.log(`New notification: ${event.data.title}`);
  // Show notification badge
});

// Handle errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Testing Socket Events

Use the Socket.IO testing tools:

```javascript
// In browser console
const socket = io('http://localhost:5001/hospital', { auth: {...} });

// Monitor all events
socket.onAny((event, data) => {
  console.log('Event:', event, 'Data:', data);
});

// Reconnect if needed
socket.connect();
```

## Environment Variables

No additional environment variables needed. Socket.IO runs on the same port as the HTTP server (5001).

## Troubleshooting

### Events Not Received
- Check user role and location match room criteria
- Verify JWT token is valid
- Check browser console for connection errors

### High Latency
- Monitor server CPU and memory usage
- Check network latency
- Consider implementing event debouncing on client

### Connection Drops
- Implement automatic reconnection
- Check server logs for errors
- Verify firewall allows WebSocket connections

## Performance Metrics

The SocketService tracks:
- Connected user count
- Users by role
- Event emission count (in logs)

Monitor these metrics in production for performance tuning.
