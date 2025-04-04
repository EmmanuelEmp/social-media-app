# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the TypeScript files
RUN npm run build  
# Ensure TypeScript compiles inside the container

# Set the command to run the compiled JavaScript file
CMD ["node", "build/server.js"]
