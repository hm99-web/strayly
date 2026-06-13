#!/usr/bin/env bash
# Generates src/types/database.ts from the LOCAL Supabase database.
#
# Why not `supabase gen types --local`? CLI >= 2.1xx routes type generation
# through the hosted platform API and demands `supabase login` even for local
# work. This script instead runs the same postgres-meta generator the platform
# uses, as a sibling container on the local stack's network. Fully offline.
set -euo pipefail

cd "$(dirname "$0")/.."

NETWORK=$(docker network ls --format '{{.Name}}' | grep -i strayly | head -1)
IMAGE=$(docker inspect supabase_db_Strayly --format '{{.Config.Image}}' >/dev/null 2>&1 && \
        docker inspect supabase_pg_meta_Strayly --format '{{.Config.Image}}')

if [[ -z "${NETWORK:-}" || -z "${IMAGE:-}" ]]; then
  echo "Local Supabase stack is not running — run 'npx supabase start' first." >&2
  exit 1
fi

docker rm -f pgmeta_typegen >/dev/null 2>&1 || true
docker run -d --rm --name pgmeta_typegen --network "$NETWORK" -p 8085:8080 \
  -e PG_META_DB_URL="postgresql://postgres:postgres@supabase_db_Strayly:5432/postgres" \
  -e PG_META_PORT=8080 "$IMAGE" >/dev/null

trap 'docker rm -f pgmeta_typegen >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 20); do
  if curl -sf "http://127.0.0.1:8085/health" >/dev/null 2>&1; then break; fi
  sleep 0.5
done

curl -sf "http://127.0.0.1:8085/generators/typescript?included_schemas=public&detect_one_to_one_relationships=true" \
  -o src/types/database.ts

echo "Wrote src/types/database.ts ($(wc -c < src/types/database.ts) bytes)"
