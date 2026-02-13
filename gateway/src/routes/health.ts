import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check behavior:
 * - default: run dependency checks (auth/user critical, voyage/ai optional)
 * - SKIP_DEPENDENCY_HEALTH_CHECKS=true: bypass dependency checks (CI/bootstrap mode)
 */
const skipDependencyHealthChecks = (): boolean =>
  process.env.SKIP_DEPENDENCY_HEALTH_CHECKS === 'true';

type DependencyConfig = {
  name: string;
  url: string;
  critical: boolean;
};

type DependencyResult = {
  name: string;
  url: string;
  critical: boolean;
  healthy: boolean;
  responseTimeMs: number;
  statusCode?: number;
  error?: string;
};

const dependencyTimeoutMs = 3000;

const getDependencies = (): DependencyConfig[] => {
  const dependencies: DependencyConfig[] = [
    {
      name: 'auth-service',
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      critical: true,
    },
    {
      name: 'user-service',
      url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
      critical: true,
    },
    {
      name: 'voyage-service',
      url: process.env.VOYAGE_SERVICE_URL || 'http://localhost:3003',
      critical: false,
    },
  ];

  if (process.env.AI_SERVICE_URL) {
    dependencies.push({
      name: 'ai-service',
      url: process.env.AI_SERVICE_URL,
      critical: false,
    });
  }

  return dependencies;
};

const checkDependency = async (dependency: DependencyConfig): Promise<DependencyResult> => {
  const startedAt = Date.now();

  try {
    const response = await fetch(`${dependency.url}/health/live`, {
      method: 'GET',
      signal: AbortSignal.timeout(dependencyTimeoutMs),
    });

    return {
      ...dependency,
      healthy: response.ok,
      responseTimeMs: Date.now() - startedAt,
      statusCode: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ...dependency,
      healthy: false,
      responseTimeMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  if (skipDependencyHealthChecks()) {
    res.status(200).json({
      status: 'healthy',
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      checksSkipped: true,
      reason: 'SKIP_DEPENDENCY_HEALTH_CHECKS=true',
    });
    return;
  }

  const dependencyResults = await Promise.all(getDependencies().map(checkDependency));
  const hasCriticalFailure = dependencyResults.some((result) => result.critical && !result.healthy);
  const hasOptionalFailure = dependencyResults.some((result) => !result.critical && !result.healthy);

  const status = hasCriticalFailure ? 'unhealthy' : hasOptionalFailure ? 'degraded' : 'healthy';
  const httpStatus = hasCriticalFailure ? 503 : hasOptionalFailure ? 206 : 200;

  res.status(httpStatus).json({
    status,
    service: 'gateway-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    dependencies: dependencyResults,
  });
});

router.get('/live', (_req: Request, res: Response): void => {
  res.status(200).json({
    alive: true,
    service: 'gateway-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

router.get('/ready', (_req: Request, res: Response): void => {
  if (skipDependencyHealthChecks()) {
    res.status(200).json({
      ready: true,
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
      checksSkipped: true,
      reason: 'SKIP_DEPENDENCY_HEALTH_CHECKS=true',
    });
    return;
  }

  Promise.all(
    getDependencies()
      .filter((dependency) => dependency.critical)
      .map(checkDependency)
  )
    .then((criticalResults) => {
      const allCriticalHealthy = criticalResults.every((result) => result.healthy);

      res.status(allCriticalHealthy ? 200 : 503).json({
        ready: allCriticalHealthy,
        service: 'gateway-service',
        timestamp: new Date().toISOString(),
        dependencies: criticalResults,
      });
    })
    .catch((error) => {
      res.status(503).json({
        ready: false,
        service: 'gateway-service',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });
});

export default router;
