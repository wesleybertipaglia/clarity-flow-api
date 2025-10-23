FROM node:20-alpine AS builder

WORKDIR /api

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /api

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=builder /api/node_modules ./node_modules
COPY --from=builder /api/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start"]
