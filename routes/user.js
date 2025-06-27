const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

// Initialize Neon connection pool outside of routes for better performance
const sql = neon("postgresql://neondb_owner:npg_zgv7RLmsInJ5@ep-empty-mode-a8clxmnc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require");

// Helper function for error handling
const handleError = (res, error) => {
    console.error('Database error:', error);
    return res.status(500).json({
        error: 'Internal Server Error',
        details: error.message
    });
};

// User registration endpoint
router.post('/', async (req, res) => {
    try {
        const { name, email, clerkId } = req.body;

        // Validate required fields
        if (!name || !email || !clerkId) {
            return res.status(400).json({
                error: "Missing required fields: name, email, clerkId"
            });
        }

        // Check if user already exists
        const existingUser = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId}
    `;

        if (existingUser.length > 0) {
            return res.status(200).json({
                message: "User already exists",
                user: existingUser[0]
            });
        }

        // Create new user using tagged template literal
        const newUser = await sql`
      INSERT INTO users (name, email, clerk_id)
      VALUES (${name}, ${email}, ${clerkId})
      RETURNING *
    `;

        return res.status(201).json({
            message: "User created successfully",
            user: newUser[0]
        });
    } catch (error) {
        return handleError(res, error);
    }
});

// Workout creation endpoint
router.post('/workouts', async (req, res) => {
    try {
        const { clerkUserId, exerciseName, duration, sets, caloriesBurned } = req.body;

        // Validate required fields
        if (!clerkUserId || !exerciseName) {
            return res.status(400).json({
                error: "Missing required fields: clerkUserId, exerciseName"
            });
        }

        // Insert workout using tagged template literal
        const newWorkout = await sql`
      INSERT INTO records (
        clerk_user_id, 
        exercise_name, 
        duration_seconds, 
        sets, 
        calories_burned
      )
      VALUES (
        ${clerkUserId},
        ${exerciseName},
        ${duration || null},
        ${sets || null},
        ${caloriesBurned || 0}
      )
      RETURNING *
    `;

        return res.status(201).json(newWorkout[0]);
    } catch (error) {
        return handleError(res, error);
    }
});

// Test endpoint
router.get('/try', (req, res) => {
    res.send("API is working correctly");
});

module.exports = router;