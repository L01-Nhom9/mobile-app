# Stage 1: Build JAR với Maven
FROM maven:3.9.9-eclipse-temurin-17 AS build
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: Chạy ứng dụng
FROM openjdk:17-jdk-slim
COPY --from=build /target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]