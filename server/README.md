# BloodBridge Backend

Express.js + TypeScript + MongoDB backend for BloodBridge - An AI-powered intelligent blood supply coordination network.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB (Atlas or local instance)
- Git

### Installation

1. Clone the repository and navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodbridge
JWT_SECRET=your-32-character-minimum-secret-key
JWT_REFRESH_SECRET=your-32-character-minimum-refresh-key
FRONTEND_URL=http://localhost:3000
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Build and start the server:

```bash
npm run build
npm start
```

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── types/           # TypeScript type definitions
│   ├── models/          # Mongoose schemas
│   ├── middleware/      # Express middleware
│   ├── utils/           # Helper functions and utilities
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── __tests__/           # Test files
├── .env.example         # Environment variables template
├── jest.config.js       # Jest configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Response Format

#### Success Response

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

#### Error Response

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

### Key Endpoints

#### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

#### Hospital Management

- `GET /api/v1/hospitals` - List all hospitals
- `POST /api/v1/hospitals` - Create hospital
- `GET /api/v1/hospitals/:id` - Get hospital details
- `GET /api/v1/hospitals/:id/inventory` - Get hospital blood inventory

#### Blood Inventory

- `GET /api/v1/blood-inventory` - List all inventory
- `POST /api/v1/blood-inventory` - Add blood units
- `GET /api/v1/blood-inventory/:id` - Get inventory details
- `POST /api/v1/blood-inventory/:id/transfer` - Transfer blood

#### Blood Requests

- `POST /api/v1/blood-requests` - Create blood request
- `GET /api/v1/blood-requests` - List requests
- `GET /api/v1/blood-requests/:id` - Get request details
- `PUT /api/v1/blood-requests/:id/status` - Update request status

#### Emergency Requests

- `POST /api/v1/emergency-requests` - Create emergency request
- `GET /api/v1/emergency-requests` - List emergency requests
- `GET /api/v1/emergency-requests/:id/matches` - Find matching sources

#### Donations

- `POST /api/v1/appointments` - Book donation appointment
- `GET /api/v1/appointments/:donorId` - Get donor appointments
- `PUT /api/v1/appointments/:id` - Update appointment

#### AI Predictions

- `GET /api/v1/predictions/blood-shortage` - Get shortage predictions
- `GET /api/v1/predictions/demand-forecast` - Get demand forecast
- `GET /api/v1/predictions/expiry-risk` - Get expiry risk analysis

#### Analytics

- `GET /api/v1/analytics/dashboard` - System-wide statistics
- `GET /api/v1/analytics/blood-supply-map` - Blood supply heatmap
- `GET /api/v1/analytics/demand-map` - Blood demand heatmap

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

## Code Quality

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

### Type Checking

```bash
npm run typecheck
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `FRONTEND_URL` - Frontend URL for CORS
- `LOG_LEVEL` - Logging level (debug/info/warn/error)

## Database

### MongoDB Connection

The application connects to MongoDB using Mongoose. Connection details are configured via `MONGODB_URI` environment variable.

### Collections

- `users` - User accounts
- `hospitals` - Hospital institutions
- `bloodbanks` - Blood bank institutions
- `donors` - Donor profiles
- `bloods` - Blood inventory records
- `bloodrequests` - Blood request records
- `emergencyrequests` - Emergency request records
- `appointments` - Donation appointments
- `predictions` - AI prediction results
- `transactions` - Blood transfer transactions
- `notifications` - Notification records

## Authentication Flow

### Login

1. User sends credentials to `/auth/login`
2. Server validates and creates JWT access token + refresh token
3. Client stores access token in memory, refresh token in secure cookie
4. Client includes access token in Authorization header for protected routes

### Token Refresh

1. Access token expires
2. Client sends refresh token to `/auth/refresh-token`
3. Server validates and generates new access token
4. Client updates Authorization header

## Error Handling

The application uses custom error classes for consistent error handling:

- `ValidationError` (400) - Input validation failed
- `AuthenticationError` (401) - Invalid credentials or token
- `AuthorizationError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflict
- `InternalServerError` (500) - Server error

All errors are caught by the global error handler and returned in standardized format.

## Logging

Winston is used for structured logging. Logs are written to:

- Console (in development)
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are signed with HS256 algorithm
- CORS is configured to only allow requests from specified frontend URL
- Rate limiting can be enabled via environment variables
- Environment variables should never be committed to repository
- Use HTTPS in production

## Performance Optimization

- Database queries use pagination
- Indexes created on frequently queried fields
- Query results are lean when write operations aren't needed
- Geographic queries use 2dsphere indexes
- Caching can be enabled via Redis

## Deployment

### Heroku

```bash
npm install -g heroku-cli
heroku create your-app-name
git push heroku main
```

### Docker

```bash
docker build -t bloodbridge-backend .
docker run -p 5000:5000 --env-file .env bloodbridge-backend
```

### Environment Variables

Ensure all required environment variables are set in your deployment platform:

- MONGODB_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- FRONTEND_URL
- NODE_ENV=production

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linting and tests
5. Create a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the development team.
