# ProEx - Centralized Crypto Exchange

> A production-grade, full-stack Centralized Exchange (CEX) built from scratch, with a custom order-matching engine, real-time order book, TradingView-style candlestick charts, and sub-millisecond WebSocket market feeds.

**Live Demo:** https://app.supademo.com/demo/cm71v4s031c9o11f7zrvy1qc5

https://github.com/user-attachments/assets/27144ab6-ef81-45fa-9982-8bbd809ae876

---

## What Is This?

ProEx is a fully functional Centralized Exchange (the same category as Binance or Coinbase) built entirely from the ground up. It handles the complete lifecycle of a trade: from the moment a user submits a limit or market order, through matching it against the live order book inside the engine, to broadcasting the resulting fills and updated depth back to all connected clients in real time.

The exchange is not a thin wrapper around someone else's matching logic. The core engine implements a **price-time priority order book** (bids sorted descending, asks ascending) with a matching loop that continuously processes incoming orders, executes fills, emits trade events, and publishes depth/ticker updates. Orders that don't fully fill rest on the book until matched or cancelled.

The frontend mirrors what a professional trading terminal looks like: a depth table that animates live as the order book shifts, a candlestick chart that auto-updates on each new trade, a market bar showing last price, 24h change, volume and high/low, all driven by WebSocket streams with no polling.

The architecture deliberately separates concerns the way real exchanges do: the HTTP layer never touches the matching engine directly. Orders flow through a **Redis queue**, the engine drains that queue, and results propagate via **Redis Pub/Sub** to a WebSocket server that fans out to clients. This means the API, engine, and WS server can each scale independently.

<img width="807" alt="Screenshot 2025-02-12 at 4 24 25 PM" src="https://github.com/user-attachments/assets/cdc2d8f3-bfc1-4d0a-bd71-82f13c88b10f" />

<img width="800" alt="Screenshot 2025-02-12 at 6 27 19 PM" src="https://github.com/user-attachments/assets/599b5800-356c-47c2-855e-ca15a7caaad6" />

---

## Architecture & Data Flow

```
Browser
  │
  │  POST /api/v1/order
  ▼
 API  ◄──────────────────► Redis Pub/Sub  (publishes executedQty, fills)
  │
  │  enqueue order
  ▼
Redis Queue  ──────────►  Engine  ──────────►  Redis Queue
                            │                       │
                       matches orders          trade_created
                       price/time priority     price, qty, side
                            │
                            ▼
                       Redis Pub/Sub
                       trade@SOL_USDC
                       ticker@SOL_USDC
                       depth@SOL_USDC
                            │
                            ▼
                       WebSocket Server  ──────────►  Browser
                                                   live order book
                                                   candlestick feed
                                                   market ticker
                            │
                       Redis Queue
                            │
                            ▼
                       Database Processor
                       price: 200.1 | timestamp: 123
                            │
                            ▼
                       Time Series DB  (OHLCV candles, trade history)
```

### Order Submission
The browser submits a `POST /api/v1/order`. The API validates the payload, assigns an order ID, and pushes the serialized order onto a Redis list (the queue). It then blocks on a response channel; the engine publishes the result (executedQuantity + fills array) back through Redis Pub/Sub, which the API surfaces to the HTTP caller synchronously. From the client's perspective it's a normal REST call; the async handoff is invisible.

### Matching Engine
The engine runs a tight loop: `BRPOP` from the Redis queue, deserialize, attempt to match against the resting book. A sell order walks down the bid side filling against the best available bids; a buy order walks up the ask side. Each fill emits a `trade_created` event. Unmatched remainder rests on the book at its limit price. The engine then pushes three update types onto Redis Pub/Sub: `trade@<market>`, `ticker@<market>`, and `depth@<market>`.

### Real-Time Distribution
A dedicated WebSocket server subscribes to all Pub/Sub channels. When a message arrives it fans out to every client subscribed to that market. Order book diffs, tick updates, and trade prints all arrive within milliseconds of execution.

### Persistence
A separate database processor service also consumes the engine's Redis queue output, writing completed trades to **PostgreSQL** for transactional integrity and pushing OHLCV candle data to a **Time Series DB**, keeping hot-path latency unaffected by database I/O.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| UI | TailwindCSS, Radix UI, Framer Motion |
| Charts | Lightweight Charts (TradingView library) |
| API | Hono (edge-compatible, ultra-fast routing) |
| Matching Engine | Custom Node.js, price-time priority book |
| Message Queue | Redis (list-based queue + Pub/Sub) |
| WebSockets | Native WS server, Redis fan-out |
| Database | PostgreSQL (trades) + TimescaleDB (OHLCV) |
| Deployment | Vercel (frontend) · Railway (backend) |

---

## Key Features

- **Custom Order Matching Engine**: price-time priority, handles partial fills, resting orders, and immediate-or-cancel semantics
- **Live Order Book Depth Table**: bids and asks update in real time via WebSocket diffs, colour-coded and animated
- **Candlestick Charts**: OHLCV candles built from live trade stream using Lightweight Charts; auto-updates on every fill
- **Market Bar**: real-time last price, 24h change %, volume, high/low pulled from ticker feed
- **Decoupled Architecture**: Redis queue between API and engine means neither blocks the other under load
- **Event-Driven Fan-out**: one engine event reaches all subscribed clients through a single Pub/Sub hop
- **Dual Storage Strategy**: transactional trades in Postgres, time-series candle data in TimescaleDB

---

## Why a Centralized Exchange Architecture?

A CEX holds custody of balances and runs a central order book, which means it can match orders at microsecond scale without waiting for on-chain finality. This project implements the core subsystems that make that possible:

- **In-memory order book** for O(log n) insert/cancel and O(1) best-price lookup
- **Queue-isolated engine** so API latency never degrades under matching load
- **Pub/Sub broadcast** so WebSocket delivery doesn't couple to engine throughput
- **Separate persistence worker** so disk I/O never sits in the critical path

The result is a system that behaves like the backend of a real trading platform, not a toy demo, but an architecture that could be taken to production with auth, balances, and risk checks bolted on.

---

## Contributing

Pull requests are welcome. Open an issue first for significant changes.

## License

MIT
