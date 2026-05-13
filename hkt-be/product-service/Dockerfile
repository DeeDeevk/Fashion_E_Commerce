# Stage 1: Build ứng dụng - Sửa 17 thành 21
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# 1. Copy bộ cài Maven Wrapper
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# 2. Cấp quyền và tải thư viện
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# 3. Copy source code và đóng gói file JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime - Sửa 17 thành 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file jar từ stage build sang.
COPY --from=build /app/target/*.jar app.jar

# Port này khớp với config (thường product-service là 8083)
EXPOSE 8083

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-Xmx512m", "-Dfile.encoding=UTF-8", "-jar", "app.jar"]