FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY jest.config.js .
COPY src ./src

RUN npm ci
RUN npx tsc --project tsconfig.json --outDir dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
