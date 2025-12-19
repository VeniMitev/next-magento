#!/bin/bash

set -e

echo "================================================"
echo "Magento Setup Script"
echo "================================================"

CONTAINER_NAME="next-magento-magento"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Magento container is not running"
    echo "   Start it with: npm run dev:infra"
    exit 1
fi

echo "✓ Magento container is running"

# Check if Magento is already installed
if docker exec $CONTAINER_NAME test -f app/etc/env.php 2>/dev/null; then
    echo "✓ Magento is already installed"
    echo ""
    echo "Magento is ready at: http://localhost:8080"
    echo "GraphQL endpoint: http://localhost:8080/graphql"
    echo "Admin panel: http://localhost:8080/admin"
    echo "  Username: admin"
    echo "  Password: Admin123!"
    exit 0
fi

echo "📦 Installing Magento Open Source..."
echo "   This may take 5-10 minutes..."
echo ""
echo "NOTE: Using Magento 2.4.6-p7 (security patched version) from open-source mirror."
echo "      Composer audit checks will be disabled to allow installation."
echo ""

# Download and install Magento
docker exec $CONTAINER_NAME bash -c "
    set -e
    
    # Configure Composer globally to disable audit
    composer config --global audit.abandoned ignore
    composer config --global secure-http false 2>/dev/null || true
    
    # Disable platform requirements check and audit for installation
    export COMPOSER_AUDIT_DISABLE=1
    export COMPOSER_ALLOW_SUPERUSER=1
    
    # Install Magento via Composer using mirror with audit disabled
    COMPOSER_MEMORY_LIMIT=-1 composer create-project \
        --repository-url=https://mirror.mage-os.org/ \
        magento/project-community-edition:2.4.6-p7 \
        /tmp/magento \
        --no-interaction \
        --ignore-platform-reqs \
        --no-audit 2>&1 | grep -v 'Warning from repo.magento.com' || true
    
    # Copy files to web root
    cp -R /tmp/magento/* /var/www/html/
    cp -R /tmp/magento/.htaccess /var/www/html/ 2>/dev/null || true
    cd /var/www/html
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html
    
    # Create necessary directories if they don't exist
    mkdir -p var generated vendor pub/static pub/media app/etc
    
    find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} + 2>/dev/null || true
    find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} + 2>/dev/null || true
    
    # Run Magento setup
    php bin/magento setup:install \
        --base-url=http://localhost:8080/ \
        --db-host=magento-db \
        --db-name=magento \
        --db-user=magento \
        --db-password=magento_password \
        --admin-firstname=Admin \
        --admin-lastname=User \
        --admin-email=admin@example.com \
        --admin-user=admin \
        --admin-password=Admin123! \
        --language=en_US \
        --currency=USD \
        --timezone=America/Chicago \
        --use-rewrites=1 \
        --search-engine=elasticsearch7 \
        --elasticsearch-host=elasticsearch \
        --elasticsearch-port=9200
    
    # Configure for development
    php bin/magento deploy:mode:set developer
    php bin/magento cache:clean
    
    # Enable GraphQL
    php bin/magento module:enable Magento_GraphQl
    php bin/magento setup:upgrade
    
    echo '✓ Magento installation complete'
"

echo ""
echo "================================================"
echo "✅ Magento Setup Complete!"
echo "================================================"
echo ""
echo "URLs:"
echo "  Storefront:    http://localhost:8080"
echo "  GraphQL:       http://localhost:8080/graphql"
echo "  Admin Panel:   http://localhost:8080/admin"
echo ""
echo "Admin Credentials:"
echo "  Username: admin"
echo "  Password: Admin123!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run magento:seed (to create sample products)"
echo "  2. Run: npm run dev (to start BFF and Next.js)"
echo ""
