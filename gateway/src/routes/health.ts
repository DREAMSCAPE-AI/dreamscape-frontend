import { Router, Request, Response } from 'express';
import {
  HealthChecker,
  ComponentType,
  HealthStatus,
  createExternalAPICheck,
} from '../../../../dreamscape-services/shared/health';

const router = Router();

/**
 * Health Check Configuration - INFRA-013.1
 * Gateway Service health checks
 */
const createHealthChecker = () => {
  const checks = [];

  // Check Auth Service
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  checks.push({
    name: 'Auth Service',
    type: ComponentType.INTERNAL_SERVICE,
    critical: true,
    timeout: 3000,
    check: createExternalAPICheck(`${authServiceUrl}/health/live`, 'Auth Service', {
      timeout: 3000,
    }),
  });

  // Check User Service
  const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  checks.push({
    name: 'User Service',
    type: ComponentType.INTERNAL_SERVICE,
    critical: true,
    timeout: 3000,
    check: createExternalAPICheck(`${userServiceUrl}/health/live`, 'User Service', {
      timeout: 3000,
    }),
  });

  // Check Voyage Service
  const voyageServiceUrl = process.env.VOYAGE_SERVICE_URL || 'http://localhost:3003';
  checks.push({
    name: 'Voyage Service',
    type: ComponentType.INTERNAL_SERVICE,
    critical: false, // Non-critical, can be degraded
    timeout: 3000,
    check: createExternalAPICheck(`${voyageServiceUrl}/health/live`, 'Voyage Service', {
      timeout: 3000,
    }),
  });

  // Check AI Service if configured
  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (aiServiceUrl) {
    checks.push({
      name: 'AI Service',
      type: ComponentType.INTERNAL_SERVICE,
      critical: false, // Non-critical, can be degraded
      timeout: 3000,
      check: createExternalAPICheck(`${aiServiceUrl}/health/live`, 'AI Service', {
        timeout: 3000,
      }),
    });
  }

  return new HealthChecker({
    serviceName: 'gateway-service',
    serviceVersion: process.env.npm_package_version || '1.0.0',
    includeMetadata: true,
    checks,
  });
};

/**
 * GET /health
 * Full health check endpoint - INFRA-013.1
 *
 * Returns:
 * - 200: All critical services healthy
 * - 206: Critical services healthy, optional services degraded
 * - 503: Critical services unhealthy
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    const healthChecker = createHealthChecker();
    const healthReport = await healthChecker.performHealthCheck(10000); // 10s timeout for all checks

    const statusCode = HealthChecker.getHttpStatus(healthReport.status);
    const totalTime = Date.now() - startTime;

    console.log(
      `🏥 [Gateway] Health check completed in ${totalTime}ms - Status: ${healthReport.status}`
    );

    res.status(statusCode).json(healthReport);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`💥 [Gateway] Health check failed in ${totalTime}ms:`, error);

    res.status(500).json({
      status: 'error',
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    });
  }
});

/**
 * GET /health/live
 * Liveness probe - INFRA-013.1
 * Simple check if the gateway is alive
 *
 * Returns:
 * - 200: Gateway is running
 */
router.get('/live', (req: Request, res: Response): void => {
  res.status(200).json({
    alive: true,
    service: 'gateway-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

/**
 * GET /health/ready
 * Readiness probe - INFRA-013.1
 * Check if gateway is ready to accept traffic (downstream services available)
 *
 * Returns:
 * - 200: Gateway ready
 * - 503: Gateway not ready (critical services unavailable)
 */
router.get('/ready', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    // Quick check of critical services
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';

    const criticalChecks = await Promise.allSettled([
      fetch(`${authServiceUrl}/health/live`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      }),
      fetch(`${userServiceUrl}/health/live`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      }),
    ]);

    const authHealthy = criticalChecks[0].status === 'fulfilled' && criticalChecks[0].value.ok;
    const userHealthy = criticalChecks[1].status === 'fulfilled' && criticalChecks[1].value.ok;

    const allCriticalHealthy = authHealthy && userHealthy;
    const responseTime = Date.now() - startTime;

    if (allCriticalHealthy) {
      res.status(200).json({
        ready: true,
        service: 'gateway-service',
        timestamp: new Date().toISOString(),
        responseTime,
        dependencies: {
          'auth-service': authHealthy,
          'user-service': userHealthy,
        },
      });
    } else {
      res.status(503).json({
        ready: false,
        service: 'gateway-service',
        timestamp: new Date().toISOString(),
        responseTime,
        reason: 'Critical downstream services unavailable',
        dependencies: {
          'auth-service': authHealthy,
          'user-service': userHealthy,
        },
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    res.status(503).json({
      ready: false,
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
      responseTime,
      reason: 'Readiness check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
