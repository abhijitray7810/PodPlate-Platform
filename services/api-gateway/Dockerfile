FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY api-gateway/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev && cd ..

COPY api-gateway/src/ ./src/
COPY shared/ ./shared/
RUN ln -s /app/shared /shared

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
