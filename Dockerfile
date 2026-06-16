# Single image: build the Vue client and run the Express API with Bun.
# In production the API serves the built SPA (see server/app.js), so no
# separate web server (nginx) container is needed.

# Stage 1: build the client with Bun.
# VITE_APP_BACKEND_URL defaults to empty so the SPA calls the API on the
# same origin it is served from. Override with --build-arg to target another API.
FROM oven/bun:1 AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN bun install
COPY client/ ./
ARG VITE_APP_BACKEND_URL=""
ENV VITE_APP_BACKEND_URL=$VITE_APP_BACKEND_URL
RUN bun run build

# Stage 2: install the server and serve the API + built SPA with Bun.
FROM oven/bun:1 AS server
WORKDIR /app/server
COPY server/package.json ./
RUN bun install --production
COPY server/ ./
COPY --from=client-build /app/client/dist ./dist
ENV NODE_ENV=production
ENV PORT=5002
EXPOSE 5002
CMD ["bun", "index.js"]
