FROM node:26-trixie-slim@sha256:e4db4c914bf8ad241bd24804fc25d272d89bad97e68cdc8a1414862790a02c39

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
