# GOV Health Declaration API

Node.js backend for health declaration management with TypeScript, Express.js, and MongoDB.

## Quick Start

```bash
git clone <repository-url>
cd server
cp .env.example .env
npm install
npm test
npm run dev
```

## Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (v5.0+)
- Docker (optional)

### Local Development
```bash
npm install
cp .env.example .env
npm run dev
```

### Docker
```bash
docker build -t gov-backend .
docker run -p 3000:3000 --env-file .env gov-backend
```

## Environment Variables

```bash
PORT=3000
NODE_ENV=development
DB_URL=mongodb://localhost:27017/health-declaration
FRONTEND_URL=http://localhost:5173
```

## Testing

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:coverage
```

**Coverage**: 100% for controllers and services

## API Endpoints

**Base URL**: `http://localhost:3000/api`

### GET /api/health-declaration
Get all health declarations

**Response**:
```json
{
  "success": true,
  "message": "Health declarations retrieved successfully",
  "data": [
    {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "John Doe",
      "temperature": 36.5,
      "symptoms": ["cough", "sore throat"],
      "contactWithInfected": false,
      "createdAt": "2025-06-11T08:30:00.000Z",
      "updatedAt": "2025-06-11T08:30:00.000Z"
    }
  ]
}
```

### POST /api/health-declaration
Create new health declaration

**Request**:
```json
{
  "name": "John Doe",
  "temperature": 36.5,
  "symptoms": ["cough", "sore throat"],
  "contactWithInfected": false
}
```

**Validation**:
- `name`: Required, string, min 2 characters
- `temperature`: Required, number, 30-45°C
- `symptoms`: Required, array, min 1 item
- `contactWithInfected`: Required, boolean

**Response (201)**:
```json
{
  "success": true,
  "message": "Health declaration created successfully",
  "data": {
    "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
    "name": "John Doe",
    "temperature": 36.5,
    "symptoms": ["cough", "sore throat"],
    "contactWithInfected": false,
    "createdAt": "2025-06-11T08:30:00.000Z",
    "updatedAt": "2025-06-11T08:30:00.000Z"
  }
}
```

**Error (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name is required and must be at least 2 characters",
    "Temperature is required and must be between 30-45 degrees"
  ]
}
```

## Project Structure

```
src/
├── index.ts
├── configs/
│   ├── db.config.ts
│   ├── route.config.ts
│   └── server.config.ts
├── controllers/
│   └── health-declaration.controller.ts
├── interface/
│   └── health-declaration.interface.ts
├── middleware/
│   ├── error.middleware.ts
│   ├── logger.middleware.ts
│   ├── notFound.middleware.ts
│   └── validation.middleware.ts
├── models/
│   └── healthDeclaration.ts
├── routes/
│   └── health-declaration.route.ts
├── service/
│   └── health-declaration.service.ts
└── utils/
    └── catchAsync.ts
```

## Available Functions

### Controllers
- `getHealthDeclaration`: Handle GET requests
- `createHealthDeclaration`: Handle POST requests

### Services
- `getHealthDeclarationList()`: Get all declarations from DB
- `createHealthDeclarationItem(data)`: Create new declaration

### Middleware
- `validateHealthDeclaration`: Validate request data
- `globalErrorHandler`: Handle errors
- `requestLogger`: Log HTTP requests
- `notFoundHandler`: Handle 404 errors

### Utils
- `catchAsync(fn)`: Async error wrapper

## Database Schema

```javascript
{
  _id: ObjectId,
  name: String,
  temperature: Number,
  symptoms: [String],
  contactWithInfected: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Build TypeScript
npm run start        # Production server
npm test             # Run all tests
npm run test:unit    # Unit tests only
npm run test:coverage # Coverage report
```

## cURL Examples

```bash
# Get all declarations
curl -X GET http://localhost:3000/api/health-declaration

# Create declaration
curl -X POST http://localhost:3000/api/health-declaration \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "temperature": 36.5,
    "symptoms": ["cough"],
    "contactWithInfected": false
  }'
```

## Error Codes
- `200`: Success
- `201`: Created
- `400`: Validation error
- `404`: Not found
- `500`: Server error
