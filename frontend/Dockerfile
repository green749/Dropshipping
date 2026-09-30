# Stage 1: Build React App with Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite application for production
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration for frontend SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
