import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import requestsRoutes from './routes/requestsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*', // Allow local frontend and cross-origin demo calls
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'Sahaay MVP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/chat', chatRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 Sahaay API running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`💬 Nexconn App Key: ${config.nexconn.appKey ? 'Configured ✅' : 'Pending ⚠️'}`);
  console.log(`🔐 Nexconn App Secret: ${config.nexconn.appSecret ? 'Configured ✅' : 'Pending ⚠️'}`);
  console.log(`===============================================`);
});
