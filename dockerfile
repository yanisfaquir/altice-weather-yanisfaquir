# Development Dockerfile with CORS proxy
FROM node:20-alpine

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli@18

# Copy package files
COPY package*.json ./
RUN npm install

# Copy all source code including proxy config
COPY . .

# Expose port
EXPOSE 3500

# Start with proxy configuration
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "3500", "--disable-host-check", "--poll", "2000"]
