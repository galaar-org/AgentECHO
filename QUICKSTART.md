# AgentECHO Quick Start Guide

## 🚀 For End Users (Pull from Docker Hub)

### Prerequisites
- Docker & Docker Compose installed
- 5-10 minutes

### Step 1: Clone or Download

```bash
git clone https://github.com/galaar-org/AgentECHO.git
cd AgentECHO
```

Or download just the compose file:
```bash
curl -O https://raw.githubusercontent.com/galaar-org/AgentECHO/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/galaar-org/AgentECHO/main/.env.example
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Generate a secure token
openssl rand -base64 32

# Edit .env and set INGEST_TOKEN to the generated value
nano .env  # or use your preferred editor
```

Minimum required configuration in `.env`:
```env
INGEST_TOKEN=your-generated-token-here
```

### Step 3: Pull Images & Start

```bash
# Pull latest images from Docker Hub
docker compose pull

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 4: Access the Dashboard

Open your browser to:
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### Step 5: Integrate SDK

See [SDK Documentation](./packages/agentecho-sdk/README.md) for integrating with your Next.js app.

---

## 🛠️ For Developers (Build from Source)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for dashboard development)
- Go 1.22+ (for server development)
- pnpm (for Node.js packages)

### Step 1: Clone Repository

```bash
git clone https://github.com/galaar-org/AgentECHO.git
cd AgentECHO
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env and set INGEST_TOKEN
```

### Step 3: Build & Start

```bash
# Build images locally and start
docker compose up -d --build

# Or build without starting
docker compose build
```

### Step 4: Development Mode

For local development without Docker:

**Backend:**
```bash
cd app/agentecho-server
go run ./cmd/server
```

**Dashboard:**
```bash
cd app/agentecho-dashboard
pnpm install
pnpm dev
```

**ClickHouse** (still needed):
```bash
docker compose up clickhouse -d
```

---

## 🔧 Configuration Options

### Essential Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INGEST_TOKEN` | ✅ Yes | API authentication token |
| `CLICKHOUSE_PASSWORD` | ⚠️ Production | Database password (empty OK for dev) |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENTECHO_VERSION` | `latest` | Docker image version |
| `BUFFER_SIZE` | `1000` | Events buffer size |
| `FLUSH_INTERVAL` | `1` | Flush interval (seconds) |
| `DEFAULT_PRICE_PER_1K` | `5.0` | Default pricing per 1K requests |

### Production Variables (Traefik)

| Variable | Default | Description |
|----------|---------|-------------|
| `ACME_EMAIL` | `admin@example.com` | Let's Encrypt email |
| `TRAEFIK_DASHBOARD` | `false` | Enable Traefik dashboard |

---

## 📊 Production Deployment

### With Traefik Reverse Proxy

1. **Set Production Domains in `.env`**:
```env
ACME_EMAIL=you@example.com
```

2. **Update Traefik labels in `docker-compose.yml`**:
   - Replace `agentecho.example.com` with your domain
   - Replace `api.agentecho.example.com` with your API domain

3. **Start with production profile**:
```bash
docker compose --profile production up -d
```

4. **Configure DNS**:
   - Point `agentecho.example.com` → Your server IP
   - Point `api.agentecho.example.com` → Your server IP

### Without Traefik (Simple Setup)

Just run:
```bash
docker compose up -d
```

Access via:
- Dashboard: `http://your-server-ip:3000`
- API: `http://your-server-ip:8080`

---

## 🛑 Stopping & Cleanup

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Remove images
docker compose down --rmi all
```

---

## 🐛 Troubleshooting

### Services won't start

```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs server
docker compose logs clickhouse
```

### ClickHouse health check failing

```bash
# Wait 30 seconds, it takes time to initialize
docker compose ps

# Check ClickHouse logs
docker compose logs clickhouse
```

### Can't connect to dashboard

```bash
# Ensure server is healthy
curl http://localhost:8080/health

# Check if INGEST_TOKEN is set
docker compose exec server env | grep INGEST_TOKEN
```

### Images not pulling

```bash
# Try manual pull
docker pull galaarorg/agentecho-server:latest
docker pull galaarorg/agentecho-dashboard:latest

# Check Docker Hub status
# https://status.docker.com
```

---

## 📚 Next Steps

- [Integrate SDK](./packages/agentecho-sdk/README.md) - Add tracking to your app
- [API Documentation](./app/agentecho-server/README.md) - REST API reference
- [Dashboard Guide](./app/agentecho-dashboard/README.md) - Dashboard features
- [Architecture](./readme.md#-architecture) - System design overview

---

## 🆘 Support

- **Issues**: https://github.com/galaar-org/AgentECHO/issues
- **Discussions**: https://github.com/galaar-org/AgentECHO/discussions
- **Documentation**: See `/docs` folders in each component

---

**Built with ❤️ for the AI era**
