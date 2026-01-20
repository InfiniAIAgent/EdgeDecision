# 🔧 Docker Troubleshooting Guide

## Error: "unable to get image postgres:15-alpine - 500 Internal Server Error"

This error means Docker can't download images. Here are solutions:

---

## Solution 1: Restart Docker Desktop ⭐ (Try This First)

### Mac:
```bash
# 1. Quit Docker
# Click Docker icon in menu bar → "Quit Docker Desktop"

# 2. Wait 10 seconds

# 3. Open Docker Desktop from Applications

# 4. Wait for "Docker Desktop is running" status

# 5. Verify Docker is working
docker ps

# 6. Try again
docker-compose up --build
```

### Windows:
```powershell
# 1. Right-click Docker icon in system tray → Quit

# 2. Wait 10 seconds

# 3. Start Docker Desktop from Start menu

# 4. Wait for "Docker Desktop is running"

# 5. Verify
docker ps

# 6. Try again
docker-compose up --build
```

---

## Solution 2: Clear Docker Cache

```bash
# Stop all containers
docker-compose down

# Remove all stopped containers
docker container prune -f

# Remove all unused images
docker image prune -a -f

# Remove all volumes (WARNING: Deletes data)
docker volume prune -f

# Try pulling images manually
docker pull postgres:15
docker pull redis:7
docker pull node:18-alpine

# Then try starting again
docker-compose up --build
```

---

## Solution 3: Check Docker Settings

### Mac:
1. Open Docker Desktop
2. Click Settings (gear icon)
3. Go to "Resources"
4. Increase memory to at least 4GB
5. Click "Apply & Restart"

### Windows:
1. Open Docker Desktop
2. Settings → Resources
3. Set Memory: 4GB minimum
4. Click "Apply & Restart"

---

## Solution 4: Check Internet Connection

```bash
# Test if you can reach Docker Hub
ping registry-1.docker.io

# Try downloading image directly
docker pull postgres:15

# If this fails, check:
# - VPN/Proxy settings
# - Firewall settings
# - Corporate network restrictions
```

---

## Solution 5: Use Different Docker Registry

If Docker Hub is blocked, use GitHub Container Registry:

Edit `docker-compose.yml`:
```yaml
postgres:
  image: ghcr.io/postgres/postgres:15  # Changed
  
redis:
  image: ghcr.io/redis/redis:7  # Changed
```

---

## Solution 6: Run Without Docker ⭐ (Easiest Alternative)

If Docker keeps failing, run everything manually:

```bash
# 1. Run the setup script
./manual-setup.sh

# 2. Edit backend/.env with your API keys

# 3. Start PostgreSQL
# Mac: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql
# Windows: Check Services app

# 4. Start Backend (Terminal 1)
cd backend
npm run dev

# 5. Start Frontend (Terminal 2)
cd frontend
npm start

# 6. Open http://localhost:3000
```

**This works exactly the same, just without containers!**

---

## Solution 7: Check Docker Version

```bash
# Check Docker version
docker --version

# Should be at least Docker 20.10+
# If older, update Docker Desktop
```

### Update Docker Desktop:
- Mac: Download from https://www.docker.com/products/docker-desktop
- Windows: Download from https://www.docker.com/products/docker-desktop

---

## Solution 8: Reset Docker to Factory Defaults

⚠️ **WARNING: This deletes all Docker data**

### Mac:
1. Docker Desktop → Settings
2. Click "Troubleshoot" in left menu
3. Click "Reset to factory defaults"
4. Wait for reset to complete
5. Try again

### Windows:
1. Docker Desktop → Settings
2. Troubleshoot → Reset to factory defaults
3. Confirm
4. Try again

---

## Verify Docker is Working

After trying fixes, test Docker:

```bash
# 1. Check Docker daemon
docker info

# Should show server version, no errors

# 2. Pull a small image
docker pull hello-world

# 3. Run it
docker run hello-world

# Should print "Hello from Docker!"

# 4. If above works, try your app
docker-compose up --build
```

---

## Still Having Issues?

### Check System Requirements:

**Mac:**
- macOS 10.15 or newer
- 4GB RAM minimum

**Windows:**
- Windows 10 64-bit Pro, Enterprise, or Education
- WSL 2 enabled
- 4GB RAM minimum

### Common Issues:

**"Docker Desktop requires WSL 2" (Windows)**
```powershell
# Enable WSL 2
wsl --install
wsl --set-default-version 2

# Restart computer
# Install Docker Desktop again
```

**"Cannot connect to Docker daemon" (Linux)**
```bash
# Start Docker service
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
```

**"Port already in use"**
```bash
# Check what's using the port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in docker-compose.yml
```

---

## Quick Decision Tree

```
Can't get Docker working?
│
├─ Have you restarted Docker Desktop?
│  └─ NO → Do that first! ⭐
│  └─ YES → Continue below
│
├─ Does 'docker ps' work?
│  └─ NO → Docker daemon not running, restart Docker Desktop
│  └─ YES → Continue below
│
├─ Can you pull images manually?
│  └─ docker pull postgres:15
│  │
│  ├─ NO → Check internet/firewall/VPN
│  └─ YES → Clear cache and try again
│
└─ Still not working?
   └─ Use manual setup (no Docker) ⭐
      ./manual-setup.sh
```

---

## Recommended: Manual Setup (No Docker)

**Honestly, if you're having Docker issues, just skip it:**

```bash
# One command to set everything up
./manual-setup.sh

# Then just run:
cd backend && npm run dev  # Terminal 1
cd frontend && npm start   # Terminal 2

# Works exactly the same! 🎉
```

**Advantages:**
✅ No Docker issues
✅ Faster startup
✅ Easier debugging
✅ See logs directly
✅ Same functionality

**Only difference:**
- You manage PostgreSQL yourself (usually already installed)
- Two terminal windows instead of one
- That's it!

---

## Get Help

If none of this works, let me know:
- Your operating system
- Docker Desktop version
- Exact error message
- Output of `docker info`

I'll help debug further!
