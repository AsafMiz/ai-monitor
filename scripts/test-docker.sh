#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# test-docker.sh — Build and smoke-test the Docker image locally
# Verifies the same build that Railway will run.
# Usage: ./scripts/test-docker.sh
# ===================================================================

IMAGE_NAME="ai-monitor-api-test"
CONTAINER_NAME="ai-monitor-api-smoke"
PORT=8000

echo "==> Building Docker image..."
docker build -t "$IMAGE_NAME" .

echo "==> Checking image does NOT contain node/pnpm..."
if docker run --rm "$IMAGE_NAME" which node 2>/dev/null; then
    echo "FAIL: 'node' found in image — Node.js leaked into the Python container"
    exit 1
fi
if docker run --rm "$IMAGE_NAME" which pnpm 2>/dev/null; then
    echo "FAIL: 'pnpm' found in image — pnpm leaked into the Python container"
    exit 1
fi
echo "PASS: No node/pnpm in image"

echo "==> Checking no package.json in /app..."
if docker run --rm "$IMAGE_NAME" test -f /app/package.json 2>/dev/null; then
    echo "FAIL: package.json found in /app — .dockerignore is not working"
    exit 1
fi
echo "PASS: No package.json in /app"

echo "==> Starting container on port $PORT..."
docker run -d --name "$CONTAINER_NAME" \
    -e PORT=$PORT \
    -p $PORT:$PORT \
    "$IMAGE_NAME"

echo "==> Waiting for health check (up to 15s)..."
for i in $(seq 1 15); do
    if curl -sf "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo "PASS: Health check returned 200 after ${i}s"
        HEALTH_RESPONSE=$(curl -s "http://localhost:$PORT/health")
        echo "Response: $HEALTH_RESPONSE"
        docker stop "$CONTAINER_NAME" > /dev/null && docker rm "$CONTAINER_NAME" > /dev/null
        echo ""
        echo "==> All smoke tests passed!"
        exit 0
    fi
    sleep 1
done

echo "FAIL: Health check did not return 200 within 15s"
docker logs "$CONTAINER_NAME"
docker stop "$CONTAINER_NAME" > /dev/null && docker rm "$CONTAINER_NAME" > /dev/null
exit 1
