/**
 * Prometheus Metrics Configuration - INFRA-013.2
 *
 * This module configures Prometheus metrics for the Gateway Service.
 * Metrics exposed via /metrics endpoint for Prometheus scraping.
 */

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a Registry to register metrics
export const register = new Registry();

// Add default labels to all metrics
register.setDefaultLabels({
  service: 'gateway-service',
  environment: process.env.NODE_ENV || 'development',
});

// Collect default metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({
  register,
  prefix: 'dreamscape_gateway_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ============================================
// HTTP Request Metrics
// ============================================

/**
 * Total number of HTTP requests
 */
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Duration of HTTP requests in seconds
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * Size of HTTP requests in bytes
 */
export const httpRequestSizeBytes = new Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register],
});

/**
 * Size of HTTP responses in bytes
 */
export const httpResponseSizeBytes = new Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register],
});

// ============================================
// Health Check Metrics
// ============================================

/**
 * Health check status (1 = healthy, 0 = unhealthy)
 */
export const healthCheckStatus = new Gauge({
  name: 'health_check_status',
  help: 'Health check status (1 = healthy, 0 = unhealthy)',
  labelNames: ['check_name', 'check_type'],
  registers: [register],
});

/**
 * Health check duration in seconds
 */
export const healthCheckDuration = new Histogram({
  name: 'health_check_duration_seconds',
  help: 'Duration of health checks in seconds',
  labelNames: ['check_name', 'status'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

/**
 * Health check execution counter
 */
export const healthCheckExecutions = new Counter({
  name: 'health_check_executions_total',
  help: 'Total number of health check executions',
  labelNames: ['check_name', 'status'],
  registers: [register],
});

// ============================================
// Gateway-Specific Metrics
// ============================================

/**
 * Proxy requests counter (requests forwarded to backend services)
 */
export const proxyRequestsTotal = new Counter({
  name: 'proxy_requests_total',
  help: 'Total number of proxied requests to backend services',
  labelNames: ['target_service', 'method', 'status_code'],
  registers: [register],
});

/**
 * Proxy request latency
 */
export const proxyLatency = new Histogram({
  name: 'proxy_latency_seconds',
  help: 'Latency of proxied requests to backend services',
  labelNames: ['target_service', 'method'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * Backend service availability
 */
export const backendServiceAvailability = new Gauge({
  name: 'backend_service_availability',
  help: 'Availability of backend services (1 = available, 0 = unavailable)',
  labelNames: ['service'],
  registers: [register],
});

/**
 * Rate limit hits counter
 */
export const rateLimitHitsTotal = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['client_ip', 'route'],
  registers: [register],
});

/**
 * CORS requests counter
 */
export const corsRequestsTotal = new Counter({
  name: 'cors_requests_total',
  help: 'Total number of CORS requests',
  labelNames: ['origin', 'method'],
  registers: [register],
});

// ============================================
// Error Metrics
// ============================================

/**
 * Application errors counter
 */
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'route'],
  registers: [register],
});

/**
 * Unhandled errors counter
 */
export const unhandledErrorsTotal = new Counter({
  name: 'unhandled_errors_total',
  help: 'Total number of unhandled errors',
  labelNames: ['type'],
  registers: [register],
});

/**
 * Gateway errors counter (proxy errors, timeouts, etc.)
 */
export const gatewayErrorsTotal = new Counter({
  name: 'gateway_errors_total',
  help: 'Total number of gateway-specific errors',
  labelNames: ['error_type', 'target_service'],
  registers: [register],
});

// ============================================
// Service Status Metrics
// ============================================

/**
 * Service uptime in seconds
 */
const serviceStartTime = Date.now();
export const serviceUptime = new Gauge({
  name: 'service_uptime_seconds',
  help: 'Service uptime in seconds',
  registers: [register],
  collect() {
    this.set((Date.now() - serviceStartTime) / 1000);
  },
});

/**
 * Service info (version, etc.)
 */
export const serviceInfo = new Gauge({
  name: 'service_info',
  help: 'Service information',
  labelNames: ['version', 'node_version'],
  registers: [register],
});

// Set service info
serviceInfo.labels({
  version: process.env.npm_package_version || '1.0.0',
  node_version: process.version,
}).set(1);
