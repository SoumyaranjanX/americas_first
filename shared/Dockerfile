FROM node:18-alpine

WORKDIR /app/shared

# Copy shared module files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Install dependencies and build
RUN npm install
RUN npm run build

# This is a build stage only, no CMD needed 