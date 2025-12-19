# Next Magento Monorepo

A batteries-included headless commerce setup featuring Adobe Commerce (Magento), NestJS BFF API, and Next.js storefront. Railway-ready for production deployment.

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js       │  Storefront (Port 3000)
│   Storefront    │  - App Router
│                 │  - Tailwind CSS
│                 │  - TanStack Query
└────────┬────────┘  - Zustand
         │
         │ HTTP
         ▼
┌─────────────────┐
│   NestJS BFF    │  Backend for Frontend (Port 4000)
│   (Fastify)     │  - GraphQL client
│                 │  - Redis caching
└────────┬────────┘  - Zod validation
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────┐
│Magento │ │Redis │
│GraphQL │ │Cache │
│:8080   │ │:6379 │
└────────┘ └──────┘
```

## 📦 Repository Structure

```
/apps
  /storefront-next          # Next.js storefront
  /bff-api                  # NestJS BFF API
/infra
  /magento                  # Magento Docker setup
  /redis                    # Redis config
/packages
  /shared                   # Shared types and utilities
/scripts
  magento-setup.sh          # Magento installation script
  magento-seed.sh           # Sample data seeding
docker-compose.yml          # Infrastructure orchestration
package.json                # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.11.0 (see `.nvmrc`)
- Docker & Docker Compose
- 8GB+ RAM for Magento

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Infrastructure

```bash
npm run dev:infra
```

This starts:

- **Redis** on port 6379
- **Magento** on port 8080 (with MySQL & Elasticsearch)

Wait 2-3 minutes for services to be healthy:

```bash
docker-compose ps
```

### 3. Setup Environment Variables

```bash
# BFF API
cp apps/bff-api/.env.example apps/bff-api/.env

# Storefront
cp apps/storefront-next/.env.example apps/storefront-next/.env.local
```

### 4. Setup Magento (First Time Only)

```bash
npm run magento:setup
```

This will:

- Install Magento Open Source 2.4.6 using the Mage-OS mirror (no authentication required)
- Configure GraphQL endpoint
- Create admin user

⏱️ Takes 5-10 minutes on first run.

**Note:** The setup uses the community-maintained Mage-OS mirror to avoid Magento Marketplace authentication requirements. See `/infra/magento/README.md` for details on using the official repository if needed.

### 5. Seed Sample Products

```bash
npm run magento:seed
```

Creates 5 demo products for testing.

### 6. Start Development Servers

```bash
npm run dev
```

This starts:

- **BFF API** on http://localhost:4000
- **Storefront** on http://localhost:3000

## 🌐 Access Points

| Service         | URL                                | Credentials       |
| --------------- | ---------------------------------- | ----------------- |
| Storefront      | http://localhost:3000              | -                 |
| BFF Health      | http://localhost:4000/health       | -                 |
| BFF Products    | http://localhost:4000/api/products | -                 |
| Magento Admin   | http://localhost:8080/admin        | admin / Admin123! |
| Magento GraphQL | http://localhost:8080/graphql      | -                 |

## 📝 Available Scripts

### Root Commands

```bash
npm run dev              # Start everything (infra + apps)
npm run dev:infra        # Start Docker services only
npm run dev:apps         # Start BFF + Next.js only
npm run build            # Build all workspaces
npm run lint             # Lint all code
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run typecheck        # Type check all TypeScript
npm run test             # Run all tests
npm run magento:setup    # Install Magento
npm run magento:seed     # Seed sample products
npm run infra:stop       # Stop Docker services
npm run infra:clean      # Stop and remove volumes
```

### Workspace-Specific Commands

```bash
# BFF API
npm run build:bff        # Build BFF
npm run start:bff        # Start BFF production
npm run -w apps/bff-api test  # Run BFF tests

# Storefront
npm run build:next       # Build Next.js
npm run start:next       # Start Next.js production
```

## 🧪 Testing

### BFF API Tests

```bash
npm run -w apps/bff-api test
```

Includes:

- Environment validation tests
- Cache service tests

## 🔧 Development

### BFF API Endpoints

#### `GET /health`

```json
{ "status": "ok" }
```

#### `GET /api/products`

Returns product list with 60s Redis cache.

#### `GET /api/products/:sku`

Returns product details with 60s Redis cache.

#### `GET /api/config`

```json
{ "bffVersion": "0.1.0" }
```

### Error Handling

When Magento is unavailable, the BFF returns:

```json
{
  "error": "MAGENTO_UNAVAILABLE",
  "message": "Magento GraphQL endpoint unreachable",
  "hint": "Start infra with npm run dev:infra and verify http://localhost:8080/graphql"
}
```

### Storefront Features

- **Product List** (`/products`)
  - Grid/List view toggle
  - Currency selector (USD, EUR, GBP)
  - Loading and error states
  - Empty state with setup hints

- **Product Detail** (`/products/[sku]`)
  - Image gallery
  - Price display
  - HTML description rendering
  - 404 handling

- **Preferences** (Zustand + localStorage)
  - Grid mode preference
  - Preferred currency
  - Persisted across sessions

## 🐳 Docker Services

### Magento

- **Image**: PHP 8.1 + Apache + Magento 2.4.6
- **Port**: 8080
- **Database**: MySQL 8.0
- **Search**: Elasticsearch 7.17

See `infra/magento/README.md` for details.

### Redis

- **Image**: redis:7-alpine
- **Port**: 6379
- **Persistence**: Named volume

## 🚢 Railway Deployment

### Prerequisites

1. Railway account
2. Railway CLI or GitHub integration

### Deploy Services

#### 1. Redis (Managed)

```bash
railway add
# Select: Redis
```

Note the connection URL.

#### 2. BFF API

```bash
railway up
```

Environment variables:

```
MAGENTO_GRAPHQL_URL=<your-magento-url>/graphql
REDIS_URL=<railway-redis-url>
PORT=${{PORT}}
```

Build command:

```bash
npm run build:bff
```

Start command:

```bash
npm run start:bff
```

Dockerfile: `apps/bff-api/Dockerfile`

#### 3. Next.js Storefront

```bash
railway up
```

Environment variables:

```
NEXT_PUBLIC_BFF_URL=<railway-bff-url>
```

Build command:

```bash
npm run build:next
```

Start command:

```bash
npm run start:next
```

Dockerfile: `apps/storefront-next/Dockerfile`

#### 4. Magento (Optional)

Magento on Railway requires significant resources (2GB+ RAM). Alternatives:

- Use Magento Cloud
- Deploy on a VPS (DigitalOcean, Linode)
- Use Adobe Commerce managed hosting

For Railway deployment, use `infra/magento/Dockerfile` and ensure:

- Persistent volumes for uploads
- MySQL service
- Elasticsearch service
- At least 2GB RAM allocated

### Railway Configuration

Each service should be configured with:

- **Root Directory**: Leave as root (uses workspace commands)
- **Build Command**: Use workspace-specific build commands
- **Start Command**: Use workspace-specific start commands
- **Dockerfile Path**: Point to service-specific Dockerfile

## 🛠️ Tech Stack

### Storefront

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TanStack Query
- Zustand
- TypeScript

### BFF API

- NestJS 10
- Fastify
- GraphQL Request Client
- IORedis
- Zod
- TypeScript

### Shared

- Zod schemas
- Shared types
- Fetch utilities

### Infrastructure

- Adobe Commerce (Magento) 2.4.6
- Redis 7
- MySQL 8.0
- Elasticsearch 7.17

### Tooling

- npm workspaces
- ESLint
- Prettier (with Tailwind plugin)
- Jest
- Docker Compose

## 📚 Key Features

✅ **Batteries Included**: Everything configured and ready to run
✅ **Type Safe**: End-to-end TypeScript with Zod validation
✅ **Caching**: Redis caching for Magento responses
✅ **Error Handling**: Friendly errors with setup hints
✅ **Developer Experience**: Hot reload, linting, formatting
✅ **Production Ready**: Docker images for Railway deployment
✅ **Monorepo**: Shared code with npm workspaces
✅ **Testing**: Jest setup with sample tests

## 🐛 Troubleshooting

### Magento container won't start

```bash
# Check logs
docker-compose logs magento

# Clean restart
npm run infra:clean
npm run dev:infra
npm run magento:setup
```

### GraphQL not responding

1. Wait 2-3 minutes after first start
2. Check container health: `docker-compose ps`
3. Verify endpoint: `curl http://localhost:8080/graphql`
4. Check Magento logs: `docker-compose logs magento`

### BFF can't connect to Magento

1. Ensure Magento is running: `docker-compose ps`
2. Test GraphQL directly:
   ```bash
   curl -X POST http://localhost:8080/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ __typename }"}'
   ```
3. Check BFF logs for connection errors
4. Verify `MAGENTO_GRAPHQL_URL` in `apps/bff-api/.env`

### Products not showing

1. Seed products: `npm run magento:seed`
2. Check Magento products exist via admin panel
3. Test GraphQL query directly
4. Clear Redis cache: `docker-compose restart redis`

### Port conflicts

If ports 3000, 4000, 6379, or 8080 are in use:

1. Stop conflicting services
2. Update port mappings in `docker-compose.yml`
3. Update `.env` files accordingly

## 📄 License

MIT

## 🤝 Contributing

This is a monorepo template. Feel free to fork and customize for your needs!

## 🔗 Resources

- [Adobe Commerce (Magento) Docs](https://devdocs.magento.com/)
- [Magento GraphQL Reference](https://devdocs.magento.com/guides/v2.4/graphql/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Railway Documentation](https://docs.railway.app/)
