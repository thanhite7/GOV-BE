FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
COPY jest.config.js .
COPY src ./src
COPY .env .

RUN npm install
RUN npx tsc --project tsconfig.json --outDir dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
