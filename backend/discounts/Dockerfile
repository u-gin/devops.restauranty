FROM node:25-alpine

# add curl for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tini && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/app

# have nodemon available for local dev use (file watching)
RUN npm install -g nodemon

COPY package*.json ./

RUN npm ci && \
    npm cache clean --force && \
    mv /usr/local/app/node_modules /node_modules

COPY . .

# set environment variables
ENV PORT=3002
ENV MONGODB_URI=mongodb://127.0.0.1:27017/resturanty

EXPOSE 3002

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]