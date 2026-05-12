# Frontend Integration Guide

Base URL: `http://localhost:5000/api`

Use `Authorization: Bearer FIREBASE_ID_TOKEN` for private routes. In the current dev backend, the token is treated as `firebaseUid`.

## Phase 2 Screen Contracts

### Home Categories

Use: `GET /system/categories`

Flutter can map:

| Widget field | API field |
|--------------|-----------|
| `_CategoryItem.label` | `label` |
| `_CategoryItem.subtitle` | `desc` |
| `Navigator.pushNamed` | `routeName` |
| Icon lookup | `icon` |

### Labor Hiring

Use: `GET /services/labor?skill=All&page=1&limit=20`

When user selects a skill, pass `skill=Mason`, `skill=Electrician`, etc. Do not send `skill=All` if you want all records.

Map `item.ui` directly:

| Flutter field | API field |
|---------------|-----------|
| `initials` | `item.ui.initials` |
| `name` | `item.ui.name` |
| `skill` | `item.ui.title` |
| `rate` | `item.ui.price` |
| `rating` | `item.ui.rating` |
| `reviews` | `item.ui.reviews` |
| `distance` | `item.ui.distance` |
| `experience` | `item.ui.experience` |
| `jobs` | `item.ui.jobs` |
| `status` | `item.ui.status` |

Status mapping:

| API status | Flutter enum |
|------------|--------------|
| `AvailableNow` | `LaborStatus.availableNow` |
| `AvailableSoon` | `LaborStatus.availableSoon` |
| `Busy` | `LaborStatus.busy` |

### Engineering Professionals

Use: `GET /services/providers?category=Engineering&serviceType=Design%20%26%20Planning`

Supported current serviceType values:

| Engineering card | Query value |
|------------------|-------------|
| Design & Planning | `Design & Planning` |
| Cost Estimation | `Cost Estimation` |
| Supervision | `Site Supervision` |
| Consultation | `Expert Consultation` |
| Execution / PM | `Project Execution / PM` |
| Turnkey Projects | `Turnkey Projects` |
| Finishing Design | `Finishing & Interior Design` |

Map `ProfessionalCard` from `item.ui`.

### Site Services

Use: `GET /services/providers?category=SiteService&serviceType=Security`

For the existing `SiteServicesListView`, map provider cards from `item.ui`. Use `POST /services/hire` for `Hire Now`.

### Excavation

Use:

- `GET /services/excavation/options`
- `POST /services/excavation/estimate`
- `GET /services/providers?category=Excavation&serviceType=Foundation%20Excavation`

Estimate body:

```json
{
  "length": 10,
  "width": 8,
  "depth": 3,
  "excavationType": "Foundation Excavation",
  "soilType": "Mixed Soil",
  "persist": false
}
```

### Payment Options

Use:

- `GET /payments/methods`
- `GET /payments/currencies`
- `POST /financials/transaction`
- `POST /payments/initiate`

The current Flutter labels are accepted by the backend:

| Flutter value | Backend gateway |
|---------------|-----------------|
| `MyFawry` | `MyFawry` |
| `Cash` | `COD` |
| `Bangkok Bank` | `BangkokBank` |

Recommended flow:

1. Create a transaction with `POST /financials/transaction`.
2. Send returned transaction `_id` to `POST /payments/initiate`.
3. For `COD`, show success after backend returns `status: Processing`.
4. For app gateway placeholders, open/use returned `paymentUrl` or show reference instructions.

## Phase 3 Materials, Cart, And Payment

### Materials Grid

Use: `GET /services/materials?category=Cement&page=1&limit=20`

Map `MaterialCard` from `item.ui`:

| Flutter field | API field |
|---------------|-----------|
| `image` | `item.ui.image` |
| `title` | `item.ui.title` |
| `price` | `item.ui.price` |
| `unit` | `item.ui.unit` |

For `Add to Cart`, call:

`POST /services/cart/items`

```json
{
  "materialId": "MONGO_MATERIAL_ID",
  "quantity": 1,
  "projectId": "OPTIONAL_PROJECT_ID"
}
```

### Project Calculator Add To Cart

Current calculator can still use:

`GET /projects/calculate?area=200`

After receiving recommended quantities, frontend should match each recommendation to material category and call `POST /services/cart/items` for each selected material.

### Cart Screen

Use:

- `GET /services/cart`
- `PATCH /services/cart/items/:itemId`
- `DELETE /services/cart/items/:itemId`
- `DELETE /services/cart`

Cart response has:

```json
{
  "items": [
    {
      "_id": "CART_ITEM_ID",
      "materialId": "MATERIAL_ID",
      "title": "Portland Cement 50kg",
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
```

### Checkout To Payment

Recommended Flutter flow:

1. User taps cart checkout/proceed.
2. Collect delivery fields from `PaymentInfoView`.
3. Call `POST /services/cart/checkout`.
4. Store returned `order._id`, `order.orderNumber`, and `transaction._id`.
5. Call `POST /payments/initiate` with `transactionId`.
6. Use returned payment data on processing/success screens.

Checkout request:

```json
{
  "currency": "SDG",
  "deliveryAddress": {
    "fullName": "abc",
    "phone": "+249 02358585775",
    "email": "abc@gmail.com",
    "address": "Abc",
    "notes": "Abc"
  }
}
```

Checkout response:

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "ORDER_ID",
      "orderNumber": "MAT-...",
      "status": "Pending Payment",
      "total": 24000,
      "currency": "SDG"
    },
    "transaction": {
      "_id": "TRANSACTION_ID",
      "amount": 24000,
      "status": "Pending"
    }
  }
}
```

Payment initiate request:

```json
{
  "transactionId": "TRANSACTION_ID",
  "gateway": "Cash",
  "currency": "SDG",
  "billingDetails": {
    "fullName": "abc",
    "phone": "+249 02358585775",
    "email": "abc@gmail.com",
    "address": "Abc",
    "notes": "Abc"
  }
}
```

## Phase 4 Real Estate

### Property List

Use: `GET /real-estate?type=Buy&category=Villa&minPrice=50000&maxPrice=500000&bedrooms=4%2B`

Map `PropertyCard` from `item.ui`:

| Flutter field | API field |
|---------------|-----------|
| `image` | `item.ui.image` |
| `price` | `item.ui.price` |
| `rating` | `item.ui.rating` |
| `title` | `item.ui.title` |
| `location` | `item.ui.location` |

For tab mapping:

| Flutter tab | API `type` |
|-------------|------------|
| Buy | `Buy` |
| Sell | `Sell` |
| Rent | `Rent` |

For filter sheet:

| Flutter filter | API query |
|----------------|-----------|
| Price Range | `minPrice`, `maxPrice` |
| Property Type | `category` |
| Bedrooms | `bedrooms` |

### Property Details

Use: `GET /real-estate/:id`

Map details:

| Flutter field | API field |
|---------------|-----------|
| Header image | `data.ui.image` |
| Title | `data.ui.title` |
| Location | `data.ui.location` |
| Price | `data.ui.price` |
| Rating | `data.ui.rating` |
| Beds | `data.ui.beds` |
| Baths | `data.ui.baths` |
| Area | `data.ui.area` |
| Built | `data.ui.built` |
| Overview | `data.description` |
| Features tab | `data.features` |
| Agent card | `data.ui.agent` |
| Favorite icon | `data.isFavorite` |

### Favorite Button

Use: `POST /real-estate/:id/favorite`

Response:

```json
{
  "success": true,
  "data": { "propertyId": "PROPERTY_ID", "isFavorite": true }
}
```

### Schedule Tour And Make Offer

Use: `POST /real-estate/:id/inquiries`

Schedule tour:

```json
{
  "type": "Tour",
  "preferredDate": "2026-05-20T10:00:00.000Z",
  "message": "Morning tour please",
  "contact": {
    "fullName": "John Doe",
    "phone": "+249 XXX XXX XXX"
  }
}
```

Make offer:

```json
{
  "type": "Offer",
  "offeredPrice": 280000,
  "message": "Ready to discuss this offer",
  "contact": {
    "fullName": "John Doe",
    "phone": "+249 XXX XXX XXX",
    "email": "john@example.com"
  }
}
```

Agent buttons:

| Button | Inquiry `type` |
|--------|----------------|
| Call Agent | `CallRequest` |
| Send Message | `Message` |

## Phase 5 Management And Project Details

### Management Dashboard Stats

Use: `GET /management/stats`

Map top cards:

| Flutter stat | API field |
|--------------|-----------|
| Active Projects | `data.ui.activeProjects` |
| Total Spent | `data.ui.totalSpent` |
| Team Members | `data.ui.teamMembers` |
| Attention banner title | `data.ui.attentionMessage` |
| Attention banner text | `data.ui.attentionDescription` |

`totalSpent` is calculated from real `Transaction` records, not from project budget.

### Active Project Cards

Use: `GET /management/projects?status=In%20Progress&page=1&limit=10`

Map `_ActiveProjectCard` from `item.ui`:

| Flutter field | API field |
|---------------|-----------|
| `title` | `item.ui.title` |
| `type` | `item.ui.type` |
| `progress` | `item.ui.progress` |
| `budget` | `item.ui.budget` |
| `spent` | `item.ui.spent` |
| `teamCount` | `item.ui.teamCount` |
| `status` | `item.ui.status` |
| status color | `item.ui.statusColor` |

On card tap, pass project id to:

`GET /management/projects/:id`

### Management Details Screen

Use detail response from `GET /management/projects/:id`.

Map:

| Flutter area | API field |
|--------------|-----------|
| AppBar title | `data.ui.title` |
| AppBar subtitle | `data.ui.subtitle` |
| Overall progress | `data.ui.progress`, `data.ui.progressPercent` |
| Status chip | `data.ui.status`, `data.ui.statusColor` |
| Spent stat | `data.ui.spent` |
| Team stat | `data.ui.teamCount` |
| Days stat | `data.ui.daysRemaining` |
| Current milestone title | `data.ui.currentMilestone.title` |
| Current milestone progress | `data.ui.currentMilestone.progress` |
| Target date | `data.ui.currentMilestone.targetDate` |
| Team avatars | `data.ui.teamPreview` |
| Pending action banner | `data.ui.pendingAction` |

### Team And Actions

Add team member:

`POST /management/projects/:id/team`

```json
{
  "name": "Member Three",
  "role": "Architect",
  "initials": "M3"
}
```

Create pending action:

`POST /management/projects/:id/actions`

```json
{
  "title": "Pending Action Required",
  "description": "Material delivery approval needed for next phase",
  "type": "Material",
  "dueDate": "2026-05-20T00:00:00.000Z"
}
```

Resolve/dismiss action:

`PATCH /management/projects/:id/actions/:actionId`

```json
{ "status": "Resolved" }
```

## Phase 6 Chat, Notifications, Profile, Support, Security

### Chat List

For production real-time chat, connect Socket.IO once after login:

```dart
// package suggestion: socket_io_client
IO.io(
  baseUrl,
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .setAuth({'token': firebaseUidOrIdToken})
    .build(),
);
```

Listen for:

- `message:new`
- `message:sent`
- `message:read`
- `typing:start`
- `typing:stop`
- `notification:new`
- `presence:update`

Use REST APIs below for initial history, pagination, and reconnect recovery.

Use: `GET /chat/conversations`

Map `_ChatListItem` from `item.ui`:

| Flutter field | API field |
|---------------|-----------|
| `initials` | `item.ui.initials` |
| `name` | `item.ui.name` |
| `message` | `item.ui.message` |
| `time` | `item.ui.time` |
| `unreadCount` | `item.ui.unreadCount` |

On tap, pass `item._id` to conversation route and fetch:

`GET /chat/messages/:otherUserId`

### Chat Conversation

Map `_ChatBubble` from message `ui`:

| Flutter field | API field |
|---------------|-----------|
| `message` | `item.ui.message` |
| `time` | `item.ui.time` |
| `isMe` | `item.ui.isMe` |

Send message:

```json
POST /chat/messages
{
  "recipient": "OTHER_USER_ID",
  "content": "Hello"
}
```

The backend creates a `Chat` notification for the recipient.

### Notifications

Use: `GET /notifications`

Map `_NotificationItem` from `item.ui`:

| Flutter field | API field |
|---------------|-----------|
| `title` | `item.ui.title` |
| `desc` | `item.ui.desc` |
| `time` | `item.ui.time` |
| `icon` | `item.ui.icon` |
| `isImportant` | `item.ui.isImportant` |
| `hasUnread` | `item.ui.hasUnread` |

Actions:

- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

### Profile

Use: `GET /user/profile`

Profile card maps from `data.ui`:

| Flutter field | API field |
|---------------|-----------|
| initials | `data.ui.initials` |
| name | `data.ui.name` |
| member since | `data.ui.memberSince` |
| verification label | `data.ui.verificationLabel` |
| progress bar | `data.ui.verificationProgress` |

Update profile:

```json
PUT /user/profile
{
  "fullName": "John Doe",
  "phoneNumber": "+249 XXX XXX XXX",
  "location": "New York, USA",
  "profileRole": "Contractor"
}
```

Update security settings:

```json
PATCH /user/security-settings
{
  "twoFactorEnabled": true,
  "twoFactorMethod": "SMS"
}
```

### Support

Create ticket:

```json
POST /support/tickets
{
  "subject": "Payment not processed",
  "message": "Payment is missing from dashboard",
  "priority": "High",
  "category": "Payments"
}
```

Use `GET /support/tickets` for My Tickets. Map `_TicketItem` from `item.ui`.

### Security Sessions

Use: `GET /security/sessions`

Map session cards from `item.ui`:

| Flutter field | API field |
|---------------|-----------|
| name | `item.ui.name` |
| details | `item.ui.details` |
| active dot | `item.ui.isActive` |

Revoke:

`DELETE /security/sessions/:sessionId`
