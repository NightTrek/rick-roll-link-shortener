FROM denoland/deno:alpine-1.37.0

# Create app directory
WORKDIR /app

# Copy dependency files
COPY deno.json ./

# Copy source code and static files
COPY src/ ./src/
COPY public/ ./public/

# Create data directory for KV store
RUN mkdir -p data

# Grant required permissions
RUN chown -R deno:deno /app

# Switch to non-root user
USER deno

# Cache the dependencies
RUN deno cache src/server.ts

# The port the app runs on
EXPOSE 8000

# Command to run the application in production mode
CMD ["task", "start"]
