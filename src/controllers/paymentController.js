const axios = require('axios');
const pool = require('../config/db'); // 1. Import your database connection
const crypto = require('crypto');
// Function to initialize a payment
const initializePayment = async (req, res) => {
    try {
        // 1. Get the email and amount from the request body
        const { email, amount } = req.body;

        // 2. Set up the Paystack API request
        const paystackUrl = 'https://api.paystack.co/transaction/initialize';
        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        const response = await axios.post(
            paystackUrl,
            {
                email: email,
                amount: amount * 100, // Paystack works in Kobo, so multiply by 100
                // callback_url: "http://localhost:3000/verify" // We will use this later
            },
            {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 3. Extract the URL and reference from Paystack's response
        const { authorization_url, reference } = response.data.data;

        // 4. Save the pending transaction to your database
        const insertQuery = `
            INSERT INTO transactions (email, amount, reference, status) 
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        // We pass the raw amount (e.g., 5000), the reference, and default it to 'pending'
        const values = [email, amount, reference, 'pending'];
        
        await pool.query(insertQuery, values);
        console.log(`💾 Saved pending transaction to DB: ${reference}`);

        // 5. Send the Paystack checkout link back to the user
        res.status(200).json({
            status: 'success',
            checkout_url: authorization_url,
            reference: reference
        });

    } catch (error) {
        console.error("Paystack Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: 'Payment initialization failed' });
    }
};

// Function to verify a payment
const verifyPayment = async (req, res) => {
    try {
        // 1. Get the reference from the URL (e.g., /api/payments/verify/jv8ghyy64k)
        const reference = req.params.reference;
        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        // 2. Ask Paystack if this reference is actually valid and paid
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${secretKey}`
                }
            }
        );

        // 3. Check the status Paystack returns
        const paymentStatus = response.data.data.status; 

        if (paymentStatus === 'success') {
            // 4. If successful, update our database from 'pending' to 'success'
            const updateQuery = `
                UPDATE transactions 
                SET status = 'success' 
                WHERE reference = $1 RETURNING *;
            `;
            const result = await pool.query(updateQuery, [reference]);

            console.log(`✅ Payment verified and DB updated for: ${reference}`);
            
            res.status(200).json({ 
                status: 'success', 
                message: 'Payment verified successfully',
                data: result.rows[0] // Sends back the updated database row
            });
        } else {
            res.status(400).json({ status: 'failed', message: `Payment status is: ${paymentStatus}` });
        }

    } catch (error) {
        console.error("Verification Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: 'Payment verification failed' });
    }
};
// Function to handle background webhooks from Paystack
const paystackWebhook = async (req, res) => {
    try {
        // 1. Verify the signature to ensure it's actually Paystack
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const hash = crypto.createHmac('sha512', secret)
                           .update(JSON.stringify(req.body))
                           .digest('hex');

        if (hash === req.headers['x-paystack-signature']) {
            // 2. The event is legit! Look at what type of event it is
            const event = req.body;

            if (event.event === 'charge.success') {
                const reference = event.data.reference;

                // 3. Update the database. (We check if it's 'pending' so we don't 
                // accidentally update it twice if the frontend verify already ran).
                const updateQuery = `
                    UPDATE transactions 
                    SET status = 'success' 
                    WHERE reference = $1 AND status = 'pending' RETURNING *;
                `;
                const result = await pool.query(updateQuery, [reference]);

                if (result.rowCount > 0) {
                    console.log(`🔔 Webhook: Payment verified & DB updated for: ${reference}`);
                } else {
                    console.log(`🔔 Webhook: Payment already processed for: ${reference}`);
                }
            }
        }
        
        // 4. IMPORTANT: Always return a 200 OK immediately so Paystack knows you received it
        res.sendStatus(200);

    } catch (error) {
        console.error("Webhook Error:", error.message);
        res.sendStatus(500);
    }
};
//exporting functions
module.exports = {
    initializePayment,
    verifyPayment,
    paystackWebhook
};