import express from 'express';


const router = express.Router();


router.get('/user', (req, res) => {
    res.json({ message: 'Get user data' });
});


router.post('/user', async (req, res) => {
    try {
        const { name, email, clerkId } = await req.body;
        if (!name || !email || !clerkId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const response = await sql`
    INSERT INTO users(
    name,
    email,
    clerk_id
    ) VALUES (
     ${name},
     ${email},
     ${clerkId}
    )
    `;
        const userData = response[0];
        res.json({ message: 'User created', data: userData });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });

    }
});



export default router;