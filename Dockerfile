# Use Node.js as the base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./ ./

# Add a build argument for environment mode (default to production)
ARG MODE=production
ENV NODE_ENV=$MODE

# Build the Vite.js app based on the environment
RUN npm run build -- --mode $MODE

# Use Nginx to serve the built app
FROM nginx:alpine

# Copy built files from builder image to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port for Nginx
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
