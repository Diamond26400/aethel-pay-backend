const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment , paystackWebhook } = require('../controllers/paymentController');

// Define the route to start payment
router.post('/pay', initializePayment);

// Define the route: POST /api/payments/pay
router.get('/verify/:reference', verifyPayment);

// Define the Webhook route
router.post('/webhook', paystackWebhook);

module.exports = router;