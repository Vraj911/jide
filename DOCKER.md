# Docker Guide

## Purpose
Use Docker to run the Next.js full-stack app in a reproducible environment.

## Build and run locally
```bash
docker compose up --build
```

Application endpoint:
- `http://localhost:3000`

## Build image manually
```bash
docker build -t jide-app .
```

For cross-platform builds (example: linux amd64):
```bash
docker build --platform=linux/amd64 -t jide-app .
```

## Push to registry
```bash
docker tag jide-app myregistry.com/jide-app:latest
docker push myregistry.com/jide-app:latest
```

## Notes
- ensure required environment variables are provided at runtime
- do not commit build output directories (such as `.next`) into version control
