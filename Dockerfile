# Stage 1: Build the Angular app in a node.js environment
FROM node:18.20.1 as builder

# Set the working directory inside the Docker image
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json /app/

# Install all dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build the application
RUN npm run build -- --output-path=./dist/out --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the built app from the previous stage
COPY --from=builder /app/dist/out/ /usr/share/nginx/html

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Define the command to run the app using Nginx
CMD ["nginx", "-g", "daemon off;"]
