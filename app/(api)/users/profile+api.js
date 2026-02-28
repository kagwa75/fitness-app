import { neon } from "@neondatabase/serverless";

const getDb = () => neon(process.env.DATABASE_URL);

// ── GET /users/profile?clerkId=xxx ───────────────────────────────────────────
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clerkId = String(searchParams.get("clerkId") || "").trim();

        if (!clerkId) {
            return Response.json({ error: "Missing clerkId" }, { status: 400 });
        }

        const sql = getDb();
        const rows = await sql`
            SELECT
                age, weight, weight_unit, height, height_unit,
                gender, goal, fitness_level, activity_level, updated_at
            FROM user_profiles
            WHERE clerk_id = ${clerkId}
            LIMIT 1
        `;

        if (!rows.length) {
            return Response.json({ profile: null }, { status: 200 });
        }

        const row = rows[0];
        return Response.json({
            profile: {
                age:           row.age,
                weight:        Number(row.weight),
                weightUnit:    row.weight_unit,
                height:        row.height != null ? Number(row.height) : null,
                heightUnit:    row.height_unit,
                gender:        row.gender,
                goal:          row.goal,
                fitnessLevel:  row.fitness_level,
                activityLevel: row.activity_level,
                updatedAt:     row.updated_at,
            },
        }, { status: 200 });
    } catch (error) {
        console.error("GET /users/profile error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ── POST /users/profile ──────────────────────────────────────────────────────
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            clerkId,
            age, weight, weightUnit,
            height, heightUnit,
            gender, goal, fitnessLevel, activityLevel,
        } = body;

        // Basic validation
        if (!clerkId) {
            return Response.json({ error: "Missing clerkId" }, { status: 400 });
        }

        const parsedAge    = Number.parseInt(age, 10);
        const parsedWeight = Number.parseFloat(weight);
        const parsedHeight = height != null ? Number.parseFloat(height) : null;

        if (!Number.isInteger(parsedAge) || parsedAge < 10 || parsedAge > 120) {
            return Response.json({ error: "Invalid age" }, { status: 422 });
        }
        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500) {
            return Response.json({ error: "Invalid weight" }, { status: 422 });
        }
        if (!gender || !goal || !fitnessLevel) {
            return Response.json({ error: "Missing required fields" }, { status: 422 });
        }

        const sql = getDb();

        // Upsert — insert or update if clerk_id already exists
        const rows = await sql`
            INSERT INTO user_profiles
                (clerk_id, age, weight, weight_unit, height, height_unit,
                 gender, goal, fitness_level, activity_level, updated_at)
            VALUES
                (${clerkId}, ${parsedAge}, ${parsedWeight}, ${weightUnit || "kg"},
                 ${parsedHeight}, ${heightUnit || "cm"},
                 ${gender}, ${goal}, ${fitnessLevel}, ${activityLevel || "sedentary"},
                 NOW())
            ON CONFLICT (clerk_id) DO UPDATE SET
                age            = EXCLUDED.age,
                weight         = EXCLUDED.weight,
                weight_unit    = EXCLUDED.weight_unit,
                height         = EXCLUDED.height,
                height_unit    = EXCLUDED.height_unit,
                gender         = EXCLUDED.gender,
                goal           = EXCLUDED.goal,
                fitness_level  = EXCLUDED.fitness_level,
                activity_level = EXCLUDED.activity_level,
                updated_at     = NOW()
            RETURNING
                age, weight, weight_unit, height, height_unit,
                gender, goal, fitness_level, activity_level, updated_at
        `;

        const row = rows[0];
        return Response.json({
            profile: {
                age:           row.age,
                weight:        Number(row.weight),
                weightUnit:    row.weight_unit,
                height:        row.height != null ? Number(row.height) : null,
                heightUnit:    row.height_unit,
                gender:        row.gender,
                goal:          row.goal,
                fitnessLevel:  row.fitness_level,
                activityLevel: row.activity_level,
                updatedAt:     row.updated_at,
            },
        }, { status: 200 });
    } catch (error) {
        console.error("POST /users/profile error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}