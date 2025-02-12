FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy all shared module files first
COPY shared /app/shared/
WORKDIR /app/shared
RUN npm install
RUN npm install -g typescript@5.3.3

# Build shared module with explicit project reference
RUN npx tsc --build tsconfig.json --force

# Install and build api-gateway
WORKDIR /app/api-gateway
COPY api-gateway/package*.json ./
RUN npm install --legacy-peer-deps
RUN npm link ../shared

# Copy api-gateway source
COPY api-gateway/tsconfig.json ./
COPY api-gateway/src ./src

# Build api-gateway with project reference
RUN npx tsc --build tsconfig.json --force --verbose

EXPOSE 8000

CMD ["npm", "start"]