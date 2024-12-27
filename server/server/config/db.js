import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initializeConnection = async () => {
    try {
        const connectionConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
        };

        const connection = await mysql.createConnection(connectionConfig);
        return connection; 
    } catch (err) {
        throw err;
    }
};

export default initializeConnection;