# ===================================================================
# Stage 1: Build Stage (Maven + OpenJDK 21)
# ===================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy pom.xml and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===================================================================
# Stage 2: Minimal Production Runtime (JRE 21 Alpine)
# ===================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# DevSecOps Hardening: Create non-root system group & user
RUN addgroup -S spring && adduser -S spring -G spring

# Copy compiled jar from builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

# Switch to non-privileged user
USER spring:spring

# Expose default HTTP port
EXPOSE 8080

# Production JVM tuning for Koyeb Free Nano (512MB RAM limit):
# - MaxRAMPercentage=75.0: Limits heap to ~384MB
# - UseSerialGC: Ultra-low GC memory overhead (saves 30-50MB RAM compared to G1GC)
# - Xss256k: Small thread stack size (saves RAM per thread)
# - Djava.security.egd: Fast startup entropy
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -Xss256k -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
