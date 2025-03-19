// Description: Main entry point for the application.
// Used to start the server and connect to the database.    
require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const userRoutes = require('./Routes/userRoutes');

const roleRoutes = require('./Routes/roles');


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Use user routes
app.use('/api/users', userRoutes);
// Use role routes
app.use('/api/roles', roleRoutes);
app.get('/', (req, res) => {
    res.send('Welcome to the WordPress API-like project!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});