# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything else
COPY . .

# Build the app
RUN npm run build

# Expose the port your app runs on (e.g., 3000)
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start:prod"]