const express = require('express');
const router = express.Router();

// 1. We added checkPaymentStatus right here so Express knows what it is
const { initializePayment, verifyPayment, paystackWebhook, checkPaymentStatus } = require('../controllers/paymentController');

// Define the route to start payment
router.post('/pay', initializePayment);

// Define the route to verify payment
router.get('/verify/:reference', verifyPayment);

// Define the Webhook route
router.post('/webhook', paystackWebhook);

// Define the route to check payment status (Unity Polling)
router.get('/status/:reference', checkPaymentStatus);

module.exports = router;