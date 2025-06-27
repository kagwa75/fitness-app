const express = require('express');
const app = express();
const userRoutes = require('./user');
require('dotenv').config();


app.use(express.json()); // for parsing application/json

// Use the user routes
app.use('/users', userRoutes); // or whatever path you prefer



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});