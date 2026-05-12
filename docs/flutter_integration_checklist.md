# Flutter Integration Checklist

Base URL: `http://localhost:5000/api`

Private endpoints require:

```http
Authorization: Bearer FIREBASE_ID_TOKEN
```

In the current development backend, that token is treated as `firebaseUid`.

## 1. API Client Basics

- Read `success` from every response.
- On validation failure, backend returns `400` with:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

- Use `pagination.total`, `pagination.page`, `pagination.limit`, `pagination.pages` when present.
- Prefer `item.ui` fields for current Flutter widgets.
- Keep raw IDs like `_id`, `transaction._id`, `order._id`, `providerId`, and `projectId` in route arguments/state.

## 2. Home

- Categories: `GET /system/categories`
- Use `routeName` from API when navigating.
- Profile header: `GET /user/profile`
- Notifications button: route to notifications, fetch `GET /notifications`.

## 3. Services And Labor

- Site providers: `GET /services/providers?category=SiteService&serviceType=Cleaning`
- Labor: `GET /services/labor?skill=Mason`
- Engineering: `GET /services/providers?category=Engineering&serviceType=Design%20%26%20Planning`
- Hire button: `POST /services/hire`
- Chat button: route to chat with provider/user id when available.

## 4. Materials And Cart

- Materials grid: `GET /services/materials?category=Cement`
- Add to cart: `POST /services/cart/items`
- Cart: `GET /services/cart`
- Checkout: `POST /services/cart/checkout`
- Payment: pass returned `transaction._id` to `POST /payments/initiate`.

## 5. Payment

- Methods: `GET /payments/methods`
- Currencies: `GET /payments/currencies`
- Current Flutter labels accepted:
  - `Cash` maps to `COD`
  - `Bangkok Bank` maps to `BangkokBank`
  - `MyFawry` maps to `MyFawry`
- Payment success screen should use returned transaction/order data instead of hardcoded `TXN69181880`.

## 6. Real Estate

- Listing: `GET /real-estate?type=Buy&category=Villa`
- Details: `GET /real-estate/:id`
- Favorite: `POST /real-estate/:id/favorite`
- Schedule tour: `POST /real-estate/:id/inquiries` with `type: "Tour"`
- Make offer: `POST /real-estate/:id/inquiries` with `type: "Offer"`
- Agent message/call: same inquiry endpoint with `Message` or `CallRequest`.

## 7. Management And Projects

- Stats: `GET /management/stats`
- Project cards: `GET /management/projects`
- Details: `GET /management/projects/:id`
- Add team: `POST /management/projects/:id/team`
- Create action: `POST /management/projects/:id/actions`
- Resolve action: `PATCH /management/projects/:id/actions/:actionId`

## 8. Chat And Notifications

- Real-time socket: connect using Socket.IO after login with `auth.token`.
- Conversations: `GET /chat/conversations`
- Messages: `GET /chat/messages/:otherUserId`
- Send: `POST /chat/messages`
- Real-time send: emit `message:send`
- Listen: `message:new`, `message:sent`, `message:read`, `typing:start`, `typing:stop`, `notification:new`, `presence:update`
- Mark conversation read: `PATCH /chat/conversations/:otherUserId/read`
- Notifications: `GET /notifications`
- Mark notification read: `PATCH /notifications/:id/read`
- Mark all read: `PATCH /notifications/read-all`

## 9. Profile, Support, Security

- Profile: `GET /user/profile`
- Update profile: `PUT /user/profile`
- Preferences: `PATCH /user/preferences`
- 2FA toggle: `PATCH /user/security-settings`
- Support tickets: `GET /support/tickets`
- Create ticket: `POST /support/tickets`
- Reply to ticket: `POST /support/tickets/:ticketId/replies`
- Sessions: `GET /security/sessions`
- Revoke session: `DELETE /security/sessions/:sessionId`

## 10. Final Hardcoded Data To Replace First

- `HomeView` sample name/initials -> `/user/profile`
- `ChatListView` hardcoded conversations -> `/chat/conversations`
- `ChatConversationView` hardcoded bubbles -> `/chat/messages/:otherUserId`
- `NotificationsView` hardcoded notifications -> `/notifications`
- `MaterialsView` hardcoded product grid -> `/services/materials`
- `LaborHiringView` hardcoded labor list -> `/services/labor`
- `RealEstateView` hardcoded properties -> `/real-estate`
- `ManagementView` hardcoded cards/stats -> `/management/stats` and `/management/projects`
- payment success hardcoded transaction/date -> payment/order response
