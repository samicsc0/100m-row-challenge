# 100M Row PostgreSQL Challenge

A high-volume event log analytics system built to benchmark PostgreSQL performance at scale using Bun, Hono, and Drizzle ORM.

## 💻 Test Environment

- **Machine:** Lenovo ThinkPad L14 Gen 1
- **OS:** Ubuntu Linux (KDE Plasma)
- **CPU:** Intel(R) Core(TM) i5-10310U CPU @ 1.70GHz
- **RAM:** 15 GB
- **Engine:** PostgreSQL 16 (Docker)

## 📊 Benchmarks (20 Million Rows)

| Branch / Optimization   | Problem Solved                            | Average Time | p95 Time      |
| :---------------------- | :---------------------------------------- | :----------- | :------------ |
| `main` (Baseline)       | Full table scan (Sequential Read)         | 424.34 ms    | **588.02 ms** |
| `optimize/b-tree-index` | Avoids sequential scans via B-Tree lookup | TBD          | TBD           |
