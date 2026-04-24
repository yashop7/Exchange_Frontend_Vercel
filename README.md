# ProEx - Centralized Crypto Exchange

> A production-grade, full-stack CEX built from scratch - custom matching engine, real-time order book, TradingView-style charts, and sub-millisecond WebSocket feeds.

**Live Demo:** https://app.supademo.com/demo/cm71v4s031c9o11f7zrvy1qc5

https://github.com/user-attachments/assets/27144ab6-ef81-45fa-9982-8bbd809ae876

---

## How It All Fits Together

This is not a single app - it's four separate services working in concert. Here's what happens the moment a user places an order:

```
Browser
  │
  │  POST /api/v1/order
  ▼
CEX-API-Server          ← validates order, assigns ID
  │
  │  pushes to Redis queue (LPUSH)
  ▼
CEX-Engine              ← drains queue (BRPOP), runs price-time priority matching
  │                        fills emit trade events, unmatched orders rest on the book
  ├──► Redis Pub/Sub ──► CEX-WS-Server ──► Browser (live depth, ticker, trades)
  │
  └──► CEX-DB-Processor ──► PostgreSQL (trades) + TimescaleDB (OHLCV candles)
```

**The key insight:** the API never talks to the engine directly. Orders flow through a Redis queue, so each service scales independently and nothing blocks the hot path.

---

## The Four Services

| Repo | Role |
|---|---|
| [CEX-API-Server](https://github.com/yashop7/CEX-API-Server) | Hono HTTP API - receives orders, pushes to Redis queue, returns fill result |
| [CEX-Engine](https://github.com/yashop7/CEX-Engine) | Matching engine - price-time priority book, publishes trade/depth/ticker events |
| [CEX-WS-Server](https://github.com/yashop7/CEX-WS-Server) | WebSocket server - subscribes to Redis Pub/Sub, fans out to all connected clients |
| [CEX-DB-Processor](https://github.com/yashop7/CEX-DB-Processor) | Persistence worker - writes completed trades to Postgres, OHLCV to TimescaleDB |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| UI | TailwindCSS, Radix UI, Framer Motion |
| Charts | Lightweight Charts (TradingView library) |
| API | Hono (edge-compatible, ultra-fast routing) |
| Matching Engine | Custom Node.js - price-time priority book |
| Message Queue | Redis (list-based queue + Pub/Sub) |
| WebSockets | Native WS server, Redis fan-out |
| Database | PostgreSQL (trades) + TimescaleDB (OHLCV) |
| Deployment | Vercel (frontend) · Railway (backend) |

---

## What the Frontend Does

<img width="807" alt="Screenshot 2025-02-12 at 4 24 25 PM" src="https://github.com/user-attachments/assets/cdc2d8f3-bfc1-4d0a-bd71-82f13c88b10f" />

<img width="800" alt="Screenshot 2025-02-12 at 6 27 19 PM" src="https://github.com/user-attachments/assets/599b5800-356c-47c2-855e-ca15a7caaad6" />

- **Live Order Book** - bids and asks animate in real time via WebSocket depth diffs
- **Candlestick Chart** - OHLCV candles built from the live trade stream, auto-updates on every fill
- **Market Bar** - last price, 24h change %, volume, high/low from the ticker feed
- **Order Form** - limit and market orders; fills returned synchronously from the API

---

## Why This Architecture?

A CEX holds custody of balances and runs a central order book - matching at microsecond scale without on-chain finality. The design choices here reflect that:

- **In-memory order book** - O(log n) insert/cancel, O(1) best-price lookup
- **Queue-isolated engine** - API latency never degrades under matching load
- **Pub/Sub broadcast** - WebSocket delivery doesn't couple to engine throughput
- **Separate persistence worker** - disk I/O never sits in the critical path

---

## Contributing

Pull requests are welcome. Open an issue first for significant changes.

## License

MIT
