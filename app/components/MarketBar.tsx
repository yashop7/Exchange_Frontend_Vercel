"use client";
import { useEffect, useState } from "react";
import { Ticker } from "../utils/types";
import { getAllInfo, getTicker } from "../utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";
import { ChevronDown } from "lucide-react";
import Image from 'next/image';

export const MarketBar = ({ market }: { market: string }) => {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [tokenImage, settokenImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      const data = await getAllInfo();
      const image = data.find((d: any) => d.symbol.toLowerCase() === market.split("_")[0].toLowerCase())?.image;
      settokenImage(image);
    }
    fetchImage();
  }, []);

  useEffect(() => {
    getTicker(market).then(setTicker);
    SignalingManager.getInstance(market).registerCallback(
      "ticker",
      (data: Partial<Ticker>) =>
        setTicker((prevTicker) => ({
          firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? "",
          high: data?.high ?? prevTicker?.high ?? "",
          lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? "",
          low: data?.low ?? prevTicker?.low ?? "",
          priceChange: data?.priceChange ?? prevTicker?.priceChange ?? "",
          priceChangePercent: data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? "",
          quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? "",
          symbol: data?.symbol ?? prevTicker?.symbol ?? "",
          trades: data?.trades ?? prevTicker?.trades ?? "",
          volume: data?.volume ?? prevTicker?.volume ?? "",
        })),
      `TICKER-${market}`
    );
    SignalingManager.getInstance(market).sendMessage({ method: "SUBSCRIBE", params: [`ticker.${market}`] });

    return () => {
      SignalingManager.getInstance(market).deRegisterCallback("ticker", `TICKER-${market}`);
      SignalingManager.getInstance(market).sendMessage({ method: "UNSUBSCRIBE", params: [`ticker.${market}`] });
    };
  }, [market]);

  const fmt = (num: string | undefined) =>
    parseFloat(num ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isPositive = Number(ticker?.priceChange) >= 0;

  return (
    <div className="flex items-center w-full h-14 border-b border-white/10 bg-black px-5 overflow-x-auto no-scrollbar gap-5">
      {/* Pair */}
      <TickerButton market={market} tokenImage={tokenImage} />

      {/* Separator */}
      <div className="h-5 w-px bg-white/10 shrink-0" />

      {/* Last price */}
      <div className="flex flex-col shrink-0">
        <span className="text-base font-semibold tabular-nums leading-none" style={{ color: isPositive ? 'rgb(0,194,120)' : 'rgb(234,56,59)' }}>
          {fmt(ticker?.lastPrice)}
        </span>
        <span className="text-[10px] text-white/30 tabular-nums leading-none mt-0.5">
          ${fmt(ticker?.lastPrice)}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <TickerStat
          label="24h Change"
          value={
            <span style={{ color: isPositive ? 'rgb(0,194,120)' : 'rgb(234,56,59)' }}>
              {isPositive ? "+" : ""}{fmt(ticker?.priceChange)}{" "}
              <span className="opacity-60">({Number(ticker?.priceChangePercent)?.toFixed(2)}%)</span>
            </span>
          }
        />
        <TickerStat label="24h High"   value={fmt(ticker?.high)} />
        <TickerStat label="24h Low"    value={fmt(ticker?.low)} />
        <TickerStat label="24h Volume" value={fmt(ticker?.volume)} />
      </div>
    </div>
  );
};

function TickerStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col shrink-0">
      <span className="text-[9px] font-medium uppercase tracking-widest text-white/28 leading-none mb-1">
        {label}
      </span>
      <span className="font-mono text-xs font-medium tabular-nums text-white/80 leading-none">
        {value}
      </span>
    </div>
  );
}

function TickerButton({ market, tokenImage }: { market: string; tokenImage: string | null }) {
  return (
    <button type="button" className="flex items-center gap-2.5 shrink-0 group">
      <div className="flex items-center">
        <div className="relative z-10 w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/10 bg-white/[0.06]">
          <Image
            alt="Base token"
            loading="lazy"
            decoding="async"
            width={24} height={24}
            className="w-full h-full object-cover"
            src={market === "TATA_INR" ? "/TATA.png" : tokenImage || "/sol copy.webp"}
          />
        </div>
        <div className="relative -ml-2 w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/10 bg-white/[0.06]">
          <Image
            alt="Quote token"
            loading="lazy"
            decoding="async"
            width={24} height={24}
            className="w-full h-full object-cover"
            src="/usdc copy.webp"
          />
        </div>
      </div>
      <span className="text-sm font-semibold text-white tracking-tight">
        {market.replace("_", " / ")}
      </span>
      <ChevronDown className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
    </button>
  );
}
