#!/bin/sh
# Health check script for DreamScape Gateway

# Check NGINX
if ! curl -f http://localhost/health >/dev/null 2>&1; then
    echo "NGINX health check failed"
    exit 1
fi

# Check Node.js Gateway
if ! curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "Node.js Gateway health check failed"
    exit 1
fi

echo "All services healthy"
exit 0