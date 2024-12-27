import connectDB from '../config/db.js';

export const getUsers = async (req, res) => {
    try {
        const connection = await connectDB();
        const sql = "SELECT * FROM users";
        const [results] = await connection.query(sql);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getCurrentUserEmail = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const connection = await connectDB();
        const sql = "SELECT * FROM users WHERE id = ?";
        const [results] = await connection.query(sql, [userId]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Return both the user id and email in the response
        res.json({
            userId: userId,
            email: results[0].email
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { email, password } = req.body; 
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Password is required.' });
        }

        const connection = await connectDB();
        const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        const [result] = await connection.query(sql, [email, password]);
        
        res.status(201).json({ id: result.insertId, email });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};