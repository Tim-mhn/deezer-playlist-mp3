FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ../../yarn.lock ./

RUN corepack enable && corepack prepare yarn@4.4.0 --activate


# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

RUN
# Build the application
RUN yarn run build

# Stage 2: Serve the application with Caddy
FROM caddy:2.4.6-alpine

# Set the working directory
WORKDIR /app

# Copy the built application from the previous stage
COPY --from=builder /app/dist /app/dist

# Copy the Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose the port that Caddy will serve on
EXPOSE 80

# Run Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
