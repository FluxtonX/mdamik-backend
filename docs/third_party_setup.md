# Third-Party API Setup & Integration Guide

This document provides guidance on setting up all required third-party services for the Mdamik backend. These services are essential for authentication, payments, and notifications in a production environment.

---

## 1. Firebase (Authentication & Admin SDK)
**Purpose:** Handles user sign-in, OTP verification (optional), and secure token validation on the backend.

### Setup Steps:
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project named `Mdamik`.
3.  **Enable Authentication:** Go to "Build" -> "Authentication" -> "Sign-in method" and enable "Phone" and "Email/Password".
4.  **Generate Admin Key:**
    *   Go to "Project Settings" (gear icon) -> "Service accounts".
    *   Click **"Generate new private key"**.
    *   Download the `.json` file and rename it to `serviceAccountKey.json`.
    *   Place it in the root of the `mdamik-backend` folder.
5.  **Environment Variable:**
    *   `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json`

---

## 2. Stripe (Global Payments)
**Purpose:** Handles international credit card payments, Apple Pay, and Google Pay.

### Setup Steps:
1.  Register at [Stripe](https://stripe.com/).
2.  **API Keys:** Go to "Developers" -> "API keys" to get your `Publishable key` (for Flutter) and `Secret key` (for Backend).
3.  **Webhooks:**
    *   Go to "Developers" -> "Webhooks".
    *   Add an endpoint pointing to `https://your-domain.com/api/payments/webhook/stripe`.
    *   Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `charge.refunded`.
    *   Copy the **Signing Secret** (`whsec_...`).
4.  **Environment Variables:**
    *   `STRIPE_SECRET_KEY=sk_live_...`
    *   `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 3. MyFawry (Regional Payments - EGP/SDG)
**Purpose:** Primary payment gateway for Egypt and Sudan regions.

### Setup Steps:
1.  Register at [Fawry Digital](https://developer.fawry.com/).
2.  Obtain your **Merchant Code** and **Security Key** from the Fawry dashboard.
3.  **Webhooks:** Configure your Fawry callback URL to point to `/api/payments/webhook/fawry`.
4.  **Environment Variables:**
    *   `FAWRY_MERCHANT_CODE=...`
    *   `FAWRY_SECRET_KEY=...`
    *   `FAWRY_WEBHOOK_SECRET=...`

---

## 4. Bangkok Bank (Regional Payments - THB)
**Purpose:** Handles payments for users in Thailand and related regions.

### Setup Steps:
1.  Apply for the **iPay / Bualuang iBanking API** through Bangkok Bank's merchant services.
2.  Obtain your **Merchant ID** and **Hash Secret**.
3.  **Environment Variables:**
    *   `BANGKOK_BANK_MERCHANT_ID=...`
    *   `BANGKOK_BANK_SECRET=...`
    *   `BANGKOK_BANK_WEBHOOK_SECRET=...`

---

## 5. SMS Gateway (For OTP)
**Purpose:** Sending real-time OTP codes to users' mobile phones.

### Recommendations:
*   **Twilio:** Best global reliability.
*   **Firebase SMS:** Built-in with Firebase Auth (easiest for Flutter).
*   **Local Gateway:** If you have a specific regional provider (e.g., in Sudan or Egypt), you will need to replace the logic in `src/controllers/auth.controller.js`.

---

## 6. MongoDB Atlas (Database)
**Purpose:** Scalable NoSQL cloud database.

### Setup Steps:
1.  Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Cluster and a database named `mdamik`.
3.  Go to "Database Access" and create a user with read/write permissions.
4.  Go to "Network Access" and whitelist your server's IP address (or `0.0.0.0/0` for testing).
5.  **Connection String:**
    *   `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mdamik?retryWrites=true&w=majority`

---

## Summary Checklist for Deployment

| Service | Required Key | File/Env Location |
| :--- | :--- | :--- |
| **Firebase** | serviceAccountKey.json | Root Folder |
| **Stripe** | Secret Key & Webhook Secret | .env |
| **Fawry** | Merchant Code & Secret | .env |
| **BKB** | Merchant ID & Secret | .env |
| **MongoDB** | Connection URI | .env |
