import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose'; // Import mongoose to set config
import connectDB from './config/db.js';

// Import Routes
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load env vars
dotenv.config();

// --- Database Connection ---

// FIX 1: Suppress Mongoose 7 deprecation warning
// This addresses the 'strictQuery' warning in your logs.
mongoose.set('strictQuery', false);

// Connect to Database
connectDB();

const app = express();

// --- Middlewares ---

// FIX 2: Trust the reverse proxy (Render)
// This is the critical fix for the 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR' error.
// It tells Express to trust the 'X-Forwarded-For' header set by Render,
// allowing express-rate-limit to see the correct client IP.
// This MUST be set before any middleware that relies on the client IP.
app.set('trust proxy', 1);

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Body parser
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
// Apply the limiter to all API routes
app.use('/api', limiter);

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// --- Error Handling ---
// Not found middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// General error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
