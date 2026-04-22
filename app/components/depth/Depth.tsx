"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown } from "lucide-react";
import { getDepth, getTicker, getTrades } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";

export function Depth({ market }: { market: string }) {
  const [bids, setBids] = useState<[string, string][]>();
  const [asks, setAsks] = useState<[string, string][]>();
  const [trade, setTrade] = useState<[string, string][]>();
  const [price, setPrice] = useState<string>("");
  const [priceUp, setPriceUp] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"book" | "trades">("book");
const sortedAsks = asks ? [...asks].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])) : [];
  const sortedBids = bids ? [...bids].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])) : [];

  const bestAsk = sortedAsks[0] ? parseFloat(sortedAsks[0][0]) : null;
  const bestBid = sortedBids[0] ? parseFloat(sortedBids[0][0]) : null;
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : null;
  const spreadPct = bestAsk && bestBid ? (((bestAsk - bestBid) / bestAsk) * 100).toFixed(3) : null;

  let cumulativeBidVol = 0, cumulativeAskVol = 0;
  sortedBids.slice(0, 14).forEach(([, q]) => { cumulativeBidVol += parseFloat(q); });
  sortedAsks.slice(0, 14).forEach(([, q]) => { cumulativeAskVol += parseFloat(q); });
  const totalVol = cumulativeBidVol + cumulativeAskVol;
  const bidPct = totalVol ? (cumulativeBidVol / totalVol) * 100 : 50;
  const askPct = totalVol ? (cumulativeAskVol / totalVol) * 100 : 50;

  useEffect(() => {
    const instance = SignalingManager.getInstance(market);

    instance.registerCallback(
      "depth",
      (data: any) => {
        const updateBook = (
          original: [string, string][] | undefined,
          updates: [string, string][],
          isAsk: boolean
        ): [string, string][] => {
          const map = new Map(original || []);
          for (const [p, s] of updates) {
            if (s === "0" || parseFloat(s) === 0) map.delete(p);
            else map.set(p, s);
          }
          return Array.from(map).sort((a, b) =>
            isAsk ? parseFloat(a[0]) - parseFloat(b[0]) : parseFloat(b[0]) - parseFloat(a[0])
          );
        };
        setBids((prev) => updateBook(prev, data.bids, false));
        setAsks((prev) => updateBook(prev, data.asks, true));
      },
      `DEPTH-${market}`
    );

    instance.registerCallback(
      "trade",
      (data: any) => {
        setPriceUp((prev) => parseFloat(data.price) >= parseFloat(price || data.price));
        setPrice(data.price);
        setTrade((prev) => {
          const entry: [string, string] = [String(data.price), String(data.quantity)];
          return prev ? [entry, ...prev].slice(0, 30) : [entry];
        });
      },
      `TRADE-${market}`
    );

    instance.sendMessage({ method: "SUBSCRIBE", params: [`depth.200ms.${market}`] });
    instance.sendMessage({ method: "SUBSCRIBE", params: [`trade.${market}`] });

    getDepth(market).then((d) => { setBids(d.bids); setAsks(d.asks); }).catch(() => {});
    getTicker(market).then((t) => setPrice(t?.lastPrice ?? "")).catch(() => {});
    getTrades(market).then((t) => { if (t?.[0]) setPrice(t[0].price); }).catch(() => {});

    return () => {
      instance.sendMessage({ method: "UNSUBSCRIBE", params: [`depth.200ms.${market}`] });
      instance.sendMessage({ method: "UNSUBSCRIBE", params: [`trade.${market}`] });
      instance.deRegisterCallback("depth", `DEPTH-${market}`);
      instance.deRegisterCallback("trade", `TRADE-${market}`);
    };
  }, [market]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-0 border-b border-white/10">
        {(["book", "trades"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`relative px-3 pb-2.5 text-xs font-medium capitalize transition-colors duration-200 ${
              activeTab === tab ? "text-white" : "text-white/35 hover:text-white/65"
            }`}
          >
            {tab === "book" ? "Order book" : "Trades"}
            {activeTab === tab && (
              <motion.div
                layoutId="depthTabIndicator"
                className="absolute inset-x-0 bottom-0 h-px bg-white/50"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>


{/* ORDER BOOK */}
      {activeTab === "book" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center px-3 py-1.5 border-b border-white/[0.05]">
            <span className="flex-1 text-[9px] font-medium uppercase tracking-widest text-white/25">Price</span>
            <span className="flex-1 text-[9px] font-medium uppercase tracking-widest text-white/25 text-center">Size</span>
            <span className="flex-1 text-[9px] font-medium uppercase tracking-widest text-white/25 text-right">Total</span>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Asks — justified to bottom so best ask hugs the mid row */}
            <div className="flex flex-col flex-1 justify-end overflow-hidden">
              <AskTable asks={sortedAsks} />
            </div>

            {/* Mid price + spread */}
            <div className="flex items-center justify-between px-3 py-[5px] bg-white/[0.02] border-y border-white/[0.06] shrink-0">
              <div className="flex items-center gap-1.5">
                {priceUp
                  ? <ArrowUp size={11} className="text-[rgb(0,194,120)]" />
                  : <ArrowDown size={11} className="text-[rgb(234,56,59)]" />}
                <span className={`text-sm font-semibold tabular-nums ${priceUp ? "text-[rgb(0,194,120)]" : "text-[rgb(234,56,59)]"}`}>
                  {price
                    ? parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "—"}
                </span>
              </div>
              {spread && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-white/25">Spread</span>
                  <span className="text-[10px] text-white/40 tabular-nums">{spread}</span>
                  <span className="text-[9px] text-white/25 tabular-nums">({spreadPct}%)</span>
                </div>
              )}
            </div>

            {/* Bids */}
            <div className="flex-1 overflow-hidden">
              <BidTable bids={sortedBids} />
            </div>
          </div>

          {/* Bid/Ask ratio bar */}
          <div className="relative w-full h-8 shrink-0 overflow-hidden border-t border-white/[0.06]">
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: 'rgba(0,194,120,0.15)', clipPath: "polygon(0 0, 100% 0, calc(100% - 5px) 100%, 0 100%)" }}
              animate={{ width: `${bidPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-y-0 right-0"
              style={{ background: 'rgba(234,56,59,0.12)', clipPath: "polygon(5px 0, 100% 0, 100% 100%, 0 100%)" }}
              animate={{ width: `${askPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold tabular-nums" style={{ color: 'rgb(0,194,120)' }}>
              {bidPct.toFixed(1)}%
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold tabular-nums" style={{ color: 'rgb(234,56,59)' }}>
              {askPct.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* TRADES */}
      {activeTab === "trades" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between px-3 py-1.5 border-b border-white/[0.05]">
            <span className="text-[9px] font-medium uppercase tracking-widest text-white/25">Price</span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-white/25">Qty</span>
          </div>
          <div className="overflow-y-auto no-scrollbar flex-1">
            <AnimatePresence initial={false}>
              {trade?.map(([tradePrice, qty], i, arr) => {
                const isUp = parseFloat(tradePrice) >= parseFloat(arr[i + 1]?.[0] ?? tradePrice);
                return (
                  <motion.div
                    key={`${tradePrice}-${i}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex justify-between items-center px-3 h-[22px] border-b border-white/[0.03] hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-1.5">
                      {isUp
                        ? <ArrowUp size={9} style={{ color: 'rgb(0,194,120)' }} />
                        : <ArrowDown size={9} style={{ color: 'rgb(234,56,59)' }} />}
                      <span className="text-[11px] tabular-nums" style={{ color: isUp ? 'rgb(0,194,120)' : 'rgb(234,56,59)' }}>
                        {parseFloat(tradePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-white/40 tabular-nums">
                      {parseFloat(qty).toFixed(4)}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
