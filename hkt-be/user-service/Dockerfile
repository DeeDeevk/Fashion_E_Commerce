FROM node:22-alpine

WORKDIR /app

# Copy các file quản lý thư viện
COPY package*.json ./

# Cài đặt toàn bộ thư viện (bao gồm cả ts-node-dev để chạy lệnh dev)
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Port khớp với code Node.js của bạn
EXPOSE 8081

# Chạy lệnh dev trực tiếp
CMD ["npm", "run", "dev"]
