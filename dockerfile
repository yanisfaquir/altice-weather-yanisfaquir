# Multi-stage Dockerfile for Angular Altice Weather Dashboard

# Stage 1: Build Environment
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build application for production (default locale)
RUN npm run build:pt

# Stage 2: Runtime Environment
FROM nginx:alpine AS runtime

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist/pt /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S altice && \
    adduser -S altice -u 1001 -G altice

# Set ownership
RUN chown -R altice:altice /usr/share/nginx/html && \
    chown -R altice:altice /var/cache/nginx && \
    chown -R altice:altice /var/log/nginx && \
    chown -R altice:altice /etc/nginx/conf.d

# Create nginx PID directory
RUN touch /var/run/nginx.pid && \
    chown -R altice:altice /var/run/nginx.pid

# Switch to non-root user
USER altice

# Expose port
EXPOSE 3500

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3500/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]