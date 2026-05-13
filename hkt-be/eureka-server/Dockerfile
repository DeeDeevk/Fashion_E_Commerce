# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Lưu ý: Kiểm tra folder target/ xem tên file jar là gì.
# Thông thường dùng *.jar là an toàn nhất.
COPY --from=build /app/target/*.jar app.jar

# Eureka Server mặc định chạy port 8761
EXPOSE 8761

ENTRYPOINT ["java", "-Dfile.encoding=UTF-8", "-jar", "app.jar"]