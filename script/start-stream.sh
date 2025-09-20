#!/usr/bin/env bash
docker compose up -d --build
npx tsx script/validate-refresh-token.ts
docker compose logs -f