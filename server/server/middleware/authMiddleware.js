import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY; 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ error: 'Token is required' }); // No token, unauthorized

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' }); // Invalid token, forbidden
        }

        req.user = user; // Attach user information to the request
        next(); 
    });
};

export default authenticateToken; 