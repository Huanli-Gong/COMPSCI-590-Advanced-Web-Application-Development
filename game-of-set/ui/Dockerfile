FROM node:18-alpine as node
WORKDIR /home/node/app
COPY package*.json ./
COPY . .
RUN npm i
RUN ls -al && npm run build


FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=node /home/node/app/dist ./
COPY --from=node /home/node/app/images ./images

COPY nginx.conf /etc/nginx/nginx.conf

