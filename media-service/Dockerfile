# This is the Dockerfile for the API Gateway service
# use the official Node.js 18 image

FROM node:18-alpine


# Set the working directory in the container

WORKDIR /usr/src/app

# Copy the dependencies file to the working directory
COPY package*.json ./

# Install the dependencies
RUN  npm ci --only=production

# Copy the content of the local src directory to the working directory
COPY . .

# expose the port on which the server will run
EXPOSE 3003

# Command to run the application

CMD ["node", "src/server.ts"]