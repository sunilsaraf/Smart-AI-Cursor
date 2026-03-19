#!/bin/bash

set -e

echo "Running database migrations..."

export $(cat .env | grep -v '^#' | xargs)

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set"
  exit 1
fi

echo "Applying schema..."
psql $DATABASE_URL < apps/api/src/db/schema.sql

echo "Migrations complete!"
