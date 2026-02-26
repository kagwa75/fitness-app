const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize Neon connection pool outside of routes for better performance
const sql = neon(process.env.DATABASE_URL || "postgresql://neondb_owner:npg_zgv7RLmsInJ5@ep-empty-mode-a8clxmnc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require");

// Helper function for error handling
const handleError = (res, error) => {
    console.error('Database error:', error);
    return res.status(500).json({
        error: 'Internal Server Error',
        details: error.message
    });
};

let foldersTableReady = false;
const ensureFoldersTable = async () => {
    if (foldersTableReady) return;

    await sql`
      CREATE TABLE IF NOT EXISTS custom_workout_folders (
        id BIGSERIAL PRIMARY KEY,
        clerk_user_id TEXT NOT NULL,
        folder_id TEXT NOT NULL,
        name TEXT NOT NULL,
        exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (clerk_user_id, folder_id)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_custom_workout_folders_clerk
      ON custom_workout_folders (clerk_user_id, created_at DESC)
    `;

    foldersTableReady = true;
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
console.log("User",name,email,clerkId)
        // Check if user already exists
        const existingUser = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId}
    `;

        if (existingUser.length > 0) {
            console.log("OlderUser",existingUser)
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
console.log("NewUser",newUser)
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

// Custom workout folders: list by user
router.get('/folders', async (req, res) => {
    try {
        const clerkUserId = String(req.query.clerkUserId || '').trim();
        if (!clerkUserId) {
            return res.status(400).json({
                error: "Missing required query param: clerkUserId"
            });
        }

        await ensureFoldersTable();

        const folders = await sql`
          SELECT
            folder_id AS id,
            name,
            exercises,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          FROM custom_workout_folders
          WHERE clerk_user_id = ${clerkUserId}
          ORDER BY created_at DESC
        `;

        return res.status(200).json(folders);
    } catch (error) {
        return handleError(res, error);
    }
});

// Custom workout folders: create (or upsert on same folder_id)
router.post('/folders', async (req, res) => {
    try {
        const { clerkUserId, folderId, name, exercises } = req.body;
        const safeUserId = String(clerkUserId || '').trim();
        const safeFolderId = String(folderId || '').trim();
        const safeName = String(name || '').trim();
        const safeExercises = Array.isArray(exercises) ? exercises : [];

        if (!safeUserId || !safeFolderId || !safeName) {
            return res.status(400).json({
                error: "Missing required fields: clerkUserId, folderId, name"
            });
        }

        await ensureFoldersTable();

        const saved = await sql`
          INSERT INTO custom_workout_folders (clerk_user_id, folder_id, name, exercises)
          VALUES (${safeUserId}, ${safeFolderId}, ${safeName}, ${JSON.stringify(safeExercises)}::jsonb)
          ON CONFLICT (clerk_user_id, folder_id)
          DO UPDATE SET
            name = EXCLUDED.name,
            exercises = EXCLUDED.exercises,
            updated_at = NOW()
          RETURNING
            folder_id AS id,
            name,
            exercises,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `;

        return res.status(201).json(saved[0]);
    } catch (error) {
        return handleError(res, error);
    }
});

// Custom workout folders: rename/edit exercises
router.put('/folders/:folderId', async (req, res) => {
    try {
        const folderId = String(req.params.folderId || '').trim();
        const { clerkUserId, name, exercises } = req.body;
        const safeUserId = String(clerkUserId || '').trim();
        const safeName = String(name || '').trim();
        const safeExercises = Array.isArray(exercises) ? exercises : [];

        if (!safeUserId || !folderId || !safeName) {
            return res.status(400).json({
                error: "Missing required fields: clerkUserId, folderId, name"
            });
        }

        await ensureFoldersTable();

        const updated = await sql`
          UPDATE custom_workout_folders
          SET
            name = ${safeName},
            exercises = ${JSON.stringify(safeExercises)}::jsonb,
            updated_at = NOW()
          WHERE clerk_user_id = ${safeUserId}
            AND folder_id = ${folderId}
          RETURNING
            folder_id AS id,
            name,
            exercises,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `;

        if (!updated.length) {
            return res.status(404).json({ error: "Folder not found" });
        }

        return res.status(200).json(updated[0]);
    } catch (error) {
        return handleError(res, error);
    }
});

// Custom workout folders: delete
router.delete('/folders/:folderId', async (req, res) => {
    try {
        const folderId = String(req.params.folderId || '').trim();
        const { clerkUserId } = req.body;
        const safeUserId = String(clerkUserId || '').trim();

        if (!safeUserId || !folderId) {
            return res.status(400).json({
                error: "Missing required fields: clerkUserId, folderId"
            });
        }

        await ensureFoldersTable();

        const deleted = await sql`
          DELETE FROM custom_workout_folders
          WHERE clerk_user_id = ${safeUserId}
            AND folder_id = ${folderId}
          RETURNING folder_id
        `;

        if (!deleted.length) {
            return res.status(404).json({ error: "Folder not found" });
        }

        return res.status(200).json({ message: "Folder deleted" });
    } catch (error) {
        return handleError(res, error);
    }
});

// Test endpoint
router.get('/try', (req, res) => {
    res.send("API is working correctly");
});

module.exports = router;
