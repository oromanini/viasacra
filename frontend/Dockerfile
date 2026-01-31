FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . /app

EXPOSE 3000

# 1. Garante que o servidor aceite conexões externas (não só localhost)
ENV HOST=0.0.0.0

# 2. O comando que faltava para rodar o React
CMD ["yarn", "start"]
