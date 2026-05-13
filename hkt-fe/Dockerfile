FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Vite cần flag --host để có thể truy cập được từ bên ngoài container
CMD ["npm", "run", "dev", "--", "--host"]