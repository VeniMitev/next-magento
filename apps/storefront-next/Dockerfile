# Build stage
FROM node:20.11.0-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY packages ./packages
COPY apps/storefront-next ./apps/storefront-next

# Install dependencies
RUN npm ci

# Build shared package
RUN npm run -w packages/shared build

# Build Next.js app
RUN npm run -w apps/storefront-next build

# Production stage
FROM node:20.11.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/storefront-next/package.json ./apps/storefront-next/

# Install production dependencies
RUN npm ci --production --workspaces

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/storefront-next/.next ./apps/storefront-next/.next
COPY --from=builder /app/apps/storefront-next/public ./apps/storefront-next/public
COPY --from=builder /app/apps/storefront-next/next.config.js ./apps/storefront-next/

# Set working directory
WORKDIR /app/apps/storefront-next

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
