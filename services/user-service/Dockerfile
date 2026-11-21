# Multi-stage Dockerfile for CloudCart User Service
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S cloudcart && adduser -S cloudcart -G cloudcart
USER cloudcart:cloudcart

COPY target/*.jar app.jar

ENV PORT=8081 \
    SPRING_PROFILES_ACTIVE=docker

EXPOSE 8081

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
