FROM node:26-trixie-slim@sha256:e6bedef217677b276c591795e169840edd9096dbf13f29df8ef8d1856b8820bc

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NODE_ENV=development
ENV PORT=3200

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc drizzle.config.ts ./
COPY src/db/schema.ts src/db/schema.ts

RUN npm install -g pnpm@11 && pnpm install --frozen-lockfile

EXPOSE $PORT

CMD ["sh", "-c", "pnpm run db:push && if [ \"$SEED_DB\" = \"true\" ]; then pnpm run db:seed; fi && pnpm run dev"]
