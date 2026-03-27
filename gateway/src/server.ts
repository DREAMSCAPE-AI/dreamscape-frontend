import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import healthRoutes from './routes/health';
import vrSessionRoutes from './routes/vr-sessions';

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Upstream service URLs (injected via K8s env vars)
const AUTH_SERVICE_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:3001';
const USER_SERVICE_URL    = process.env.USER_SERVICE_URL    || 'http://localhost:3002';
const VOYAGE_SERVICE_URL  = process.env.VOYAGE_SERVICE_URL  || 'http://localhost:3003';
const AI_SERVICE_URL      = process.env.AI_SERVICE_URL      || 'http://localhost:3005';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check routes - INFRA-013.1
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes); // Alternative path for consistency

// VR session routes (handled locally) - DR-574
app.use('/api/v1/vr', vrSessionRoutes);

// Proxy routes to backend microservices
const proxyOptions = { changeOrigin: true, logLevel: 'warn' } as const;

app.use('/api/v1/auth',    createProxyMiddleware({ target: AUTH_SERVICE_URL,    ...proxyOptions }));
app.use('/api/v1/users',   createProxyMiddleware({ target: USER_SERVICE_URL,    ...proxyOptions }));
app.use('/api/v1/admin',   createProxyMiddleware({ target: USER_SERVICE_URL,    ...proxyOptions }));
app.use('/api/v1/ai',      createProxyMiddleware({ target: AI_SERVICE_URL,      ...proxyOptions }));
app.use('/api/v1/voyage',  createProxyMiddleware({ target: VOYAGE_SERVICE_URL,  ...proxyOptions }));
app.use('/api/v1/payment', createProxyMiddleware({ target: PAYMENT_SERVICE_URL, ...proxyOptions }));

// WebSocket proxy for Socket.IO (user-service notifications)
app.use('/socket.io',      createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, ws: true, logLevel: 'warn' }));

// API Documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    title: 'DreamScape API Gateway',
    version: '1.0.0',
    description: 'API Gateway for DreamScape microservices',
    endpoints: {
      '/api/v1/auth': 'Authentication service',
      '/api/v1/users': 'User management service',
      '/api/v1/vr/sessions': 'VR PIN sessions (DR-574)',
      '/health': 'Health check endpoint'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DreamScape API Gateway',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Only start listening if not imported as a module (for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gateway server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;