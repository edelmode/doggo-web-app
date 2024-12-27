import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import initializeConnection from '../server/server/config/db.js'
//import initializeConnection from './config/db.js';

// Import your routes
import authRoutes from '../server/server/routes/auth.js';
import userRoutes from '../server/server/routes/user.js';


dotenv.config();

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Database Initialization and Server Start
const startServer = async () => {
  try {
    const dbConnection = await initializeConnection();

    // Middleware to make the DB connection available in routes
    app.use((req, res, next) => {
      req.db = dbConnection;
      next();
    });

    // Define API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);


    // Test Route
    app.get('/', (req, res) => {
      res.send('Hello, world!');
    });

    // Serve React App for non-API routes
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
    });

    // Start Server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
