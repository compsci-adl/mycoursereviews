FROM node:26-trixie-slim@sha256:715e55e4b84e4bb0ff48e49b398a848f08e55daed8eb6a0ea1839ae53bc57583

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NODE_ENV=development
ENV PORT=3200

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc drizzle.config.ts ./
COPY src/db/schema.ts src/db/schema.ts

RUN npm install -g pnpm@11 && pnpm install --frozen-lockfile

EXPOSE $PORT

CMD ["sh", "-c", "pnpm run db:push && pnpm run dev"]
