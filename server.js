require('dotenv').config();
require('./src/config/db');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your game/frontend to talk to this API
app.use(express.json()); // Allows Express to understand JSON data sent in requests
app.use(express.urlencoded({ extended: true }));

const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// A simple health check route to en
// sure the server is breathing
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Aethel API is live!' });
});

// We will mount our routes here later...

// Boot the server
app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
});