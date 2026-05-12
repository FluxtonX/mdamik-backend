# Mdamik Project Overview

This document gives a full high-level overview of the Mdamik system, its major features, user roles, backend modules, and how the Flutter frontend should integrate with the Node.js backend.

## System Summary

Mdamik is a construction and property services platform. The Flutter mobile app provides the user interface, while the Node.js backend provides APIs, database persistence, business logic, real-time chat, notifications, payments, project management, service marketplace, and documentation contracts for frontend integration.

Backend base URL:

```text
http://localhost:5000/api
```

Private APIs use:

```text
Authorization: Bearer FIREBASE_ID_TOKEN
```

In the current development backend, this token is treated as the user's `firebaseUid`. Production should verify Firebase ID tokens properly before launch.

## Main User Roles

The system supports multiple user types:

- Client / Owner: can buy materials, hire labor, request services, manage projects, chat with providers, and create support tickets.
- Labor / Worker / Freelancer: can register as a service provider, receive hire requests, and chat with clients.
- Engineer / Contractor / Service Provider: can list services, receive hire requests, and communicate with clients.
- Supplier: can provide construction materials and communicate with buyers.
- Real Estate Agent / Owner: can list properties and receive property inquiries.
- Admin / Support: can handle support tickets, notifications, and operational workflows.

## Core Backend Technologies

- Node.js and Express for REST APIs.
- MongoDB with Mongoose for persistent storage.
- Socket.IO for real-time chat, typing indicators, read receipts, and online presence.
- Firebase-style authentication contract for user identity.
- Jest and Supertest for backend API test coverage.
- Modular controllers, routes, models, services, validators, and docs for scalable backend development.

## Feature Modules

## 1. Authentication And User Profile

Users can register, login/verify, manage their profile, and update security preferences.

Main capabilities:

- Register user profile after Firebase signup.
- Login/verify user by Firebase UID.
- Store profile role, phone number, location, avatar, and profile metadata.
- Update notification/security preferences.
- Return frontend-ready `ui` objects where needed.

Important APIs:

- `POST /auth/register`
- `POST /auth/login`
- `GET /user/profile`
- `PATCH /user/profile`
- `PATCH /user/security-settings`

## 2. Services Marketplace

The backend supports service providers for construction-related services. Flutter can fetch provider cards using API `ui` fields instead of hardcoded frontend data.

Supported service areas:

- Labor hiring
- Engineering professionals
- Site services
- Excavation services
- Construction service providers

Main capabilities:

- List providers by category, service type, skill, rating, price, and availability.
- Register a logged-in user as a service provider or labor provider.
- Create hire requests from clients to providers.
- Track provider experience, jobs, ratings, status, and display fields.

Important APIs:

- `GET /services/providers`
- `GET /services/labor`
- `POST /services/providers/register`
- `POST /services/hire`
- `GET /services/hire/my`

## 3. Labor Registration

Labor can register in the system. A user first registers normally, then creates a provider profile with category `Labor`.

Recommended flow:

1. User signs up through Firebase/frontend.
2. Frontend calls `POST /auth/register` with `profileRole` such as `Worker` or `Freelancer`.
3. User completes labor profile through `POST /services/providers/register`.
4. Labor appears in `GET /services/labor`.
5. Client can send hire request and start chat.

Labor registration stores:

- Skill or service type
- Price/rate
- Experience years
- Availability status
- Location and distance metadata
- Rating/reviews/jobs display data

## 4. Excavation Estimates

The system calculates excavation estimates based on dimensions, excavation type, and soil type.

Main capabilities:

- Fetch excavation options.
- Calculate estimate from length, width, depth, excavation type, and soil type.
- Optionally persist estimate for authenticated users.
- Connect estimate screen to excavation providers.

Important APIs:

- `GET /services/excavation/options`
- `POST /services/excavation/estimate`
- `GET /services/providers?category=Excavation`

## 5. Materials, Cart, Orders, And Payments

The backend supports material listing, cart operations, checkout, material orders, and payment initiation.

Main capabilities:

- Return material cards for Flutter UI.
- Add, update, remove, and clear cart items.
- Checkout cart into material order.
- Create transaction record during checkout.
- Initiate payment through supported payment methods.

Important APIs:

- `GET /services/materials`
- `GET /services/cart`
- `POST /services/cart/items`
- `PATCH /services/cart/items/:itemId`
- `DELETE /services/cart/items/:itemId`
- `POST /services/cart/checkout`
- `GET /services/material-orders`
- `GET /payments/methods`
- `POST /payments/initiate`

Supported frontend payment labels:

- `MyFawry`
- `Cash` mapped to backend `COD`
- `Bangkok Bank` mapped to backend `BangkokBank`

## 6. Real Estate

The real estate module supports property listings, filtering, details, favorites, inquiries, and view counts.

Main capabilities:

- List properties by type, status, price, bedroom count, and search text.
- Return property cards for Flutter UI.
- Track property views.
- Favorite/unfavorite properties.
- Submit property inquiries.

Important APIs:

- `GET /properties`
- `GET /properties/:id`
- `POST /properties`
- `PATCH /properties/:id`
- `DELETE /properties/:id`
- `POST /properties/:id/favorite`
- `GET /properties/favorites/my`
- `POST /properties/:id/inquiries`
- `GET /properties/inquiries/my`

## 7. Project And Management Dashboard

The backend supports construction project tracking and management dashboard data.

Main capabilities:

- Create and manage projects.
- Store project budget, dates, phase, milestones, team members, and pending actions.
- Calculate spent amount from real financial transactions.
- Return dashboard summary and project detail views for Flutter.
- Add team members and manage project actions.

Important APIs:

- `POST /projects`
- `GET /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `GET /management/dashboard`
- `GET /management/projects/:projectId`
- `POST /management/projects/:projectId/team`
- `POST /management/projects/:projectId/actions`
- `PATCH /management/projects/:projectId/actions/:actionId/resolve`

## 8. Financials And Transactions

Financial records connect payments, projects, material orders, and dashboard spending.

Main capabilities:

- Create transaction records.
- Track amount, type, status, payment gateway, and related project/order.
- Use transaction totals in management dashboard.
- Support payment initiation and payment methods list.

Important APIs:

- `POST /financials/transaction`
- `GET /financials/transactions`
- `GET /payments/methods`
- `POST /payments/initiate`

## 9. Real-Time Chat

Chat is production-oriented and supports both REST fallback and Socket.IO real-time messaging.

Main capabilities:

- One-to-one persistent chat between users.
- Messages are stored in MongoDB and do not disappear after app close.
- Chat history can be loaded through REST API.
- Real-time messages through Socket.IO.
- Typing indicators.
- Read receipts.
- Online/offline presence.
- Unread message counts.
- Chat notifications.

Chat can happen between:

- Client / Owner and Labor / Worker.
- Client / Owner and Engineer / Contractor.
- Client / Owner and Supplier.
- Buyer / Renter and Real Estate Agent.
- Project Owner and team members.
- User and Support/Admin.

Important REST APIs:

- `GET /chat/conversations`
- `GET /chat/:otherUserId`
- `POST /chat/send`
- `PATCH /chat/conversations/:otherUserId/read`

Socket.IO connection:

```text
ws://localhost:5000
```

Socket auth:

```json
{
  "auth": {
    "token": "FIREBASE_ID_TOKEN_OR_DEV_FIREBASE_UID"
  }
}
```

Socket events:

- `message:send`
- `message:new`
- `message:sent`
- `message:read`
- `typing:start`
- `typing:stop`
- `presence:get`
- `presence:update`
- `notification:new`

## 10. Notifications

Notifications are created for key user actions such as chat messages, hire requests, support updates, and other workflow events.

Main capabilities:

- List notifications.
- Mark single notification as read.
- Mark all notifications as read.
- Return frontend-ready notification `ui` fields.
- Emit real-time notification through Socket.IO when chat messages are sent.

Important APIs:

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

## 11. Support Tickets

Users can create support tickets and continue ticket conversation through replies.

Main capabilities:

- Create support ticket.
- List user's support tickets.
- View ticket detail.
- Add replies.
- Store ticket number, category, status, priority, and reply history.

Important APIs:

- `POST /support/tickets`
- `GET /support/tickets`
- `GET /support/tickets/:ticketId`
- `POST /support/tickets/:ticketId/replies`

## 12. Security Sessions

The backend stores session/device information for user security screens.

Main capabilities:

- List active sessions.
- Return device and location display fields.
- Support frontend security/session UI.

Important APIs:

- `GET /security/sessions`

## Frontend Integration Strategy

The backend has been shaped to reduce frontend hardcoding. For most cards and list screens, API responses include a `ui` object that Flutter can map directly.

Recommended frontend rules:

- Prefer `item.ui` for card display values.
- Use backend IDs for actions such as hire, favorite, checkout, inquiry, chat, and read status.
- Use REST APIs to load initial data and history.
- Use Socket.IO for live chat and live notifications.
- Keep REST fallback available when socket is disconnected.
- Use docs files as the source of truth for endpoint payloads and response mapping.

Important documentation files:

- `docs/api_endpoints.md`: Complete API endpoint documentation.
- `docs/frontend_integration.md`: Flutter screen-to-API mapping guide.
- `docs/flutter_integration_checklist.md`: Frontend integration checklist.
- `docs/third_party_setup.md`: Third-party setup notes.

## Data Persistence

The system stores important business data in MongoDB:

- Users
- Service providers
- Hire requests
- Excavation estimates
- Materials, carts, and orders
- Properties, favorites, and inquiries
- Projects, milestones, teams, and actions
- Transactions and payments
- Messages and conversations
- Notifications
- Support tickets
- Security sessions

Because chat messages, orders, projects, and tickets are persisted, data remains available after app restart or reconnect.

## Production Notes

Before final production deployment, these items should be completed or reviewed:

- Replace development Firebase UID token behavior with real Firebase ID token verification.
- Configure secure Socket.IO CORS origins.
- Add production logging, monitoring, and rate limiting.
- Configure payment gateway live credentials.
- Configure push notifications, such as FCM, for offline chat and system alerts.
- Review npm audit results and upgrade vulnerable packages carefully.
- Add deployment environment variables and database backup policy.

## Current Verification

Backend test coverage has been added across the main implemented modules, including services, payments, real estate, chat/notifications, users, support/security, management dashboard, and projects.

Latest verified command:

```text
npx jest service.test.js payment.test.js financial_real_estate.test.js chat_notification.test.js user.test.js support_security.test.js management_dashboard.test.js project.test.js --runInBand
```

Verified result:

```text
8 test suites passed, 37 tests passed
```
