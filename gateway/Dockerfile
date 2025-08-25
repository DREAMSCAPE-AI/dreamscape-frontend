# Multi-stage Dockerfile for DreamScape Gateway
# API Gateway with NGINX and Node.js middleware
#
# Stage 1: Build Environment  
FROM node:20-alpine AS builder

# Install build dependencies and security updates
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    && apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Create non-root user for build process
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodejs -g nodejs nodejs

# Copy package files for dependency caching
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies)
RUN npm install && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user for build
USER nodejs

# Build TypeScript application
RUN npm run build

# Remove dev dependencies and clean up
USER root
RUN npm prune --production && \
    rm -rf /tmp/* /var/cache/apk/* /root/.npm

# Stage 2: Runtime Environment with NGINX
FROM nginx:alpine AS runtime

# Install Node.js and additional dependencies
RUN apk add --no-cache \
    nodejs \
    npm \
    dumb-init \
    curl \
    redis \
    supervisor \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create application directory
WORKDIR /app

# Create non-root user for Node.js processes
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodejs -g nodejs nodejs

# Copy production dependencies and built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Copy NGINX configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy supervisor configuration
COPY supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories with proper permissions
RUN mkdir -p \
    /app/logs \
    /var/log/supervisor \
    /var/log/nginx \
    && chown -R nodejs:nodejs /app \
    && chown -R nginx:nginx /var/log/nginx

# Copy health check script
COPY scripts/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

# Expose ports
EXPOSE 3000 3100

# Environment variables with defaults
ENV NODE_ENV=production \
    GATEWAY_PORT=3000 \
    ADMIN_PORT=3100 \
    NODE_OPTIONS="--max-old-space-size=512" \
    NGINX_WORKER_PROCESSES=auto \
    NGINX_WORKER_CONNECTIONS=1024

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD /usr/local/bin/health-check.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start supervisor to manage both NGINX and Node.js
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Build-time labels for better image management
LABEL maintainer="DreamScape Team <dev@dreamscape.com>" \
      version="1.0.0" \
      description="DreamScape API Gateway - NGINX + Node.js gateway service" \
      org.opencontainers.image.source="https://github.com/DREAMSCAPE-AI/dreamscape-gateway" \
      org.opencontainers.image.title="DreamScape API Gateway" \
      org.opencontainers.image.description="API Gateway with NGINX reverse proxy and Node.js middleware" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="DreamScape" \
      org.opencontainers.image.licenses="PROPRIETARY"

# Image optimization metadata
LABEL dockerfile.stage="multi-stage" \
      dockerfile.optimization="layer-caching,alpine-base,non-root-user,nginx-nodejs" \
      service.ports="3000,3100" \
      service.type="gateway" \
      service.stack="nginx,nodejs" \
      build.target-size="<300MB"