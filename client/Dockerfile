FROM node:18-slim AS builder

WORKDIR /usr/src/app

ARG REACT_APP_SERVER_URL=http://foodie.eugeneasiedu.de
ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

COPY --from=builder /usr/src/app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]