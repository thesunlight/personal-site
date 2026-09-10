#!/bin/bash
set -e

echo "=== Personal Site Deployment ==="
cd "$(dirname "$0")"

# 1. Create directories
echo "[1/6] Creating directories..."
sudo mkdir -p /var/www/personal-site/uploads
sudo mkdir -p /var/www/personal-site/dist
sudo chown -R deploy:deploy /var/www/personal-site

# 2. Build backend (Docker)
echo "[2/6] Building backend..."
docker compose build ps-api

# 3. Build frontend (Docker) and extract dist
echo "[3/6] Building frontend..."
docker compose build ps-frontend-builder
# Extract frontend dist from the built image
CONTAINER_ID=$(docker create personal-site-ps-frontend-builder:latest)
rm -rf /var/www/personal-site/dist/*
docker cp "$CONTAINER_ID:/dist/." /var/www/personal-site/dist/
docker rm "$CONTAINER_ID"
echo "Frontend dist extracted to /var/www/personal-site/dist/"

# 4. Start backend services
echo "[4/6] Starting services..."
docker compose up -d ps-mysql ps-api
echo "Waiting for backend to be ready..."
sleep 15

# 5. Update Nginx config
echo "[5/6] Updating Nginx configuration..."
sudo cp nginx-personal-site.conf /etc/nginx/sites-available/personal-site
sudo rm -f /etc/nginx/sites-enabled/voidverse
sudo ln -sf /etc/nginx/sites-available/personal-site /etc/nginx/sites-enabled/personal-site
sudo nginx -t && sudo systemctl reload nginx

# 6. Health check
echo "[6/6] Health check..."
sleep 5
if curl -sf http://127.0.0.1:8080/api/site/config > /dev/null 2>&1; then
    echo "Backend API is healthy!"
else
    echo "WARNING: Backend API not responding yet, check logs: docker compose logs ps-api"
fi

echo ""
echo "=== Deployment complete! ==="
echo "Visit: https://huangml.com"
echo "Admin: https://huangml.com/admin/login (admin / admin123)"
