FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Install service dependencies
COPY auth-service/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Install shared dependencies (needed for ESM resolution from /app/shared)
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev && cd ..

# Copy source files
COPY auth-service/src/ ./src/
COPY shared/ ./shared/
RUN ln -s /app/shared /shared

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]
