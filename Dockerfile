FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the monorepo's yarn.lock and package.json
COPY yarn.lock package.json ./
COPY .yarnrc.yml .yarnrc.yml

COPY packages/front/package.json packages/front/
COPY packages/front/.yarnrc.yml packages/front/.yarnrc.yml


RUN corepack enable && corepack prepare yarn@4.4.0 --activate



# Install dependencies
RUN yarn install

RUN yarn run front:install

# Copy the rest of the application code
COPY . .

RUN
# Build the application
RUN yarn run front:build

# Stage 2: Serve the application with Caddy
FROM caddy:2.8.4-alpine

# Set the working directory
WORKDIR /app

RUN ls -al /app

# Copy the built application from the previous stage
COPY --from=builder /app/packages/front/dist /app/dist

# Copy the Caddyfile
COPY packages/front/Caddyfile app/Caddyfile

# Expose the port that Caddy will serve on
EXPOSE 80

RUN ls -al /app


# Run Caddy
CMD ["caddy", "run", "--config", "app/Caddyfile"]
