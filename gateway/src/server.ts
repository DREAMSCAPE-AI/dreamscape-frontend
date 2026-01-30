import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health';

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

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

// API Documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    title: 'DreamScape API Gateway',
    version: '1.0.0',
    description: 'API Gateway for DreamScape microservices',
    endpoints: {
      '/api/v1/auth': 'Authentication service',
      '/api/v1/users': 'User management service',
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

app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});