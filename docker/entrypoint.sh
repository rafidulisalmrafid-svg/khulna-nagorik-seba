#!/bin/sh
set -e

PORT=${PORT:-10000}
echo "==> Starting Khulna Seba container on port $PORT..."

# Ensure valid APP_KEY with 32-byte AES base64 encoding
if [ -z "$APP_KEY" ] || [ ${#APP_KEY} -lt 40 ]; then
    echo "==> Setting default valid APP_KEY..."
    export APP_KEY="base64:lIFv76mQqKOFmzLOwWtkowXGuco2uULJ17vW92hugBw="
fi

# Ensure .env exists
if [ ! -f /var/www/html/.env ]; then
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Update .env values
sed -i "s|^APP_KEY=.*|APP_KEY=$APP_KEY|" /var/www/html/.env
sed -i "s|^APP_ENV=.*|APP_ENV=${APP_ENV:-production}|" /var/www/html/.env
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=${APP_DEBUG:-false}|" /var/www/html/.env
sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=${DB_CONNECTION:-sqlite}|" /var/www/html/.env

# Substitute PORT in Nginx configuration
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/http.d/default.conf

# Ensure SQLite database exists and is writable
mkdir -p /var/www/html/database
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    if [ ! -f /var/www/html/database/database.sqlite ]; then
        echo "==> Creating database.sqlite..."
        touch /var/www/html/database/database.sqlite
    fi
    chown -R www-data:www-data /var/www/html/database
    chmod -R 775 /var/www/html/database
fi

# Storage and cache directories
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Clear old cache
php artisan config:clear || true

# Storage symlink
php artisan storage:link --force || true

# Run database migrations
echo "==> Running database migrations..."
php artisan migrate --force

# Seed if database is fresh / not seeded yet
if [ ! -f /var/www/html/database/.seeded ]; then
    echo "==> Seeding database..."
    php artisan db:seed --force || true
    touch /var/www/html/database/.seeded
fi

# Cache configuration and routes for production speed
echo "==> Caching configuration and routes..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Testing Nginx configuration..."
/usr/sbin/nginx -t || true

echo "==> Testing PHP-FPM configuration..."
/usr/local/sbin/php-fpm -t || true

echo "==> Starting Supervisord (PHP-FPM + Nginx)..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
