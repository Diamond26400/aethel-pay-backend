# Aethel's Light Payment Backend

A production backend handling game purchases for Aethel's Light.

## Stack
- Node.js + Express
- PostgreSQL (Railway)
- Paystack Payment Gateway
- JWT Authentication

## Features
- Secure payment initialization via Paystack
- Webhook handler for real-time payment confirmation
- Async payment status polling endpoint for Unity client
- PostgreSQL transaction tracking

## Unity Integration
The Unity PaymentManager.cs communicates with this API to:
1. Initialize checkout and receive payment URL
2. Poll /payment/status until confirmation
3. Unlock game content on success
