# Mdamik API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### 1. Register User
`POST /auth/register`

Used to store user profile in MongoDB after successful Firebase registration.

**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "firebaseUid": "UNIQUE_FIREBASE_UID"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { ...userObject }
}
```

---

### 2. Login / Verify
`POST /auth/login`

Used to verify if a user exists in the database and retrieve their profile.

**Body:**
```json
{
  "firebaseUid": "UNIQUE_FIREBASE_UID"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User verified successfully",
  "data": { ...userObject }
}
```

---

### 3. Send OTP
`POST /auth/otp/send`

(In Progress) Triggers an OTP to the user's phone number.

**Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

---

### 4. Verify OTP
`POST /auth/otp/verify`

(In Progress) Verifies the OTP sent to the user.

**Body:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

---

## User

### 1. Get Profile
`GET /user/profile`

Used to retrieve the logged-in user's profile information.

**Headers:**
- `Authorization`: `Bearer FIREBASE_ID_TOKEN`

**Response (200):**
```json
{
  "success": true,
  "data": { ...userObject }
}
```

---

### 2. Update Profile
`PUT /user/profile`

Used to update user details.

**Headers:**
- `Authorization`: `Bearer FIREBASE_ID_TOKEN`

**Body:**
```json
{
  "fullName": "Jane Doe",
  "phoneNumber": "+0987654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ...updatedUserObject }
}
```

---

## Projects

### 1. Create Project
`POST /projects`

Used to create a new construction project.

**Headers:**
- `Authorization`: `Bearer FIREBASE_ID_TOKEN`

**Body:**
```json
{
  "name": "My New House",
  "type": "House",
  "services": ["Engineering", "Materials"],
  "area": 250,
  "materialType": "Concrete",
  "totalCost": 29000,
  "costBreakdown": {
    "materials": 12500,
    "labor": 8200,
    "engineering": 4800,
    "finishing": 3500
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": { ...projectObject }
}
```

---

### 2. Get My Projects
`GET /projects`

Used to list all projects for the logged-in user.

**Headers:**
- `Authorization`: `Bearer FIREBASE_ID_TOKEN`

**Response (200):**
```json
{
  "success": true,
  "data": [ { ...project1 }, { ...project2 } ]
}
```

---

### 3. Get Project Details
`GET /projects/:id`

Used to retrieve detailed information about a specific project.

---

### 4. Update Project Status
`PATCH /projects/:id/status`

Used to update the status of a project (e.g., to 'In Progress').

**Body:**
```json
{
  "status": "In Progress"
}
```

---

## Services (Marketplace)

### 1. Get Materials
`GET /services/materials`

Used to list materials. Can be filtered by category.

**Query Params:**
- `category` (Optional): Cement, Steel, Sand, Ceramic, etc.

**Response (200):**
```json
{
  "success": true,
  "data": [ { "title": "Portland Cement", "price": 12.5, ... } ]
}
```

---

### 2. Get Professionals
`GET /services/professionals`

Used to list engineers, architects, etc.

**Query Params:**
- `type` (Optional): Engineer, Architect, Contractor, etc.

**Response (200):**
```json
{
  "success": true,
  "data": [ { "name": "Eng. Ahmed Ali", "rating": 4.8, ... } ]
}
```

---

## Financials

### 1. Get Project Financials
`GET /financials/:projectId`

Used to retrieve a summary of spending and transactions for a specific project.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalBudget": 112000,
    "totalSpent": 86800,
    "remaining": 25200,
    "categorySpending": [ { "_id": "Materials", "spent": 38250 }, ... ],
    "recentTransactions": [ ... ]
  }
}
```

---

### 2. Record Transaction
`POST /financials/transaction`

Used to record a new expense or payment for a project.

---

## Real Estate

### 1. Get Properties
`GET /real-estate`

Used to list properties for buy/sell/rent.

**Query Params:**
- `category`: Apartment, Villa, Land, Office.
- `type`: Buy, Sell, Rent.
- `location`: Search by location.

---

### 2. Get Property Details
`GET /real-estate/:id`

---

### 3. List Property
`POST /real-estate`

---

## Communication

### 1. Send Message
`POST /chat/messages`

**Body:**
```json
{
  "recipient": "USER_ID",
  "content": "Hello, how are you?"
}
```

---

### 2. Get Messages
`GET /chat/messages/:otherUserId`

---

### 3. Get Conversation List
`GET /chat/conversations`

Returns a list of users you have chatted with, along with the last message.

---

## Notifications

### 1. Get Notifications
`GET /notifications`

---

### 2. Mark as Read
`PATCH /notifications/:id/read`

---

## Health Check
`GET /health`

Returns server status.
