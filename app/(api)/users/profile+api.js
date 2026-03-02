import { neon } from "@neondatabase/serverless";

const getDb = () => neon(process.env.DATABASE_URL);

const VALID_GENDERS = new Set(["male", "female", "non_binary", "prefer_not_to_say"]);
const VALID_GOALS = new Set(["lose_weight", "gain_weight", "build_muscle", "maintain_fitness"]);
const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);
const VALID_ACTIVITY_LEVELS = new Set(["sedentary", "light", "moderate", "very_active"]);
const VALID_LIMITATIONS = new Set([
    "none",
    "knee_pain",
    "lower_back_pain",
    "shoulder_pain",
    "wrist_pain",
    "ankle_pain",
]);

const ensureUserProfilesTable = async (sql) => {
    await sql`
        CREATE TABLE IF NOT EXISTS user_profiles (
            id BIGSERIAL PRIMARY KEY,
            clerk_id TEXT NOT NULL UNIQUE,
            name TEXT,
            age INTEGER NOT NULL,
            weight NUMERIC(10, 2) NOT NULL,
            weight_unit TEXT NOT NULL DEFAULT 'kg',
            height NUMERIC(10, 2),
            height_unit TEXT NOT NULL DEFAULT 'cm',
            height_ft INTEGER,
            height_in NUMERIC(5, 2),
            body_fat NUMERIC(5, 2),
            gender TEXT NOT NULL,
            goal TEXT NOT NULL,
            fitness_level TEXT NOT NULL,
            activity_level TEXT NOT NULL DEFAULT 'sedentary',
            focus_areas TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
            workout_location TEXT,
            equipment TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
            limitations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;

    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS name TEXT`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS height_ft INTEGER`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS height_in NUMERIC(5, 2)`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS body_fat NUMERIC(5, 2)`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS focus_areas TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS workout_location TEXT`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS equipment TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS limitations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`;
};

const normalizeStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return [...new Set(
        value
            .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
            .filter(Boolean)
    )];
};

const mapProfileRow = (row) => ({
    name: row.name ?? null,
    age: row.age,
    weight: Number(row.weight),
    weightUnit: row.weight_unit,
    height: row.height != null ? Number(row.height) : null,
    heightUnit: row.height_unit,
    heightFt: row.height_ft != null ? Number(row.height_ft) : null,
    heightIn: row.height_in != null ? Number(row.height_in) : null,
    bodyFat: row.body_fat != null ? Number(row.body_fat) : null,
    gender: row.gender,
    goal: row.goal,
    fitnessLevel: row.fitness_level,
    activityLevel: row.activity_level,
    focusAreas: Array.isArray(row.focus_areas) ? row.focus_areas : [],
    workoutLocation: row.workout_location ?? "home",
    equipment: Array.isArray(row.equipment) ? row.equipment : [],
    limitations: Array.isArray(row.limitations) ? row.limitations : [],
    updatedAt: row.updated_at,
});

// ── GET /users/profile?clerkId=xxx ───────────────────────────────────────────
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clerkId = String(searchParams.get("clerkId") || "").trim();

        if (!clerkId) {
            return Response.json({ error: "Missing clerkId" }, { status: 400 });
        }

        const sql = getDb();
        await ensureUserProfilesTable(sql);
        const rows = await sql`
            SELECT
                name,
                age, weight, weight_unit, height, height_unit,
                height_ft, height_in, body_fat,
                gender, goal, fitness_level, activity_level,
                focus_areas, workout_location, equipment, limitations,
                updated_at
            FROM user_profiles
            WHERE clerk_id = ${clerkId}
            LIMIT 1
        `;

        if (!rows.length) {
            return Response.json({ profile: null }, { status: 200 });
        }

        return Response.json({ profile: mapProfileRow(rows[0]) }, { status: 200 });
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
            name,
            age, weight, weightUnit,
            height, heightUnit, heightFt, heightIn,
            bodyFat,
            gender, goal, fitnessLevel, activityLevel,
            focusAreas, workoutLocation, equipment, limitations,
        } = body;

        const safeClerkId = String(clerkId || "").trim();
        const parsedAge = Number.parseInt(age, 10);
        const parsedWeight = Number.parseFloat(weight);
        const parsedHeight = height != null && height !== "" ? Number.parseFloat(height) : null;
        const parsedHeightFt = heightFt != null && heightFt !== "" ? Number.parseInt(heightFt, 10) : null;
        const parsedHeightIn = heightIn != null && heightIn !== "" ? Number.parseFloat(heightIn) : null;
        const parsedBodyFat = bodyFat != null && bodyFat !== "" ? Number.parseFloat(bodyFat) : null;

        const safeWeightUnit = String(weightUnit || "kg").trim() || "kg";
        const safeHeightUnit = String(heightUnit || "cm").trim() || "cm";
        const safeGender = String(gender || "").trim();
        const safeGoal = String(goal || "").trim();
        const safeFitnessLevel = String(fitnessLevel || "").trim();
        const safeActivityLevel = String(activityLevel || "sedentary").trim() || "sedentary";
        const safeName = typeof name === "string" ? name.trim() : null;
        const safeFocusAreas = normalizeStringArray(focusAreas);
        const safeEquipment = normalizeStringArray(equipment);
        const normalizedLimitations = normalizeStringArray(limitations).filter((entry) =>
            VALID_LIMITATIONS.has(entry)
        );
        const safeLimitations = normalizedLimitations.includes("none")
            ? ["none"]
            : normalizedLimitations;

        if (!safeClerkId) {
            return Response.json({ error: "Missing clerkId" }, { status: 400 });
        }
        if (!Number.isInteger(parsedAge) || parsedAge < 10 || parsedAge > 120) {
            return Response.json({ error: "Invalid age" }, { status: 422 });
        }
        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500) {
            return Response.json({ error: "Invalid weight" }, { status: 422 });
        }
        if (parsedHeight != null && (!Number.isFinite(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300)) {
            return Response.json({ error: "Invalid height" }, { status: 422 });
        }
        if (parsedBodyFat != null && (!Number.isFinite(parsedBodyFat) || parsedBodyFat <= 2 || parsedBodyFat >= 70)) {
            return Response.json({ error: "Invalid body fat %" }, { status: 422 });
        }
        if (!VALID_GENDERS.has(safeGender)) {
            return Response.json({ error: "Invalid gender" }, { status: 422 });
        }
        if (!VALID_GOALS.has(safeGoal)) {
            return Response.json({ error: "Invalid goal" }, { status: 422 });
        }
        if (!VALID_LEVELS.has(safeFitnessLevel)) {
            return Response.json({ error: "Invalid fitnessLevel" }, { status: 422 });
        }
        if (!VALID_ACTIVITY_LEVELS.has(safeActivityLevel)) {
            return Response.json({ error: "Invalid activityLevel" }, { status: 422 });
        }

        const sql = getDb();
        await ensureUserProfilesTable(sql);

        const rows = await sql`
            INSERT INTO user_profiles (
                clerk_id,
                name,
                age, weight, weight_unit,
                height, height_unit, height_ft, height_in,
                body_fat,
                gender, goal, fitness_level, activity_level,
                focus_areas, workout_location, equipment, limitations,
                updated_at
            )
            VALUES (
                ${safeClerkId},
                ${safeName},
                ${parsedAge}, ${parsedWeight}, ${safeWeightUnit},
                ${parsedHeight}, ${safeHeightUnit}, ${parsedHeightFt}, ${parsedHeightIn},
                ${parsedBodyFat},
                ${safeGender}, ${safeGoal}, ${safeFitnessLevel}, ${safeActivityLevel},
                ${safeFocusAreas}, ${workoutLocation || null}, ${safeEquipment}, ${safeLimitations},
                NOW()
            )
            ON CONFLICT (clerk_id) DO UPDATE SET
                name             = EXCLUDED.name,
                age              = EXCLUDED.age,
                weight           = EXCLUDED.weight,
                weight_unit      = EXCLUDED.weight_unit,
                height           = EXCLUDED.height,
                height_unit      = EXCLUDED.height_unit,
                height_ft        = EXCLUDED.height_ft,
                height_in        = EXCLUDED.height_in,
                body_fat         = EXCLUDED.body_fat,
                gender           = EXCLUDED.gender,
                goal             = EXCLUDED.goal,
                fitness_level    = EXCLUDED.fitness_level,
                activity_level   = EXCLUDED.activity_level,
                focus_areas      = EXCLUDED.focus_areas,
                workout_location = EXCLUDED.workout_location,
                equipment        = EXCLUDED.equipment,
                limitations      = EXCLUDED.limitations,
                updated_at       = NOW()
            RETURNING
                name,
                age, weight, weight_unit, height, height_unit,
                height_ft, height_in, body_fat,
                gender, goal, fitness_level, activity_level,
                focus_areas, workout_location, equipment, limitations,
                updated_at
        `;

        return Response.json({ profile: mapProfileRow(rows[0]) }, { status: 200 });
    } catch (error) {
        console.error("POST /users/profile error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
