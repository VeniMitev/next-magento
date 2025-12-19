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

# Download and install Magento
docker exec $CONTAINER_NAME bash -c "
    set -e
    
    # Install Magento via Composer
    composer create-project --repository-url=https://repo.magento.com/ magento/project-community-edition:2.4.6 /tmp/magento
    
    # Copy files to web root
    cp -R /tmp/magento/* /var/www/html/
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html
    
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
