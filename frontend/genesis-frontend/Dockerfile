# STAGE 1: Build the React app
# We use Node to compile React into static HTML/CSS/JS files
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
# After this stage, /app/dist contains the compiled frontend

# STAGE 2: Serve the compiled files with Nginx
# We throw away Node and use a tiny web server (Nginx) instead
# This makes the final image much smaller
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]