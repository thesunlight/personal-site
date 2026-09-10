FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM alpine:3.19
COPY --from=build /app/dist /dist
