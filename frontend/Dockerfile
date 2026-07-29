FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Run Vite in host mode so it listens on all interfaces (0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host"]
