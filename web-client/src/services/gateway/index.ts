const GATEWAY_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000/api';

// API Gateway configuration
export const gatewayConfig = {
  baseURL: GATEWAY_BASE_URL,
  timeout: 30000
};
