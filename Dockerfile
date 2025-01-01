ARG NODE_VERSION="23"

ARG DB_URL=file:data/emiko.db

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
ARG DB_URL
ENV DB_URL=${DB_URL}

COPY package*.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i

COPY . .
RUN mkdir data && \
  pnpm db:push --force && \
  # TODO seed
  pnpm build && \
  pnpm prune --prod


FROM node:${NODE_VERSION}-alpine AS run
WORKDIR /app
ARG DB_URL
ENV NODE_ENV=production
ENV DB_URL=${DB_URL}

COPY --from=build /app/build build
COPY --from=build /app/data data
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules node_modules
# RUN ulimit -c unlimited

EXPOSE 3000
ENTRYPOINT ["node", "build"]
