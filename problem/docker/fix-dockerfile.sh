#!/bin/bash
# Run this from: /mnt/c/Downloads/OneDrive/Desktop/PodPlate-Platform/Podplate
# It overwrites each service's Dockerfile with the corrected version.

set -e

SERVICES_DIR="./services"

write_dockerfile() {
  local SERVICE=$1
  local PORT=$2
  local OUT="$SERVICES_DIR/$SERVICE/Dockerfile"

  cat > "$OUT" <<EOF
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Install service dependencies
COPY $SERVICE/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Install shared dependencies (needed for ESM resolution from /app/shared)
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev && cd ..

# Copy source files
COPY $SERVICE/src/ ./src/
COPY shared/ ./shared/

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["npm", "start"]
EOF

  echo "✅ Written: $OUT (port $PORT)"
}

write_dockerfile "auth-service"         3001
write_dockerfile "user-service"         3002
write_dockerfile "product-service"      3003
write_dockerfile "restaurant-service"   3004
write_dockerfile "cart-service"         3005
write_dockerfile "order-service"        3006
write_dockerfile "payment-service"      3007
write_dockerfile "notification-service" 3008

# api-gateway mounts shared at /app/shared already, same fix applies
cat > "$SERVICES_DIR/api-gateway/Dockerfile" <<EOF
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY api-gateway/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev && cd ..

COPY api-gateway/src/ ./src/
COPY shared/ ./shared/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
EOF
echo "✅ Written: $SERVICES_DIR/api-gateway/Dockerfile (port 3000)"

echo ""
echo "All Dockerfiles updated. Now run:"
echo "  docker compose down"
echo "  docker compose build --no-cache"
echo "  docker compose up"
