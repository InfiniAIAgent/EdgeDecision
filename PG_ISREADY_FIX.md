# Quick Fix for "pg_isready: not found" Error

## What Happened?
The backend container was trying to use `pg_isready` command which isn't available in Node Alpine images.

## ✅ FIXED - Just Download New Version

The issue is already fixed in the latest version. Just:

1. Stop Docker: `docker-compose down`
2. Download the new archive
3. Extract and run: `docker-compose up --build`

## What Changed?
Changed from:
```yaml
# Old (broken)
command: until pg_isready... 
```

To:
```yaml  
# New (fixed)
command: sh -c "sleep 5 && npm run migrate && npm run dev"
```

PostgreSQL healthcheck already ensures DB is ready, so we just wait 5 seconds then start.

## If You're Already Running:

```bash
# Stop everything
docker-compose down

# Remove old containers  
docker-compose rm -f

# Rebuild with fixed config
docker-compose up --build
```

You should now see:
```
✅ PostgreSQL ready
✅ Migrations running
✅ Backend starting
✅ Frontend compiling
```

## Verify It's Working:

```bash
# Check containers are running
docker ps

# Should show 4 containers running:
# - edgedecision-db (postgres)
# - edgedecision-redis (redis)
# - edgedecision-backend (node)
# - edgedecision-frontend (node)

# Check backend logs
docker-compose logs backend

# Should see:
# "Server running on port 3001"
# "WebSocket server initialized"
```

Open http://localhost:3000 - should work! 🎉
