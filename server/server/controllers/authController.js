import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import initializeConnection from '../config/db.js';

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;
const clientUrl = process.env.CLIENT_URL;

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const connection = await initializeConnection();
        const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
        await connection.query(sql, [email, hashedPassword]);

        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await initializeConnection();
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [results] = await connection.query(sql, [email]);

        if (results.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '24h' });
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, refreshSecretKey);

        res.json({ token, refreshToken });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error logging in' });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send('Refresh token is required');
    }

    try {
        const decoded = jwt.verify(refreshToken, refreshSecretKey);
        const connection = await initializeConnection();
        const sql = 'SELECT * FROM users WHERE id = ? AND refresh_token = ?';
        const [results] = await connection.query(sql, [decoded.id, refreshToken]);

        if (results.length === 0) {
            return res.status(403).send('Invalid refresh token');
        }

        const user = results[0];
        const newToken = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '24h' });

        res.json({ token: newToken });
    } catch (error) {
        res.status(403).send('Invalid refresh token');
    }
};

export const protectedRoute = (req, res) => {
    const { email } = req.user;
    res.send(`Welcome ${email}! This is a protected route.`);
};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const connection = await initializeConnection();

        // Check if the user exists in the database
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [results] = await connection.query(sql, [email]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        const user = results[0];

        // Create a reset token
        const resetToken = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });

        // Construct the reset URL
        const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

        // Define email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        };

        // Attempt to send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending reset link. Please try again later.' });
    }
};


export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, secretKey);
        const { email } = decoded;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const connection = await initializeConnection();
        const sql = 'UPDATE users SET password = ? WHERE email = ?';
        await connection.query(sql, [hashedPassword, email]);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
};