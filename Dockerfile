FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
COPY jest.config.js .
COPY src ./src
COPY __tests__ ./__tests__
COPY .env .

RUN npm install --production=false
RUN npx tsc --project tsconfig.json --outDir dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
