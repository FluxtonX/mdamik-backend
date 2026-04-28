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

## Health Check
`GET /health`

Returns server status.
