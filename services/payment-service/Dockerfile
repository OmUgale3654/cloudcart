# Multi-stage Dockerfile for CloudCart Payment Service
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S cloudcart && adduser -S cloudcart -G cloudcart
USER cloudcart:cloudcart

COPY target/*-exec.jar app.jar

ENV PORT=8085 \
    SPRING_PROFILES_ACTIVE=docker

EXPOSE 8085

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
