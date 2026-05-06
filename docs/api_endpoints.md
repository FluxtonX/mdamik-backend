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

**Query Params:**
| Field | Type | Default |
|-------|------|---------|
| `page` | Number | `1` |
| `limit` | Number | `10` |

**Response (200):**
```json
{
  "success": true,
  "data": [ ...projectObjects ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
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

### 5. Calculate Quantities
`GET /projects/calculate?area=200`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "area": 200,
    "units": "m2",
    "recommendations": [
      { "material": "Cement", "quantity": 80, "unit": "bags" },
      { "material": "Sand", "quantity": "20.00", "unit": "m3" }
    ]
  }
}
```

---

### 6. Update Milestone
`PATCH /projects/:projectId/milestones/:milestoneId`

**Body:**
```json
{
  "status": "In Progress",
  "actionRequired": true,
  "actionDesc": "Please approve the foundation design"
}
```

---

## Services (Marketplace)

### 1. Get Materials
`GET /services/materials`

Used to list materials. Can be filtered by category.

**Query Params:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | String | - | Cement, Steel, Sand, Ceramic, etc. |
| `page` | Number | `1` | Pagination page |
| `limit` | Number | `10` | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": [ ...materialObjects ],
  "pagination": { "total": 50, "page": 1, "limit": 10, "pages": 5 }
}
```

---

### 2. Get Professionals
`GET /services/professionals`

Used to list engineers, architects, etc.

**Query Params:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | String | - | Engineer, Architect, Contractor, etc. |
| `page` | Number | `1` | Pagination page |
| `limit` | Number | `10` | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": [ ...professionalObjects ],
  "pagination": { "total": 20, "page": 1, "limit": 10, "pages": 2 }
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

## Payments

> **Headers (Private routes):** `Authorization: Bearer FIREBASE_ID_TOKEN`

---

### 1. Get Supported Currencies
`GET /payments/currencies`

Returns all supported currencies for payment. **No auth required.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "USD": { "code": "usd", "name": "US Dollar",     "symbol": "$",   "stripeSupported": true  },
    "SAR": { "code": "sar", "name": "Saudi Riyal",    "symbol": "﷼",  "stripeSupported": true  },
    "SDG": { "code": "sdg", "name": "Sudanese Pound", "symbol": "ج.س", "stripeSupported": false },
    "EGP": { "code": "egp", "name": "Egyptian Pound", "symbol": "E£",  "stripeSupported": true  },
    "THB": { "code": "thb", "name": "Thai Baht",      "symbol": "฿",  "stripeSupported": true  }
  }
}
```

> ⚠️ **Note:** Sudanese Pound (SDG) is not supported by Stripe. Use `MyFawry` or `COD` gateway for SDG payments.

---

### 2. Initiate Payment
`POST /payments/initiate` *(Private)*

Initiates a payment for an existing transaction using the selected gateway.

**Body:**
```json
{
  "transactionId": "MONGO_OBJECT_ID",
  "gateway": "Stripe",
  "currency": "USD"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `transactionId` | String (MongoID) | ✅ | - |
| `gateway` | String | ✅ | `Stripe`, `MyFawry`, `BangkokBank`, `COD` |
| `currency` | String | ❌ (default: `USD`) | `USD`, `SAR`, `SDG`, `EGP`, `THB` |

**Response (200) — Stripe:**
```json
{
  "success": true,
  "data": { "clientSecret": "pi_xxx_secret_xxx", "id": "pi_xxx", "currency": "usd" },
  "transaction": { ...transactionObject }
}
```

**Response (200) — COD:**
```json
{
  "success": true,
  "message": "Cash on Delivery payment initiated.",
  "data": { "method": "COD", "instructions": "Pay cash upon delivery." },
  "transaction": { ...transactionObject }
}
```

---

### 3. Create Stripe Checkout Session (Web)
`POST /payments/checkout/session` *(Private)*

Creates a Stripe-hosted checkout page URL for web-based payments.

**Body:**
```json
{
  "transactionId": "MONGO_OBJECT_ID",
  "currency": "USD",
  "successUrl": "https://yourapp.com/payment-success",
  "cancelUrl":  "https://yourapp.com/payment-cancel"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId":  "cs_test_xxx",
    "sessionUrl": "https://checkout.stripe.com/pay/cs_test_xxx",
    "currency":   "usd"
  },
  "transaction": { ...transactionObject }
}
```

---

### 4. Confirm COD Payment
`POST /payments/cod/confirm/:transactionId` *(Private)*

Marks a Cash on Delivery transaction as `Completed` after physical delivery.

**Response (200):**
```json
{
  "success": true,
  "message": "COD payment confirmed as completed",
  "transaction": { ...transactionObject, "status": "Completed" }
}
```

---

### 5. Stripe Webhook
`POST /payments/webhook/stripe` *(Public — Stripe servers only)*

Stripe notifies this endpoint of payment events. Secured via **HMAC signature verification**.

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | → `Completed` |
| `payment_intent.payment_failed` | → `Failed` |
| `checkout.session.completed` | → `Completed` |
| `charge.refunded` | → `Refunded` |

> ⚠️ Set `STRIPE_WEBHOOK_SECRET` env variable from Stripe dashboard.

---

### 6. Fawry Webhook
`POST /payments/webhook/fawry` *(Public — Fawry servers only)*

MyFawry notifies this endpoint of payment events. Secured via **HMAC-SHA256 signature** in `x-fawry-signature` header.

**Payload:**
```json
{ "referenceId": "FAWRY-xxx", "status": "PAID" }
```

> ⚠️ Set `FAWRY_WEBHOOK_SECRET` env variable.

---

### 7. Bangkok Bank Webhook
`POST /payments/webhook/bangkokbank` *(Public — Bangkok Bank servers only)*

Bangkok Bank notifies this endpoint. Secured via **HMAC-SHA256 signature** in `x-bkb-signature` header.

**Payload:**
```json
{ "referenceId": "BKB-xxx", "status": "SUCCESS" }
```

> ⚠️ Set `BANGKOK_BANK_WEBHOOK_SECRET` env variable.

---

## Real Estate

### 1. Get Properties
`GET /real-estate`

Used to list properties for buy/sell/rent.

**Query Params:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | String | `All` | Filter by category (Villa, Apartment, etc.) |
| `type` | String | - | `Buy` or `Rent` |
| `location` | String | - | Search by location (partial match) |
| `page` | Number | `1` | Pagination page |
| `limit` | Number | `10` | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": [ ...propertyObjects ],
  "pagination": { "total": 12, "page": 1, "limit": 10, "pages": 2 }
}
```

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

**Query Params:**
| Field | Type | Default |
|-------|------|---------|
| `page` | Number | `1` |
| `limit` | Number | `20` |

**Response (200):**
```json
{
  "success": true,
  "data": [ ...messageObjects ],
  "pagination": { "total": 45, "page": 1, "limit": 20, "pages": 3 }
}
```

---

### 3. Get Conversation List
`GET /chat/conversations`

Returns a list of users you have chatted with, along with the last message.

**Query Params:**
| Field | Type | Default |
|-------|------|---------|
| `page` | Number | `1` |
| `limit` | Number | `10` |

**Response (200):**
```json
{
  "success": true,
  "data": [ ...conversationObjects ],
  "pagination": { "total": 15, "page": 1, "limit": 10, "pages": 2 }
}
```

---

## Notifications

### 1. Get Notifications
`GET /notifications`

**Query Params:**
| Field | Type | Default |
|-------|------|---------|
| `page` | Number | `1` |
| `limit` | Number | `20` |

**Response (200):**
```json
{
  "success": true,
  "data": [ ...notificationObjects ],
  "pagination": { "total": 8, "page": 1, "limit": 20, "pages": 1 }
}
```

---

### 2. Mark as Read
`PATCH /notifications/:id/read`

---

## Management Dashboard

### 1. Get Management Stats
`GET /management/stats`

Used to retrieve summary statistics for the management dashboard.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activeProjects": 3,
    "totalSpent": 45000,
    "teamMembers": 85
  }
}
```

---

### 2. Get Management Projects
`GET /management/projects`

Used to list projects with management-specific details like progress and team count.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Residential Villa",
      "type": "House",
      "progress": 0.65,
      "totalCost": 85000,
      "status": "In Progress",
      "statusType": "On Track",
      "teamCount": 12
    }
  ]
}
```

---

## User Preferences

### 1. Update Preferences
`PATCH /user/preferences`

**Body:**
```json
{
  "language": "ar",
  "region": "Saudi Arabia",
  "theme": "dark"
}
```

---

## Support

### 1. Create Ticket
`POST /support/tickets`

**Body:**
```json
{
  "subject": "Payment issue",
  "message": "I paid via Bangkok Bank but it's not showing",
  "priority": "High"
}
```

---

## Transport & Logistics

### 1. Get Transport Estimate
`GET /transport/estimate`

**Query Params:**
- `weight`: Load weight in tons.
- `loadType`: Material, Equipment, Worker, Waste.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendedVehicle": "Heavy Truck",
    "capacity": 10,
    "estimatedCost": 230,
    "currency": "USD"
  }
}
```

---

### 2. Book Transport
`POST /transport/book`

**Body:**
```json
{
  "projectId": "...",
  "loadType": "Material",
  "weight": 8,
  "pickupAddress": "Warehouse A, Sector 4",
  "deliveryAddress": "Construction Site, Zone 2",
  "vehicleType": "Heavy Truck"
}
```

---

## Security & Verification

### 1. Get Active Sessions
`GET /security/sessions`

Returns all active login sessions for the user.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "device": { "name": "iPhone 14 Pro", "ip": "192.168.1.1" },
      "lastActive": "2026-05-06T12:00:00Z",
      "isActive": true
    }
  ]
}
```

---

### 2. Revoke Session
`DELETE /security/sessions/:sessionId`

**Response (200):**
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

---

### 3. Update Verification
`PATCH /security/verification`

**Body:**
```json
{
  "type": "nationalId",
  "status": true
}
```

---

## System & Configuration

### 1. Get Categories
`GET /system/categories`

Returns all active service categories with icons and descriptions.

---

### 2. Get Service Bundles
`GET /system/bundles`

---

### 3. Get Help Articles
`GET /system/help-articles`

---

## Health Check
`GET /health`

Returns server status.
