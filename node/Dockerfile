# Stage: builder
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# install build deps
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

# Stage: runtime
FROM node:20-alpine
WORKDIR /usr/src/app

# install bash and netcat for wait-for-db script
RUN apk add --no-cache bash netcat-openbsd

# copy only what we need from the build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/run-migrations.js ./run-migrations.js
COPY --from=build /usr/src/app/seed-data.js ./seed-data.js
COPY --from=build /usr/src/app/src/migrations ./src/migrations
COPY wait-for-db.sh ./wait-for-db.sh
RUN chmod +x ./wait-for-db.sh

# Install production dependencies (based on copied package*.json)
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["sh", "-c", "node run-migrations.js && node seed-data.js && node dist/index.js"]