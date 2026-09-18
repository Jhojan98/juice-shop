#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-taller-waap/app:latest}"

docker stop waap-app >/dev/null 2>&1 || true
docker rm waap-app >/dev/null 2>&1 || true
docker run -d --name waap-app -p 8080:8080 --restart unless-stopped "$IMAGE"

for _ in $(seq 1 30); do
  if curl -fsS http://localhost:8080/health >/dev/null 2>&1; then
    echo "OK: reglas WAAP desplegadas ($IMAGE)"
    exit 0
  fi
  sleep 2
done
echo "ERROR: la app no respondio tras el despliegue" >&2
exit 1