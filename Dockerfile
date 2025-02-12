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

# Set environment variables for Puppeteer and configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PORT=10000
ENV JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9QFi6EO3JN7Lg\nYGHgvrCHqZP4cMXwgspO7FYnNJb1bSgEA7Ku6QHlbNrJr9BkR0qRalVbzHhAJCxz\nVxd3IvwXdh3jU4HI3Vk5fC5XL1BSh0QCkQ3E1nbR4dxH+UBNGHIJXvYhfSZuXzwC\nOY4B8Z50uGIz9zZ+ViIxNLPzjholJFaUEjaK8Z8DwgYxDWmMh4XJDRTdMsNTr3Wq\nYcDuqK+l2yyxZY7Fqx4UzrP9MPACkr7eHkYHh6L9qn4pIxOpZYYHuUbFNJABxN7t\nHBs84P4QYoiV5HX+VF4vz4kJJrh+F3Xk8KoYaix9h4AZQE7m5Z3qjU/8Uq4HCNR7\nAgMBAAECggEAJz0FuEj0BV7TEi6jNI8WozcVJ+3Yw0xTuJtVuUZxWrpK4LfXhqGY\n1s7VyxhiPWEqiEIzvE0BHHQyEUYbKqBwPQQBmSrEVrPGxHJQeMX5QCxZjxJV1Qv+\nKgqXk6gF3X1UZFswJxgHDjvUw2cXXI5vBgtAUFjLHQD1qhNqVXDEHhDtYqxGhwzH\nN6UgUTtY4UYqeI9rEmXWJhQMYMXUYn4OgwS+AYHKzGpHJqUZ1C4vPFbHBbaxqv5x\nKEA5bXJXDz+8xv5hmDgGJK6eZxhRZa5Yw+DhQb4FioVR5zA0zcnHKXm1qT4fJwcq\nLhJy4jKxIzqIWEXjDuWsB4F4E9RtqQKBgQDlHLRx8FLx0QWB1C4vK1+JEqEUV7Yk\nZJb3WcFI4Z4jbA6JkIxJQZqBdB7LQytY5IqOMaEYFvhS8eQdF4U+MXfZzqZ0Qm6S\nVwUClvj1IjAXJPHNjLBbYRcnFrpHnqHYYT6NsqeQKHHGTZ6hFjuZMNVEIvTFEv8h\nKQKBgQDTLjYKxEqGrY4zLx3ZUNFtP5dY6CbZhPiBR8iVcSxhVo4UZ3Kp6qiVWWh4\nZuHZxuJjPHnJ+l8BhBkU2oHDkBTXqQDvJyQjg+YhQCjh+Yf1Q2Z+MyVxXXLZNVJB\nZYHYE5EYxHmtHXzH5oHQvYhF5g2E4gICAQECAwEAAQKBgQC9QFi6EO3JN7LgYGHg\nvrCHqZP4cMXwgspO7FYnNJb1bSgEA7Ku6QHlbNrJr9BkR0qRalVbzHhAJCxzVxd3\nIvwXdh3jU4HI3Vk5fC5XL1BSh0QCkQ3E1nbR4dxH+UBNGHIJXvYhfSZuXzwCOY4B\n8Z50uGIz9zZ+ViIxNLPzjholJFaUEjaK8Z8DwgYxDWmMh4XJDRTdMsNTr3WqYcDu\nqK+l2yyxZY7Fqx4UzrP9MPACkr7eHkYHh6L9qn4pIxOpZYYHuUbFNJABxN7tHBs8\n4P4QYoiV5HX+VF4vz4kJJrh+F3Xk8KoYaix9h4AZQE7m5Z3qjU/8Uq4HCNR7\n-----END PRIVATE KEY-----"
ENV JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvUBYuhDtyTey4GBh4L6w\nh6mT+HDF8ILKTuxWJzSW9W0oBAOyrukB5WzayafQZEdKkWpVW8x4QCQsc1cXdyL8\nF3Yd41OByN1ZOXwuVy9QUodEApENxNZ20eHcR/lATRhyCV72IX0mbl88AjmOAfGe\ndLhiM/c2flYiMTSz844aJSRWlBI2ivGfA8IGMQVpjIeFyQ0U3TLDU691qmHA7qiv\npdssWWWOxaseF86z/TDwApK+3h5GB4ei/ap+KSMTqWWGB7lGxTSQAcTe7RwbPOD+\nEGKIleR1/lReL8+JCSa4fhd15PCqGGosfeOAGUBO5uWd6o1P/FKuBwjUewIDAQAB\n-----END PUBLIC KEY-----"
ENV NODE_ENV=development
ENV MONGODB_URI="mongodb://admin:password123@mongodb:27017/auth?authSource=admin"
ENV REDIS_URL="redis://redis:6379"

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

EXPOSE $PORT

CMD ["./start.sh"] 