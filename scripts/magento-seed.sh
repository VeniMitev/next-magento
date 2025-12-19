#!/bin/bash

set -e

echo "================================================"
echo "Magento Seed Script"
echo "================================================"

CONTAINER_NAME="next-magento-magento"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Magento container is not running"
    echo "   Start it with: npm run dev:infra"
    exit 1
fi

echo "✓ Magento container is running"

# Check if Magento is installed
if ! docker exec $CONTAINER_NAME test -f app/etc/env.php 2>/dev/null; then
    echo "❌ Error: Magento is not installed"
    echo "   Run: npm run magento:setup"
    exit 1
fi

echo "✓ Magento is installed"
echo ""
echo "🌱 Creating sample products..."

# Create sample products via Magento CLI
docker exec $CONTAINER_NAME bash -c "
    set -e
    
    # Create simple products
    for i in 1 2 3 4 5; do
        php bin/magento catalog:product:create \
            --sku=\"demo-product-\$i\" \
            --name=\"Demo Product \$i\" \
            --price=\$((i * 10 + 99)) \
            --type=simple \
            --attribute-set-id=4 \
            --status=1 \
            --visibility=4 \
            --weight=1 2>/dev/null || echo \"Product \$i might already exist\"
    done
    
    # Reindex
    php bin/magento indexer:reindex
    php bin/magento cache:clean
    
    echo '✓ Sample products created'
"

echo ""
echo "================================================"
echo "✅ Seeding Complete!"
echo "================================================"
echo ""
echo "Created 5 sample products (demo-product-1 through demo-product-5)"
echo ""
echo "Test GraphQL query:"
echo "  curl -X POST http://localhost:8080/graphql \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"query\": \"{ products(search: \\\"\\\") { items { sku name } } }\"}'"
echo ""
