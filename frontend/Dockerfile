 # Stage 1: Build React App
FROM node:18-alpine as build
WORKDIR /app
# Argument that will be passed in from docker-compose.yml
ARG ADOBE_API_KEY
# Set it as an environment variable for the build process
ENV REACT_APP_ADOBE_API_KEY=$ADOBE_API_KEY
COPY package*.json ./
RUN npm install
COPY . .
# The build script will bake the env var into the static files
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:1.25-alpine
# Copy the built static files
COPY --from=build /app/build /usr/share/nginx/html
# Copy the NGINX configuration
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
# This command runs when the container starts. It populates the NGINX config template
# and then starts the NGINX server.
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
EXPOSE 80
