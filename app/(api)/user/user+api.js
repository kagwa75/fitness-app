import { neon } from "@neondatabase/serverless";

export async function POST(request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { name, email, clerkId } = await request.json();

        // Validate required fields
        if (!name || !email || !clerkId) {
            return Response.json(
                { error: "Missing required fields: name, email, clerkId" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await sql`
            SELECT * FROM users WHERE clerk_id = ${clerkId}
        `;

        if (existingUser.length > 0) {
            return Response.json(
                { message: "User already exists", user: existingUser[0] },
                { status: 200 }
            );
        }

        // Create new user
        const newUser = await sql`
            INSERT INTO users (name, email, clerk_id)
            VALUES (${name}, ${email}, ${clerkId})
            RETURNING *
        `;

        return Response.json(
            { message: "User created successfully", user: newUser[0] },
            { status: 201 }
        );
    } catch (error) {
        console.error("Database error:", error);
        return Response.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}