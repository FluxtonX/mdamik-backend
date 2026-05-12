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
  "data": [
    {
      "_id": "...",
      "title": "Portland Cement 50kg",
      "category": "Cement",
      "price": 12.5,
      "unit": "bag",
      "image": "assets/images/project_home_build.png",
      "inStock": true,
      "ui": {
        "image": "assets/images/project_home_build.png",
        "title": "Portland Cement 50kg",
        "price": "$12.50",
        "unit": "bag",
        "category": "Cement",
        "inStock": true
      }
    }
  ],
  "pagination": { "total": 50, "page": 1, "limit": 10, "pages": 5 }
}
```

---

### 2. Cart - Get Current Cart
`GET /services/cart` *(Private)*

Returns the logged-in user's active material cart.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "items": [],
    "subtotal": 0,
    "deliveryFee": 0,
    "total": 0,
    "currency": "USD"
  }
}
```

---

### 3. Cart - Add Item
`POST /services/cart/items` *(Private)*

**Body:**
```json
{
  "materialId": "MONGO_MATERIAL_ID",
  "quantity": 3,
  "projectId": "OPTIONAL_PROJECT_ID"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "items": [
      {
        "_id": "...",
        "materialId": "...",
        "title": "Portland Cement 50kg",
        "category": "Cement",
        "unit": "bag",
        "unitPrice": 12.5,
        "quantity": 3,
        "lineTotal": 37.5
      }
    ],
    "subtotal": 37.5,
    "deliveryFee": 0,
    "total": 37.5,
    "currency": "USD"
  }
}
```

---

### 4. Cart - Update Item Quantity
`PATCH /services/cart/items/:itemId` *(Private)*

**Body:**
```json
{ "quantity": 5 }
```

---

### 5. Cart - Remove Item
`DELETE /services/cart/items/:itemId` *(Private)*

---

### 6. Cart - Clear Cart
`DELETE /services/cart` *(Private)*

---

### 7. Cart - Checkout
`POST /services/cart/checkout` *(Private)*

Creates a material order and a pending transaction. Use returned `transaction._id` in `POST /payments/initiate`.

**Body:**
```json
{
  "projectId": "OPTIONAL_PROJECT_ID",
  "currency": "USD",
  "deliveryFee": 0,
  "clearAfterCheckout": true,
  "deliveryAddress": {
    "fullName": "John Doe",
    "phone": "+249 XXX XXX XXX",
    "email": "john@example.com",
    "address": "Construction Site, Zone 2",
    "notes": "Deliver before noon"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Material order created successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "MAT-...",
      "status": "Pending Payment",
      "total": 37.5,
      "currency": "USD",
      "transactionId": "..."
    },
    "transaction": {
      "_id": "...",
      "title": "Materials Order MAT-...",
      "amount": 37.5,
      "category": "Materials",
      "status": "Pending"
    }
  }
}
```

---

### 8. Get My Material Orders
`GET /services/material-orders` *(Private)*

**Query Params:** `status`, `page`, `limit`

---

### 9. Get Professionals
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

### 10. Get Service Providers
`GET /services/providers`

Used by site services, labor, excavation, engineering, and transport marketplace screens.

**Query Params:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | String | - | `SiteService`, `Labor`, `Engineering`, `Excavation`, `Transport` |
| `serviceType` | String | - | Partial match, e.g. `Security`, `Mason` |
| `skill` | String | - | Exact skill filter, e.g. `Electrician` |
| `status` | String | - | `AvailableNow`, `AvailableSoon`, `Busy`, `Inactive` |
| `availableNow` | Boolean | - | When `true`, only available providers are returned |
| `search` | String | - | Text search across name, service type, and skills |
| `sort` | String | `rating` | `rating`, `distance`, `price`, `jobs` |
| `page` | Number | `1` | Pagination page |
| `limit` | Number | `10` | Max `50` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Clean Services",
      "category": "SiteService",
      "serviceType": "Cleaning Services",
      "skills": ["Cleaning"],
      "price": { "amount": 150, "currency": "USD", "unit": "day" },
      "rating": 4.9,
      "reviews": 234,
      "experienceYears": 8,
      "completedJobs": 456,
      "distanceKm": 2.3,
      "status": "AvailableNow",
      "initials": "CS",
      "isVerified": true,
      "ui": {
        "initials": "CS",
        "name": "Clean Services",
        "title": "Cleaning Services",
        "price": "$150/day",
        "rating": 4.9,
        "reviews": 234,
        "experience": 8,
        "projects": 456,
        "jobs": 456,
        "distance": "2.3 km",
        "status": "AvailableNow"
      }
    }
  ],
  "pagination": { "total": 10, "page": 1, "limit": 10, "pages": 1 }
}
```

---

### 10a. Register Current User as Provider
`POST /services/providers/register` *(Private)*

Used when a laborer, engineer, supplier, or service provider creates their marketplace profile. For labor registration, set `category` to `Labor`.

**Body:**
```json
{
  "category": "Labor",
  "serviceType": "Mason",
  "skills": ["Mason", "Concrete"],
  "price": { "amount": 50, "currency": "USD", "unit": "day" },
  "experienceYears": 4,
  "status": "AvailableNow"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Provider profile saved successfully",
  "data": { "...": "providerObjectWithUi" }
}
```

---

### 11. Get Labor Providers
`GET /services/labor`

Shortcut for `GET /services/providers?category=Labor`.

**Query Example:**
`GET /services/labor?skill=Electrician&availableNow=true&sort=distance`

**Flutter Mapping:**
| Flutter field | API field |
|---------------|-----------|
| `LaborCard.initials` | `item.ui.initials` |
| `LaborCard.name` | `item.ui.name` |
| `LaborCard.skill` | `item.ui.title` |
| `LaborCard.rate` | `item.ui.price` |
| `LaborCard.rating` | `item.ui.rating` |
| `LaborCard.reviews` | `item.ui.reviews` |
| `LaborCard.distance` | `item.ui.distance` |
| `LaborCard.experience` | `item.ui.experience` |
| `LaborCard.jobs` | `item.ui.jobs` |

---

### 11a. Get Engineering Providers
`GET /services/providers?category=Engineering&serviceType=Design%20%26%20Planning`

Use the same provider API for `ProfessionalListView`. The API includes a `ui` object that matches the current Flutter `ProfessionalCard`.

**Flutter Mapping:**
| Flutter field | API field |
|---------------|-----------|
| `ProfessionalCard.initials` | `item.ui.initials` |
| `ProfessionalCard.name` | `item.ui.name` |
| `ProfessionalCard.title` | `item.ui.title` |
| `ProfessionalCard.price` | `item.ui.price` |
| `ProfessionalCard.rating` | `item.ui.rating` |
| `ProfessionalCard.reviews` | `item.ui.reviews` |
| `ProfessionalCard.experience` | `item.ui.experience` |
| `ProfessionalCard.projects` | `item.ui.projects` |

---

### 12. Create Hire Request
`POST /services/hire` *(Private)*

Creates a pending service/labor/provider booking request.

**Headers:**
- `Authorization`: `Bearer FIREBASE_ID_TOKEN`

**Body:**
```json
{
  "providerId": "MONGO_PROVIDER_ID",
  "projectId": "OPTIONAL_PROJECT_ID",
  "serviceType": "Security Services",
  "scheduleType": "OneTime",
  "startDate": "2026-05-20T09:00:00.000Z",
  "quantity": { "value": 2, "unit": "day" },
  "location": { "address": "Construction Site, Zone 2" },
  "notes": "Day shift only"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "_id": "...",
    "status": "Pending",
    "estimatedCost": 400,
    "currency": "USD",
    "providerId": { "...": "providerObject" }
  }
}
```

---

### 13. Get My Hire Requests
`GET /services/hire-requests` *(Private)*

**Query Params:** `status`, `page`, `limit`

---

### 14. Get Excavation Options
`GET /services/excavation/options`

Returns excavation types and soil types for the excavation flow.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "excavationTypes": [
      { "key": "Foundation Excavation", "desc": "For building footings" }
    ],
    "soilTypes": [
      { "key": "Mixed Soil", "desc": "Medium cost - Moderate", "ratePerM3": 15 }
    ]
  }
}
```

---

### 15. Create Excavation Estimate
`POST /services/excavation/estimate`

Calculates excavation volume and cost. If called with auth and `persist: true`, the estimate is saved.

**Optional Headers:**
- `Authorization`: `Bearer FIREBASE_ID_TOKEN` (required only when saving with `persist: true`)

**Body:**
```json
{
  "projectId": "OPTIONAL_PROJECT_ID",
  "length": 10,
  "width": 8,
  "depth": 3,
  "excavationType": "Foundation Excavation",
  "soilType": "Mixed Soil",
  "persist": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dimensions": { "length": 10, "width": 8, "depth": 3 },
    "volume": 240,
    "excavationType": "Foundation Excavation",
    "soilType": "Mixed Soil",
    "ratePerM3": 15,
    "totalEstimate": 3600,
    "currency": "USD"
  }
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

### 2. Get Payment Methods
`GET /payments/methods`

Returns payment methods and exact labels/values for Flutter.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "gateway": "MyFawry",
      "label": "MyFawry",
      "frontendValues": ["MyFawry", "My Fawry"],
      "supportedCurrencies": ["SDG", "EGP", "USD"],
      "description": "Pay with MyFawry app"
    },
    {
      "gateway": "COD",
      "label": "Cash",
      "frontendValues": ["Cash", "COD", "Cash on Delivery"],
      "supportedCurrencies": ["SDG", "USD", "SAR"],
      "description": "Pay with cash on delivery"
    },
    {
      "gateway": "BangkokBank",
      "label": "Bangkok Bank",
      "frontendValues": ["Bangkok Bank", "BangkokBank"],
      "supportedCurrencies": ["USD", "THB", "SDG"],
      "description": "Pay with Bangkok Bank app"
    }
  ]
}
```

**Frontend Note:** `POST /payments/initiate` accepts both backend gateway values (`COD`, `BangkokBank`) and current Flutter labels (`Cash`, `Bangkok Bank`).

---

### 3. Initiate Payment
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
| `gateway` | String | ✅ | `Stripe`, `MyFawry`, `BangkokBank`, `COD`, `Cash`, `Bangkok Bank` |
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
| `minPrice` | Number | - | Minimum price |
| `maxPrice` | Number | - | Maximum price |
| `bedrooms` | String | - | `1`, `2`, `3`, `4+` |
| `minBedrooms` | Number | - | Minimum bedrooms |
| `search` | String | - | Text search |
| `sort` | String | `newest` | `newest`, `priceAsc`, `priceDesc`, `rating` |
| `page` | Number | `1` | Pagination page |
| `limit` | Number | `10` | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Modern Villa",
      "price": 285000,
      "location": "Downtown",
      "category": "Villa",
      "type": "Buy",
      "rating": 4.8,
      "bedrooms": 4,
      "bathrooms": 3,
      "area": { "value": 3200, "unit": "sqft" },
      "yearBuilt": 2021,
      "features": ["Smart Home Technology", "Gourmet Kitchen"],
      "agent": { "name": "Sarah Johnson", "title": "Senior Real Estate Agent", "initials": "SJ" },
      "isFavorite": false,
      "ui": {
        "image": "assets/images/property_villa.png",
        "price": "$285,000",
        "rating": 4.8,
        "title": "Modern Villa",
        "location": "Downtown",
        "beds": 4,
        "baths": 3,
        "area": 3200,
        "areaUnit": "sqft",
        "built": 2021,
        "agent": { "name": "Sarah Johnson", "title": "Senior Real Estate Agent", "initials": "SJ" }
      }
    }
  ],
  "pagination": { "total": 12, "page": 1, "limit": 10, "pages": 2 }
}
```

---

### 2. Get Property Details
`GET /real-estate/:id`

---

### 3. List Property
`POST /real-estate`

**Body:**
```json
{
  "title": "Modern Villa",
  "description": "Beautiful smart home with pool",
  "price": 285000,
  "location": "Downtown",
  "address": "Street 10, Downtown",
  "category": "Villa",
  "type": "Buy",
  "rating": 4.8,
  "bedrooms": 4,
  "bathrooms": 3,
  "area": { "value": 3200, "unit": "sqft" },
  "yearBuilt": 2021,
  "features": ["Smart Home Technology", "Gourmet Kitchen"],
  "images": ["assets/images/property_villa.png"],
  "agent": {
    "name": "Sarah Johnson",
    "title": "Senior Real Estate Agent",
    "initials": "SJ",
    "phone": "+249000000000",
    "email": "agent@example.com"
  }
}
```

---

### 4. Toggle Favorite
`POST /real-estate/:id/favorite` *(Private)*

Adds property to favorites if not present, otherwise removes it.

**Response (200):**
```json
{
  "success": true,
  "data": { "propertyId": "...", "isFavorite": true }
}
```

---

### 5. Get Favorite Properties
`GET /real-estate/favorites` *(Private)*

**Query Params:** `page`, `limit`

---

### 6. Create Property Inquiry
`POST /real-estate/:id/inquiries` *(Private)*

Used for `Schedule Tour`, `Make Offer`, `Send Message`, and `Call Agent` actions.

**Body:**
```json
{
  "type": "Tour",
  "preferredDate": "2026-05-20T10:00:00.000Z",
  "offeredPrice": 280000,
  "message": "Morning tour please",
  "contact": {
    "fullName": "John Doe",
    "phone": "+249 XXX XXX XXX",
    "email": "john@example.com"
  }
}
```

| Field | Values |
|-------|--------|
| `type` | `Tour`, `Offer`, `Message`, `CallRequest` |

---

### 7. Get My Property Inquiries
`GET /real-estate/inquiries` *(Private)*

**Query Params:** `status`, `type`, `page`, `limit`

---

## Communication

### Real-time Chat Socket

Socket URL: `ws://localhost:5000`

Client connects with auth:

```js
io("http://localhost:5000", {
  auth: { token: "FIREBASE_ID_TOKEN" }
});
```

In the current dev backend, `token` is the user's `firebaseUid`.

**Events:**

| Direction | Event | Payload |
|-----------|-------|---------|
| client -> server | `message:send` | `{ "recipient": "USER_ID", "content": "Hello", "clientMessageId": "local-uuid" }` |
| server -> client | `message:new` | `{ "message": { ...messageObjectWithUi } }` |
| server -> sender | `message:sent` | `{ "clientMessageId": "local-uuid", "message": { ...messageObjectWithUi } }` |
| client -> server | `message:read` | `{ "otherUserId": "USER_ID" }` |
| server -> client | `message:read` | `{ "byUserId": "USER_ID", "modifiedCount": 3 }` |
| client -> server | `typing:start` | `{ "recipient": "USER_ID" }` |
| client -> server | `typing:stop` | `{ "recipient": "USER_ID" }` |
| server -> client | `typing:start` / `typing:stop` | `{ "userId": "USER_ID" }` |
| server -> client | `notification:new` | notification object |
| server -> client | `presence:update` | `{ "userId": "USER_ID", "isOnline": true }` |

Messages are permanently stored in MongoDB unless an admin retention policy is added later. Use REST APIs below for history, pagination, reconnect recovery, and fallback.

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
  "data": [
    {
      "_id": "...",
      "sender": "...",
      "recipient": "...",
      "content": "Hello",
      "isRead": true,
      "ui": {
        "message": "Hello",
        "time": "10:30 AM",
        "isMe": true
      }
    }
  ],
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
  "data": [
    {
      "_id": "OTHER_USER_ID",
      "lastMessage": "I'll send the estimate by tomorrow",
      "lastTime": "2026-05-12T10:00:00.000Z",
      "unreadCount": 2,
      "userName": "Ahmed Hassan",
      "ui": {
        "initials": "AH",
        "color": "#F28B22",
        "name": "Ahmed Hassan",
        "message": "I'll send the estimate by tomorrow",
        "time": "2m ago",
        "unreadCount": 2,
        "isOnline": false
      }
    }
  ],
  "pagination": { "total": 15, "page": 1, "limit": 10, "pages": 2 }
}
```

---

### 4. Mark Conversation Read
`PATCH /chat/conversations/:otherUserId/read`

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
  "data": [
    {
      "_id": "...",
      "title": "Payment Received",
      "message": "Your payment has been confirmed",
      "type": "Financial",
      "priority": "High",
      "isRead": false,
      "ui": {
        "title": "Payment Received",
        "desc": "Your payment has been confirmed",
        "time": "2h ago",
        "icon": "check_circle_outline",
        "isImportant": true,
        "hasUnread": true
      }
    }
  ],
  "pagination": { "total": 8, "page": 1, "limit": 20, "pages": 1 }
}
```

---

### 2. Mark as Read
`PATCH /notifications/:id/read`

---

### 3. Mark All as Read
`PATCH /notifications/read-all`

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

**Query Params:** `status` (`In Progress`, `Completed`, `All`), `page`, `limit`

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
      "spent": 55250,
      "remaining": 29750,
      "status": "In Progress",
      "statusType": "On Track",
      "teamCount": 12,
      "currentMilestone": { "...": "milestoneObject" },
      "ui": {
        "title": "Residential Villa - Phase 1",
        "type": "House",
        "subtitle": "House - Phase 1",
        "progress": 0.65,
        "progressPercent": 65,
        "budget": "$85k",
        "spent": "$55k",
        "teamCount": 12,
        "status": "On Track",
        "statusColor": "#00B16A",
        "daysRemaining": 45,
        "currentMilestone": {
          "title": "Foundation & Structure",
          "progress": 0.75,
          "progressPercent": 75,
          "targetDate": "2026-05-15T00:00:00.000Z",
          "status": "In Progress"
        },
        "pendingAction": {
          "title": "Pending Action Required",
          "description": "Material delivery approval needed for next phase",
          "type": "Material"
        },
        "teamPreview": [
          { "initials": "M1", "name": "Member One", "role": "Engineer" }
        ]
      }
    }
  ]
}
```

---

### 3. Get Management Project Details
`GET /management/projects/:id`

Returns the same `ui` contract as project cards, plus full milestones, team members, pending actions, budget, and spending data.

---

### 4. Add Team Member
`POST /management/projects/:id/team`

**Body:**
```json
{
  "name": "Member Three",
  "role": "Architect",
  "initials": "M3",
  "phone": "+249 XXX XXX XXX",
  "email": "member@example.com"
}
```

---

### 5. Create Project Action
`POST /management/projects/:id/actions`

**Body:**
```json
{
  "title": "Pending Action Required",
  "description": "Material delivery approval needed for next phase",
  "type": "Material",
  "dueDate": "2026-05-20T00:00:00.000Z"
}
```

| `type` values |
|---------------|
| `Approval`, `Payment`, `Material`, `Inspection`, `General` |

---

### 6. Resolve Project Action
`PATCH /management/projects/:id/actions/:actionId`

**Body:**
```json
{ "status": "Resolved" }
```

Allowed statuses: `Resolved`, `Dismissed`, `Pending`.

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

### 2. Update Security Settings
`PATCH /user/security-settings`

**Body:**
```json
{
  "twoFactorEnabled": true,
  "twoFactorMethod": "SMS"
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
  "priority": "High",
  "category": "Payments"
}
```

---

### 2. Get My Tickets
`GET /support/tickets`

**Query Params:** `status`, `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "ticketNumber": "TKT-1847",
      "subject": "Payment not processed",
      "status": "In Progress",
      "priority": "High",
      "ui": {
        "title": "Payment not processed",
        "id": "TKT-1847 - Today, 11:30 AM",
        "status": "In Progress",
        "statusColor": "#F28B22"
      }
    }
  ]
}
```

---

### 3. Add Ticket Reply
`POST /support/tickets/:ticketId/replies`

**Body:**
```json
{ "message": "Adding more details about the issue" }
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
      "device": { "name": "iPhone 14 Pro", "ip": "192.168.1.1", "location": "New York, USA" },
      "lastActive": "2026-05-06T12:00:00Z",
      "isActive": true,
      "ui": {
        "name": "iPhone 14 Pro",
        "details": "New York, USA - Active now",
        "isActive": true,
        "os": "iOS"
      }
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

**Response Shape:**
```json
{
  "success": true,
  "data": [
    {
      "id": "materials",
      "label": "Materials",
      "icon": "layers",
      "desc": "Construction supplies",
      "routeName": "/materials"
    }
  ]
}
```

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
