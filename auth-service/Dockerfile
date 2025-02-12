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

# Install and build auth-service
WORKDIR /app/auth-service
COPY auth-service/package*.json ./
RUN npm install --legacy-peer-deps
RUN npm link ../shared

# Copy auth-service source
COPY auth-service/tsconfig.json ./
COPY auth-service/src ./src

# Build auth-service with project reference
RUN npx tsc --build tsconfig.json --force --verbose

EXPOSE 4000

CMD ["npm", "start"]