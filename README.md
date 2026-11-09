# 100M Row Challenge: Enterprise Analytics API

An enterprise-grade Product Analytics API engineered to ingest, store, and query **100 million high-cardinality events** with sub-millisecond read latencies. Built entirely on a native Bun monorepo architecture, this project demonstrates advanced PostgreSQL optimization, background concurrency, and graceful degradation under extreme load.

## Architecture & Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [Hono](https://hono.dev/)
- **Database:** PostgreSQL 16 (Dockerized)
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Design Pattern:** Clean Architecture

## Performance Milestones

### 1. The B-Tree & Logarithmic Scaling (`O(log n)`)

By perfectly balancing a B-Tree index and updating the PostgreSQL MVCC Visibility Map via `VACUUM ANALYZE`, the database was able to isolate ~16.6 million records out of 100 million in half a second, proving logarithmic scaling on a local machine.

| Dataset Size  | Optimization                  | Average Time | p95 Time      |
| :------------ | :---------------------------- | :----------- | :------------ |
| **20M Rows**  | B-Tree Index + Visibility Map | 414.33 ms    | 502.09 ms     |
| **100M Rows** | B-Tree Index + Visibility Map | 453.53 ms    | **524.57 ms** |

### 2. Materialized Views & Constant Time (`O(1)`)

To achieve lower latencies (sub-50ms), computational overhead was shifted from read-time to write-time. A Materialized View (`daily_events_rollup`) with a unique composite index reduced query latencies by **99.3%**.

| Dataset Size  | Optimization                       | Average Time | p95 Time    |
| :------------ | :--------------------------------- | :----------- | :---------- |
| **100M Rows** | Materialized View (Pre-Aggregated) | 2.13 ms      | **3.67 ms** |

## Load Testing & "Noisy Neighbor" Contention

To ensure the API remains highly available during background data aggregation, a Node.js `cron` worker executes `REFRESH MATERIALIZED VIEW CONCURRENTLY` every 5 minutes. The system was load tested with an 80/20 mix of POST (ingestion) and GET (dashboard) requests on uncapped local hardware.

- **Cruising Throughput:** ~1,000 - 1,300 Requests Per Second (RPS)
- **Average Latency:** ~45ms
- **Architectural Takeaway:** This perfectly demonstrates the necessity of decoupling compute from storage in production (e.g., hosting the API on AWS ECS and the database on AWS RDS). When physically isolated from database CPU hogs, the Bun event loop remains completely unblocked.

## 🛠️ Data Generation & Ingestion

Generating 100 million rows in Node.js normally causes massive Garbage Collection (GC) crashes. This project utilizes a highly optimized stream generator using modulo-math (`%`) round-robin distribution and pre-allocated memory arrays to generate a ~7GB high-cardinality CSV in minutes.

The data is ingested directly bypassing the ORM using PostgreSQL's native binary `COPY` protocol for maximum throughput.

## Getting Started

### 1. Infrastructure Setup

```bash
bun install
docker-compose up -d

```

### 2. Generate & Ingest 100M Rows

```bash
# Generate the 7GB CSV (Takes ~3-5 mins)
bun --filter api run scripts/stream-generator.ts

# Ingest into PostgreSQL via raw COPY
cat data-100m.csv | docker exec -i 100m_postgres psql -U postgres -d events_db -c "\copy events(project_id, event_name, user_id, payload, created_at) FROM STDIN WITH (FORMAT csv, HEADER true);"

# Rebuild Visibility Map & Materialized View
docker exec -i 100m_postgres psql -U postgres -d events_db -c "VACUUM (ANALYZE, VERBOSE) events;"
bun --filter @challenge/api run scripts/build-mat-view.ts

```

### 3. Run the API

```bash
# Starts the Hono server with hot-reloading and boots the cron worker
bun --filter api run dev

```

### 4. API Endpoints

- **Ingest Event:** `POST /api/v1/analytics/events` (Fire-and-forget, Zod validated)
- **Read Analytics:** `GET /api/v1/analytics/events?projectId=proj_alpha&eventName=page_view` (Sub-millisecond reads from the materialized view)
