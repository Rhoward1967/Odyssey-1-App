FROM node:22-alpine

# Build tools required by native addons (iltorb, @discordjs/opus)
RUN apk add --no-cache python3 make g++ pkgconf cairo-dev pango-dev libjpeg-turbo-dev giflib-dev pixman-dev

WORKDIR /app

# Install dependencies (all — tsx is a devDependency)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY src/ ./src/
COPY tsconfig.json ./
COPY tsconfig.node.json ./

CMD ["npx", "tsx", "src/start-bot.ts"]
