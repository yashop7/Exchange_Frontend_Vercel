"use client";

import { useEffect, useState } from "react";
import { Ticker } from "../utils/types";
import { getTickers } from "../utils/httpClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

export const Markets = () => {
  const [tickers, setTickers] = useState<Ticker[]>();

  useEffect(() => {
    getTickers().then((m) => setTickers(m));
  }, []);

  return (
    <div className="flex flex-col flex-1 max-w-[1280px] w-full">
      <div className="flex flex-col min-w-[700px] flex-1 w-full">
        <div className="flex flex-col w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
          <table className="w-full table-auto">
            <MarketHeader />
            {tickers && tickers.length > 0
              ? tickers.map((m, i) => <MarketRow key={m.priceChange} market={m} index={i} />)
              : <></>}
          </table>
        </div>
      </div>
    </div>
  );
};

function MarketRow({ market, index }: { market: Ticker; index: number }) {
  const router = useRouter();
  const isPositive = Number(market.priceChangePercent) >= 0;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      className="cursor-pointer border-t border-white/[0.06] transition-colors"
      onClick={() => router.push(`/trade/${market.symbol}`)}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/10 bg-white/[0.05] shrink-0">
            <Image
              alt={market.symbol}
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVvBqZC_Q1TSYObZaMvK0DRFeHZDUtVMh08Q&s"
              loading="lazy"
              width={28} height={28}
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{market.symbol}</p>
            <p className="text-[10px] text-white/30">{market.symbol}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="font-mono text-sm text-white tabular-nums">{market.lastPrice}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className="font-mono text-sm text-white/55 tabular-nums">{market.high}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className="font-mono text-sm text-white/55 tabular-nums">{market.volume}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold ${
          isPositive
            ? "text-[#22c55e] bg-[#22c55e]/10 ring-1 ring-[#22c55e]/20"
            : "text-[#ef4444] bg-[#ef4444]/10 ring-1 ring-[#ef4444]/20"
        }`}>
          {isPositive ? "+" : ""}{Number(market.priceChangePercent)?.toFixed(3)}%
        </span>
      </td>
    </motion.tr>
  );
}

function MarketHeader() {
  return (
    <thead>
      <tr className="border-b border-white/10">
        {["Name", "Price", "24h High", "24h Volume", "24h Change"].map((h) => (
          <th key={h} className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}
