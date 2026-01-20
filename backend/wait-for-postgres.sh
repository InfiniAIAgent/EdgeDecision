#!/bin/sh
# wait-for-postgres.sh

set -e

host="$1"
shift
cmd="$@"

echo "Waiting for PostgreSQL at $host..."

until node -e "
const { Client } = require('pg');
const client = new Client({
  host: '$host',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'postgres'
});
client.connect()
  .then(() => {
    console.log('PostgreSQL is ready!');
    client.end();
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing command"
exec $cmd
