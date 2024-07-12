FROM node:18.19.0

ENV APP_ROOT /src
ARG ACTIVE_PROFILE production

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}

COPY package.json ${APP_ROOT}
RUN npm install

ADD . ${APP_ROOT}
COPY ./.env.${ACTIVE_PROFILE} ${APP_ROOT}/.env

#RUN rm -rf ./node_modules
#RUN rm -f ./package-lock.json

RUN npm run build

ENV HOST 0.0.0.0

RUN pwd
RUN ls -la ${APP_ROOT}

ENTRYPOINT npm run start