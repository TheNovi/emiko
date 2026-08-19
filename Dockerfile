# https://hub.docker.com/hardened-images/catalog/dhi/node
FROM dhi.io/node:26-dev AS base
# FROM ghcr.io/pnpm/pnpm:11 AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME/bin:$PATH
RUN mkdir /data
# RUN corepack enable pnpm #! Issue with permission
RUN npm i -g pnpm
COPY . /app
WORKDIR /app

FROM base AS prod-deps
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpm install --prod --frozen-lockfile

FROM base AS build
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm install --frozen-lockfile
RUN pnpm run build


# Main
FROM dhi.io/node:26-alpine3.24
COPY --from=base /data /data
WORKDIR /app

# This should remove most of CVE's (not needed in hardened)
# RUN npm r -g npm

COPY --from=base /app/package.json .
COPY --from=build /app/build build
COPY --from=prod-deps /app/node_modules node_modules
# RUN ulimit -c unlimited

ENV NODE_ENV=production
ENV DB_URL=file:/data/emiko.db
ENV TZ=utc

EXPOSE 3000
ENTRYPOINT ["node", "build"]
