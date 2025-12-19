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
2. Downloads Magento Open Source
3. Runs the installation wizard
4. Enables GraphQL
5. Configures CORS for local development

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
