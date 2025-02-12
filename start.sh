#!/bin/sh

# Start auth-service in the background
cd /app/auth-service && npm start &

# Start api-gateway in the background
cd /app/api-gateway && npm start &

# Start web app in the foreground (this will keep the container running)
cd /app/web && npm start 