FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Make wait script executable
RUN chmod +x wait-for-postgres.sh || true

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "dev"]
