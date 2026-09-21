#!/bin/bash
# ==============================================================================
# Enterprise Academic Resource & Circulation Management Platform (Bibliotech)
# Run All Microservices Script
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

mkdir -p "$DIR/logs"

echo "======================================================================"
echo " Starting Bibliotech Microservices Stack..."
echo "======================================================================"

# 1. Clean up any existing instances on our ports
PORTS=(8761 8080 8081 8082 8083 8084 8085)
for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ ! -z "$PID" ]; then
        echo "Port $PORT is already in use by PID $PID. Stopping..."
        kill -9 $PID 2>/dev/null || true
    fi
done

# 2. Check if JAR files exist
JARS=(
    "backend/eurekaserver/target/eurekaserver-0.0.1-SNAPSHOT.jar"
    "backend/auth-service/target/auth-service-1.0.0.jar"
    "backend/UserService/target/UserService-0.0.1-SNAPSHOT.jar"
    "backend/bookservice/target/bookservice-0.0.1-SNAPSHOT.jar"
    "backend/fine-service/target/fine-service-1.0.0.jar"
    "backend/LoanService/target/LoanService-0.0.1-SNAPSHOT.jar"
    "backend/apigateway/target/apigateway-0.0.1-SNAPSHOT.jar"
)

for JAR in "${JARS[@]}"; do
    if [ ! -f "$JAR" ]; then
        echo "JAR $JAR not found. Packaging reactor..."
        mvn clean package -DskipTests
        break
    fi
done

# 3. Start Eureka Server
echo "-> Starting Eureka Server on port 8761..."
nohup java -jar backend/eurekaserver/target/eurekaserver-0.0.1-SNAPSHOT.jar > logs/eurekaserver.log 2>&1 &
EUREKA_PID=$!
echo "   Eureka PID: $EUREKA_PID"

echo -n "   Waiting for Eureka Server to bind to port 8761..."
for i in {1..30}; do
    if lsof -i :8761 >/dev/null 2>&1; then
        echo " Ready!"
        break
    fi
    echo -n "."
    sleep 1
done

# 4. Start Core Business Services
echo "-> Starting Auth Service (8081)..."
nohup java -jar backend/auth-service/target/auth-service-1.0.0.jar > logs/auth-service.log 2>&1 &
AUTH_PID=$!

echo "-> Starting User Service (8082)..."
nohup java -jar backend/UserService/target/UserService-0.0.1-SNAPSHOT.jar > logs/userservice.log 2>&1 &
USER_PID=$!

echo "-> Starting Book Service (8083)..."
nohup java -jar backend/bookservice/target/bookservice-0.0.1-SNAPSHOT.jar > logs/bookservice.log 2>&1 &
BOOK_PID=$!

echo "-> Starting Fine Service (8085)..."
nohup java -jar backend/fine-service/target/fine-service-1.0.0.jar > logs/fine-service.log 2>&1 &
FINE_PID=$!

echo "-> Starting Loan Service (8084)..."
nohup java -jar backend/LoanService/target/LoanService-0.0.1-SNAPSHOT.jar > logs/loanservice.log 2>&1 &
LOAN_PID=$!

echo "-> Starting API Gateway (8080)..."
nohup java -jar backend/apigateway/target/apigateway-0.0.1-SNAPSHOT.jar > logs/apigateway.log 2>&1 &
GATEWAY_PID=$!

echo "======================================================================"
echo " Waiting for all 7 microservices to initialize..."
echo "======================================================================"

ALL_READY=false
for attempt in {1..40}; do
    READY_COUNT=0
    for PORT in "${PORTS[@]}"; do
        if lsof -i :$PORT >/dev/null 2>&1; then
            READY_COUNT=$((READY_COUNT + 1))
        fi
    done
    if [ "$READY_COUNT" -eq 7 ]; then
        ALL_READY=true
        break
    fi
    echo -n "   [$attempt/40] $READY_COUNT/7 services listening..."
    echo ""
    sleep 2
done

echo ""
echo "======================================================================"
echo " MICROSERVICES RUNNING STATUS"
echo "======================================================================"
printf "%-18s | %-6s | %-7s | %-10s\n" "SERVICE" "PORT" "PID" "STATUS"
printf -- "-------------------+--------+---------+-----------\n"
printf "%-18s | %-6s | %-7s | %-10s\n" "Eureka Server" "8761" "$(lsof -ti :8761 2>/dev/null || echo '-')" "$(lsof -i :8761 >/dev/null 2>&1 && echo 'ONLINE' || echo 'WAITING')"
printf "%-18s | %-6s | %-7s | %-10s\n" "API Gateway" "8080" "$(lsof -ti :8080 2>/dev/null || echo '-')" "$(lsof -i :8080 >/dev/null 2>&1 && echo 'ONLINE' || echo 'WAITING')"
printf "%-18s | %-6s | %-7s | %-10s\n" "Auth Service" "8081" "$(lsof -ti :8081 2>/dev/null || echo '-')" "$(lsof -i :8081 >/dev/null 2>&1 && echo 'ONLINE' || echo 'WAITING')"
printf "%-18s | %-6s | %-7s | %-10s\n" "User Service" "8082" "$(lsof -ti :8082 2>/dev/null || echo '-')" "$(lsof -i :8082 >/dev/null 2>&1 && echo 'ONLINE' || echo 'WAITING')"
printf "%-18s | %-6s | %-7s | %-10s\n" "Book Service" "8083" "$(lsof -ti :8083 2>/dev/null || echo '-')" "$(lsof -i :8083 >/dev/null 2>&1 && echo 'ONLINE' || echo 'WAITING')"
printf "%-18s | %-6s | %-7s | %-10s\n" "Loan Service" "8084" "$(lsof -ti :8084 2>/dev/null || echo '-')" "$(lsof -i :8084 >/dev/null 2>&1 && echo 'ONLINE' || echo 'WAITING')"
printf "%-18s | %-6s | %-7s | %-10s\n" "Fine Service" "8085" "$(lsof -ti :8085 2>/dev/null || echo '-')" "$(lsof -i :8085 >/dev/null 2>&1 && echo 'ONLINE' || echo 'WAITING')"
echo "======================================================================"
echo " Eureka Dashboard: http://localhost:8761"
echo " API Gateway Entry: http://localhost:8080"
echo " Logs stored in: $DIR/logs/"
echo " To stop all services: ./stop-all.sh"
echo "======================================================================"
