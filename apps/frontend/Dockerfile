# Frontend Dockerfile
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root package files for workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies (workspace aware)
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY apps/frontend/ ./apps/frontend/

# Build the application
RUN cd apps/frontend && pnpm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built application to nginx
COPY --from=base /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 