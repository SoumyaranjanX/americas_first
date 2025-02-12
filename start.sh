#!/bin/sh

# Set default environment variables if not provided
export JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY:-$(cat /app/secrets/private.key)}
export JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY:-$(cat /app/secrets/public.key)}
export AUTH_SERVICE_PORT=${AUTH_SERVICE_PORT:-4000}
export API_GATEWAY_PORT=${PORT:-10000}
export WEB_PORT=${WEB_PORT:-3000}

# Start auth-service in the background
cd /app/auth-service && PORT=$AUTH_SERVICE_PORT npm start &

# Start api-gateway in the background
cd /app/api-gateway && PORT=$API_GATEWAY_PORT npm start &

# Start web app in the foreground (this will keep the container running)
cd /app/web && PORT=$WEB_PORT npm start 