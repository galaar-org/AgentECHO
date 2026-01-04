# Database Schema

IntelliTrack is a client-side SDK that sends events to your backend. It does not include a database. This document describes the recommended schema for storing IntelliTrack events in your backend.

## Overview

IntelliTrack is a fire-and-forget analytics SDK. Your backend is responsible for:
1. Receiving events at your ingest endpoint
2. Validating HMAC signatures
3. Storing events in your database of choice

## Event Schema

Events received from IntelliTrack follow this structure:

```typescript
{
  version: '1',
  eventType: 'request',
  requestId: 'uuid-v4',
  timestamp: '2024-12-24T12:00:00.000Z',
  nonce: 'random-base64url',
  keyId: 'prod-key-1',
  method: 'GET',
  pathname: '/api/users',
  search: '?page=1',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  referer: 'https://example.com',
  tags: { environment: 'prod' },
  metrics: { duration: 123 }
}
```

## Recommended Table Structure

### PostgreSQL

```sql
CREATE TABLE intellitrack_events (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID NOT NULL UNIQUE,
  version VARCHAR(10) NOT NULL DEFAULT '1',
  event_type VARCHAR(50) NOT NULL DEFAULT 'request',
  timestamp TIMESTAMPTZ NOT NULL,
  nonce VARCHAR(50) NOT NULL,
  key_id VARCHAR(100) NOT NULL,
  method VARCHAR(10),
  pathname TEXT,
  search TEXT,
  ip INET,
  user_agent TEXT,
  referer TEXT,
  tags JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_events_timestamp ON intellitrack_events(timestamp);
CREATE INDEX idx_events_key_id ON intellitrack_events(key_id);
CREATE INDEX idx_events_pathname ON intellitrack_events(pathname);
CREATE INDEX idx_events_ip ON intellitrack_events(ip);
CREATE INDEX idx_events_tags ON intellitrack_events USING GIN(tags);
```

### ClickHouse (Recommended for High Volume)

```sql
CREATE TABLE intellitrack_events (
  request_id UUID,
  version String DEFAULT '1',
  event_type String DEFAULT 'request',
  timestamp DateTime64(3),
  nonce String,
  key_id String,
  method LowCardinality(String),
  pathname String,
  search String,
  ip IPv4,
  user_agent String,
  referer String,
  tags Map(String, String),
  metrics Map(String, Float64)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (key_id, timestamp, request_id)
TTL timestamp + INTERVAL 90 DAY;
```

### MongoDB

```javascript
// Collection: intellitrack_events
{
  _id: ObjectId,
  requestId: "uuid-v4",
  version: "1",
  eventType: "request",
  timestamp: ISODate("2024-12-24T12:00:00.000Z"),
  nonce: "random-base64url",
  keyId: "prod-key-1",
  method: "GET",
  pathname: "/api/users",
  search: "?page=1",
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  referer: "https://example.com",
  tags: { environment: "prod" },
  metrics: { duration: 123 }
}

// Indexes
db.intellitrack_events.createIndex({ requestId: 1 }, { unique: true });
db.intellitrack_events.createIndex({ timestamp: -1 });
db.intellitrack_events.createIndex({ keyId: 1, timestamp: -1 });
db.intellitrack_events.createIndex({ pathname: 1 });
```

## Relationships

IntelliTrack events are standalone records with no foreign key relationships. However, you may want to join with:

- **API Keys Table:** Map `keyId` to application/tenant metadata
- **Users Table:** Map `ip` or custom tags to user records (if applicable)

```
┌─────────────────────┐       ┌─────────────────────┐
│   api_keys          │       │  intellitrack_events │
├─────────────────────┤       ├─────────────────────┤
│ id                  │───────│ key_id              │
│ key_id (unique)     │       │ request_id          │
│ secret_hash         │       │ timestamp           │
│ application_name    │       │ ...                 │
│ environment         │       └─────────────────────┘
│ created_at          │
│ rotated_at          │
└─────────────────────┘
```

## Indexing Strategy

### Required Indexes

| Index | Purpose |
|-------|---------|
| `request_id` (unique) | Deduplication, lookup |
| `timestamp` | Time-range queries, TTL |

### Recommended Indexes

| Index | Purpose |
|-------|---------|
| `key_id, timestamp` | Multi-tenant queries |
| `pathname` | URL analytics |
| `ip` | Abuse detection |
| `tags` (GIN/fulltext) | Custom filtering |

### High-Cardinality Columns

Avoid indexing:
- `user_agent` (too many unique values)
- `referer` (high cardinality)
- `nonce` (never queried)

## Data Retention

Recommended retention strategies:

| Tier | Retention | Storage |
|------|-----------|---------|
| Hot | 7 days | Primary database |
| Warm | 30 days | Compressed tables |
| Cold | 90 days | Object storage (S3) |
| Archive | 1+ year | Glacier/deep archive |

### PostgreSQL Partitioning

```sql
-- Partition by month
CREATE TABLE intellitrack_events (
  -- columns...
) PARTITION BY RANGE (timestamp);

CREATE TABLE events_2024_01 PARTITION OF intellitrack_events
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Aggregation Tables

For analytics dashboards, consider pre-aggregated tables:

```sql
CREATE TABLE events_hourly_stats (
  hour TIMESTAMPTZ PRIMARY KEY,
  key_id VARCHAR(100),
  pathname VARCHAR(500),
  request_count BIGINT,
  unique_ips BIGINT,
  avg_duration FLOAT,
  p95_duration FLOAT
);

-- Populate via scheduled job or trigger
```

## Schema Migrations

When IntelliTrack releases new event fields:

1. Add columns as nullable
2. Backfill if needed
3. Update application code
4. Consider default values

```sql
-- Example: Adding new field
ALTER TABLE intellitrack_events
ADD COLUMN country_code VARCHAR(2);
```
