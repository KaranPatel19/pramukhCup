FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY build/bundle/programs/server/package*.json ./programs/server/
RUN cd programs/server && npm install --production

# Copy app source
COPY build/bundle/ ./

# Set environment variables
ENV PORT=8080
ENV ROOT_URL=http://localhost:8080
ENV MONGO_URL=mongodb://mongo:27017/meteor

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "main.js"]