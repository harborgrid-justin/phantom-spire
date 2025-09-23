#!/bin/bash
set -e

# Signal handling for graceful shutdown
_term() {
  echo "Received SIGTERM signal"
  kill -TERM "$child" 2>/dev/null
}

trap _term SIGTERM

# Wait for dependencies (if needed)
if [ "$WAIT_FOR_DB" = "true" ]; then
  echo "Waiting for database to be ready..."
  until curl -f "$DATABASE_URL" >/dev/null 2>&1; do
    echo "Database is unavailable - sleeping"
    sleep 1
  done
  echo "Database is up - executing command"
fi

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run db:migrate
fi

# Seed database if needed
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed
fi

# Start the application
echo "Starting Phantom Spire..."
exec "$@" &

child=$!
wait "$child"