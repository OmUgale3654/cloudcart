# Multi-stage Dockerfile for CloudCart Unified Cloud Backend
# Optimized for Render / Koyeb / Free Cloud Tier (512MB RAM)

# ----------------------------------------------------------------------------
# Stage 1: Build the unified application and dependent modules
# ----------------------------------------------------------------------------
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Copy parent POM and root build files
COPY pom.xml ./

# Copy all domain modules needed by cloudcart-unified
COPY services/common-dto services/common-dto
COPY services/api-gateway services/api-gateway
COPY services/user-service services/user-service
COPY services/product-service services/product-service
COPY services/inventory-service services/inventory-service
COPY services/cart-service services/cart-service
COPY services/order-service services/order-service
COPY services/payment-service services/payment-service
COPY services/notification-service services/notification-service
COPY services/cloudcart-unified services/cloudcart-unified

# Build only the unified artifact and its upstream dependencies
RUN mvn clean package -DskipTests -pl services/cloudcart-unified -am

# ----------------------------------------------------------------------------
# Stage 2: Ultra-lean Production Runtime
# ----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Run as non-privileged security user
RUN addgroup -S cloudcart && adduser -S cloudcart -G cloudcart
USER cloudcart:cloudcart

# Copy compiled executable JAR from builder stage
COPY --from=builder /workspace/services/cloudcart-unified/target/cloudcart-unified-*.jar app.jar

# Configuration for Render / Koyeb dynamic ports and JVM memory optimization
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms128m -Xmx320m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -XX:+TieredCompilation -XX:TieredStopAtLevel=1"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
