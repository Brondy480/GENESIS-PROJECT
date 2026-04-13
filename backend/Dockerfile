# We start from an official Node.js image (like a clean computer with Node already installed)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first (Docker caches this layer — faster rebuilds)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Tell Docker this app listens on port 8080
EXPOSE 8080

# Command to start the app
CMD ["node", "index.js"]