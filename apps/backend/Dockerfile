FROM node:22-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

# Copy root package files for workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY apps/backend/ ./apps/backend/

# Build the application
WORKDIR /app/apps/backend
RUN pnpm run build

# Production stage
FROM node:22-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy root package files for workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from the correct path
COPY --from=base /app/apps/backend/dist ./apps/backend/dist

# Copy package.json to the backend dir for runtime
COPY --from=base /app/apps/backend/package.json ./apps/backend/

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application from the correct working directory
WORKDIR /app/apps/backend
CMD ["node", "dist/main.js"] 