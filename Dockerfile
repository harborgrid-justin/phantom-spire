# Multi-stage Docker build for enterprise deployment
FROM node:18-alpine AS base

# Install system dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    curl

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY .nvmrc ./
COPY turbo.json ./
COPY tsconfig*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build all packages
RUN npm run build:packages
RUN npm run build

# Production dependencies stage
FROM base AS deps

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata

# Create application directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S phantomspire && \
    adduser -S phantom -u 1001 -G phantomspire

# Copy package files
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy built application
COPY --from=development /app/dist ./dist
COPY --from=development /app/packages/*/dist ./packages/
COPY --from=development /app/packages/*/*.node ./packages/

# Copy runtime files
COPY healthcheck.js ./
COPY scripts/docker-entrypoint.sh ./scripts/

# Set correct permissions
RUN chown -R phantom:phantomspire /app && \
    chmod +x scripts/docker-entrypoint.sh

# Switch to non-root user
USER phantom

# Expose application port
EXPOSE 3000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use entrypoint script for better signal handling
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["npm", "start"]