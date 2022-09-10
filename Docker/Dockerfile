FROM node:lts-alpine

RUN set -ex && mkdir /app \
    && cd app \
    && apk update \
    && apk add git \
    && git clone https://github.com/Solar-Tweaks/LunarSocket.git /app/ \
    && chmod -R 777 /app 

WORKDIR /app

RUN npm install && npm run build

WORKDIR /app

#this port = your config.json Port ! 
#If u dont know what it is , Dont change it !
EXPOSE 80

#npm start
ENTRYPOINT ["npm", "start"]