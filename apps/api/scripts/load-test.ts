import { performance } from "perf_hooks";

const API_URL = "http://localhost:3000/api/v1/analytics/events";
const CONCURRENCY = 50;

let requestsThisSecond = 0;
let errorCount = 0;
const latencies: number[] = [];

const firePost = async () => {
  const start = performance.now();
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "proj_alpha",
        eventName: "page_view",
        userId: `load_user_${Math.floor(Math.random() * 10000)}`,
        payload: { source: "load_test" },
      }),
    });
    if (!res.ok) errorCount++;
  } catch (e) {
    console.log(e);
    errorCount++;
  }
  latencies.push(performance.now() - start);
  requestsThisSecond++;
};

const fireGet = async () => {
  const start = performance.now();
  try {
    const res = await fetch(
      `${API_URL}?projectId=proj_alpha&eventName=page_view`,
    );
    if (!res.ok) errorCount++;
  } catch (e) {
    console.log(e);
    errorCount++;
  }
  latencies.push(performance.now() - start);
  requestsThisSecond++;
};

const startWorker = async () => {
  const c = true;
  while (c) {
    if (Math.random() > 0.2) {
      await firePost();
    } else {
      await fireGet();
    }
  }
};

console.log(` Bombarding API with ${CONCURRENCY} concurrent workers...`);

for (let i = 0; i < CONCURRENCY; i++) {
  startWorker();
}

setInterval(() => {
  if (latencies.length === 0) return;

  const sorted = [...latencies].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  console.log(
    `RPS: ${requestsThisSecond} | Errors: ${errorCount} | Avg Latency: ${avg.toFixed(2)}ms | p95 Latency: ${p95.toFixed(2)}ms`,
  );
  requestsThisSecond = 0;
  errorCount = 0;
  latencies.length = 0;
}, 1000);
