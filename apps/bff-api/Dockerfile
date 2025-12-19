# Build stage
FROM node:20.11.0-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY packages ./packages
COPY apps/bff-api ./apps/bff-api

# Install dependencies
RUN npm ci

# Build shared package
RUN npm run -w packages/shared build

# Build BFF
RUN npm run -w apps/bff-api build

# Production stage
FROM node:20.11.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/bff-api/package.json ./apps/bff-api/

# Install production dependencies only
RUN npm ci --production --workspaces

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/bff-api/dist ./apps/bff-api/dist

# Set working directory to BFF
WORKDIR /app/apps/bff-api

# Expose port (Railway will set PORT env var)
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
