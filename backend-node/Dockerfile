FROM node:22-alpine

# Install OpenSSL and libc dependencies required for Prisma binary engines on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

# Copy dependency specifications and prisma schemas
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and build Prisma Client
RUN npm install
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Expose ports for dev documentation/fallback
EXPOSE 5001 5011 5012 5013 5014 5015
