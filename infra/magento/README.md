# Magento Infrastructure Setup

This directory contains the Docker setup for Adobe Commerce (Magento) Open Source.

## Quick Start

From the repository root:

```bash
# Start infrastructure
npm run dev:infra

# Wait for services to be healthy (2-3 minutes)
docker-compose ps

# Install Magento (first time only)
npm run magento:setup

# Seed sample products
npm run magento:seed
```

## Services

- **Magento**: http://localhost:8080
- **GraphQL Endpoint**: http://localhost:8080/graphql
- **Admin Panel**: http://localhost:8080/admin
  - Username: `admin`
  - Password: `Admin123!`

## First Time Setup

The Magento installation is handled by the `magento-setup.sh` script. This:

1. Checks if Magento is already installed
2. Downloads Magento Open Source 2.4.6-p7 (security patched version) using the Mage-OS mirror (no authentication required)
3. Disables Composer security audits to allow installation (dependencies have known advisories but are required for Magento 2.4.6-p7)
4. Runs the installation wizard
5. Enables GraphQL
6. Configures for local development

**Note:** The script uses the Mage-OS mirror repository and the latest patched version (2.4.6-p7). Composer's `--no-audit` flag is used because some of Magento's dependencies have security advisories. While Magento 2.4.6-p7 itself includes security patches, some of its underlying dependencies still trigger Composer warnings. This is a known issue with Magento installations.

### Why 2.4.6-p7 with --no-audit?

Magento 2.4.6 base version has security advisories that block installation. The -p7 (patch 7) version includes security fixes for Magento itself, but some dependencies (like symfony/process) still have advisories in the versions Magento requires. Using `--no-audit` allows installation while maintaining the security patches that matter for Magento's core functionality.

### Alternative: Using Official Repository with Authentication

If you prefer to use the official Magento repository (requires authentication):

1. Get your Magento authentication keys from https://marketplace.magento.com/customer/accessKeys/
2. Configure Composer authentication in the container:
   ```bash
   docker exec -it next-magento-magento composer config -g http-basic.repo.magento.com <public-key> <private-key>
   ```
3. Then run `npm run magento:setup`

## Seeding Data

The `magento-seed.sh` script creates sample products so the GraphQL queries return data immediately.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs magento

# Restart from clean state
docker-compose down -v
docker-compose up -d
```

### GraphQL not responding

- Wait 2-3 minutes after first start for Magento to complete installation
- Check container health: `docker-compose ps`
- Verify endpoint: `curl http://localhost:8080/graphql`

### Database connection issues

- Ensure MySQL container is healthy
- Check environment variables in docker-compose.yml

## Architecture

- **magento**: PHP 8.1 + Apache + Magento Open Source
- **magento-db**: MySQL 8.0
- **elasticsearch**: Elasticsearch 7.17 (required by Magento)

All services communicate through the `next-magento-network` Docker network.
