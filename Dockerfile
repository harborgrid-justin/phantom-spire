# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove dev dependencies to keep image lean
RUN npm prune --production

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S phantom -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R phantom:nodejs /app
USER phantom

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]