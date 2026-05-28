# Development image: Node 22 + Prisma client + Next.js dev server.
# The source tree is bind-mounted at runtime, so this image only needs the deps.

FROM node:22-alpine

# --- Native dependencies that Prisma and sharp-like libs sometimes pull in.
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install deps in their own layer (cacheable).
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Default command — overridden by compose so we can also run db push + seed.
CMD ["npm", "run", "dev"]
