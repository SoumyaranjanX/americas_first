FROM node:18-alpine AS base

# Install common build dependencies
RUN apk add --no-cache python3 make g++ \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PORT=10000

# Build shared module
WORKDIR /app
COPY shared /app/shared/
WORKDIR /app/shared
RUN npm install
RUN npm install -g typescript@5.3.3
RUN npx tsc --build tsconfig.json --force

# Build api-gateway
WORKDIR /app/api-gateway
COPY api-gateway/package*.json ./
RUN npm install --legacy-peer-deps
RUN npm link ../shared
COPY api-gateway/tsconfig.json ./
COPY api-gateway/src ./src
RUN npx tsc --build tsconfig.json --force

# Build web app
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install --legacy-peer-deps
COPY web/. .
RUN npm run build

# Build auth-service
WORKDIR /app/auth-service
COPY auth-service/package*.json ./
RUN npm install --legacy-peer-deps
RUN npm link ../shared
COPY auth-service/tsconfig.json ./
COPY auth-service/src ./src
RUN npx tsc --build tsconfig.json --force

# Set up startup script
WORKDIR /app
COPY start.sh .
RUN chmod +x start.sh

# Create directory for JWT keys
RUN mkdir -p /app/secrets
COPY secrets/jwt/* /app/secrets/

EXPOSE $PORT

CMD ["./start.sh"] 