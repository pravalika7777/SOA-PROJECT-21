#!/bin/bash
# ==============================================================================
# Enterprise Academic Resource & Circulation Management Platform (Bibliotech)
# Stop All Microservices Script
# ==============================================================================

echo "Stopping all Bibliotech Microservices..."

PORTS=(8761 8080 8081 8082 8083 8084 8085)

for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ ! -z "$PID" ]; then
        echo "Stopping service on port $PORT (PID: $PID)..."
        kill -15 $PID 2>/dev/null || true
    fi
done

sleep 2

# Force kill any stubborn processes
for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ ! -z "$PID" ]; then
        echo "Force killing remaining process on port $PORT (PID: $PID)..."
        kill -9 $PID 2>/dev/null || true
    fi
done

echo "All Bibliotech microservices have been stopped."
