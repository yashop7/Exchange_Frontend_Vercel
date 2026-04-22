"use client";

import {
  ColorType,
  createChart,
  IChartApi,
  UTCTimestamp,
} from "lightweight-charts";

import {
  ArrowRight,
  ArrowUpRight,
  Flame,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CombineData, CombinedCryptoData } from "../utils/combine-data";
import { Skeleton } from "@/components/ui/skeleton";

export interface CurrencyData {
  price: number;
  market_cap: number;
  price_change_percentage_24hr: number;
  volume: number;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | number;
  last_updated: string;
  price_change_percentage_24h_in_currency: number;
  currencies: {
    cad: CurrencyData;
    cny: CurrencyData;
    eur: CurrencyData;
    gbp: CurrencyData;
    jpy: CurrencyData;
    usd: CurrencyData;
  };
}

export interface LineCryptoDataPoint {
  close: string;
  end: string;
}

export interface LineCryptoData {
  data: LineCryptoDataPoint[];
  symbol: string;
}

export default function Component() {
  const [data, setData] = useState<CombinedCryptoData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = (await CombineData()) ?? null;
        setData(res);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="text-white min-h-screen p-6 md:p-10 bg-black">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] h-[280px] p-10 flex flex-col justify-end space-y-4">
            <Skeleton className="h-10 w-64 bg-white/[0.06]" />
            <Skeleton className="h-5 w-96 bg-white/[0.04]" />
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-9 w-28 rounded-md bg-white/[0.06]" />
              <Skeleton className="h-9 w-28 rounded-md bg-white/[0.04]" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-2">
                <Skeleton className="h-3 w-20 bg-white/[0.06]" />
                <Skeleton className="h-6 w-24 bg-white/[0.04]" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-4">
                <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                {[1,2,3,4,5].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-full bg-white/[0.06]" />
                      <Skeleton className="h-4 w-16 bg-white/[0.04]" />
                    </div>
                    <Skeleton className="h-4 w-14 bg-white/[0.04]" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-white/[0.06]">
                <Skeleton className="h-9 w-9 rounded-full bg-white/[0.06]" />
                <div className="flex-1 flex items-center justify-between">
                  <Skeleton className="h-4 w-24 bg-white/[0.04]" />
                  <Skeleton className="h-4 w-20 bg-white/[0.04]" />
                  <Skeleton className="h-4 w-20 bg-white/[0.04]" />
                  <Skeleton className="h-5 w-14 rounded bg-white/[0.04]" />
                  <Skeleton className="h-8 w-24 bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getNewListings = (data: CryptoData[]): CryptoData[] =>
    data.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()).slice(0, 5);

  const getTopGainers = (data: CryptoData[]): CryptoData[] =>
    data.filter((coin) => !Number.isNaN(coin.price_change_percentage_24h))
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 5);

  const getPopularCoins = (data: CryptoData[]): CryptoData[] => {
    const popularSymbols = ["SOL", "ETH", "BTC", "WEN", "DRIFT"];
    return data
      .filter((coin) => popularSymbols.includes(coin.symbol.toUpperCase()))
      .sort((a, b) => popularSymbols.indexOf(a.symbol.toUpperCase()) - popularSymbols.indexOf(b.symbol.toUpperCase()));
  };

  const mostPopular = getPopularCoins(data);
  const topGainer = getTopGainers(data);
  const newEntries = getNewListings(data);

  const panels = [
    { label: "New listings", icon: <Sparkles className="w-3.5 h-3.5" />, items: newEntries },
    { label: "Top gainers",  icon: <Flame className="w-3.5 h-3.5" />,    items: topGainer },
    { label: "Popular",      icon: <Star className="w-3.5 h-3.5" />,     items: mostPopular },
  ];

  return (
    <div className="text-white min-h-screen p-6 md:p-10 bg-black">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* HERO */}
        <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Fade mask over dots */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a0a0a 30%, rgba(10,10,10,0.6) 70%, rgba(10,10,10,0.2) 100%)" }} />

          <div className="relative px-10 py-14 md:py-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-[10px] font-medium text-white/50 uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
              Live markets
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4 tracking-tight">
              Trade crypto,<br />without limits.
            </h1>
            <p className="text-base text-white/50 mb-8 leading-relaxed max-w-md">
              Real-time order books, limit &amp; market orders, deep liquidity.
              Built for traders who demand precision.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="/trade/TATA_INR"
                className="inline-flex items-center gap-1.5 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-white/90 transition-colors"
              >
                Start trading <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#markets"
                className="inline-flex items-center gap-1.5 border border-white/15 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-white/5 hover:border-white/25 transition-colors"
              >
                View markets
              </a>
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "24h Volume",     value: "$84.2B",  delta: "+6.4%",  up: true  },
            { label: "Market Cap",     value: "$2.41T",  delta: "+2.1%",  up: true  },
            { label: "Active Markets", value: "1,248",   delta: "Live",   up: true  },
            { label: "BTC Dominance",  value: "52.3%",   delta: "-0.4%",  up: false },
          ].map(({ label, value, delta, up }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-[#0a0a0a] px-5 py-4">
              <p className="text-[9px] font-medium uppercase tracking-widest text-white/30 mb-1.5">{label}</p>
              <p className="font-mono text-lg font-semibold text-white tabular-nums">{value}</p>
              <p className={`font-mono text-[10px] mt-0.5 ${up ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{delta}</p>
            </div>
          ))}
        </div>

        {/* ── FEATURED CARD ─────────────────────────────────────────── */}
        <div
          className="rounded-xl border border-white/10 bg-[#0a0a0a] px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors group"
          onClick={() => (window.location.href = "/trade/TATA_INR")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.04]">
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white">TATA / INR</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase text-[#22c55e] bg-[#22c55e]/10 ring-1 ring-[#22c55e]/20">Live</span>
              </div>
              <p className="text-xs text-white/40">₹500 · Vol ₹1.2M · Active market</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-medium uppercase tracking-widest text-white/30 mb-1">24h Change</p>
              <p className="font-mono text-base font-semibold text-[#22c55e] tabular-nums">+12.5%</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white text-black px-4 py-2 rounded-md text-sm font-semibold group-hover:bg-white/90 transition-colors">
              Trade <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* ── THREE-PANEL GRID ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="markets">
          {panels.map(({ label, icon, items }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 text-white/70">
                  {icon}
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <span className="text-[9px] font-medium uppercase tracking-widest text-white/25 cursor-pointer hover:text-white/50 transition-colors">
                  All →
                </span>
              </div>
              <div className="h-px mx-5 bg-white/[0.07]" />
              <div className="p-3">
                <CryptoList items={items} />
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN TABLE ────────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div className="flex items-center gap-2 text-white/70">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">All markets</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3.5 py-1.5 rounded-md text-[11px] font-semibold text-white bg-white/10 border border-white/15 transition-colors">
                Spot
              </button>
              <button className="px-3.5 py-1.5 rounded-md text-[11px] font-medium text-white/40 border border-white/10 hover:text-white/70 hover:border-white/15 transition-colors">
                Favorites
              </button>
            </div>
          </div>
          <CryptoTable data={data} />
        </div>

      </div>
    </div>
  );
}

// ── UTILS ──────────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatPercentage = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);

function formatNumber(value: number) {
  if (value >= 1e12) return (value / 1e12).toFixed(2) + "T";
  if (value >= 1e9)  return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6)  return (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3)  return (value / 1e3).toFixed(2) + "K";
  return value;
}

// CRYPTO LIST

function CryptoList({ items }: { items: CryptoData[] }) {
  return (
    <ul className="space-y-0.5">
      {items.map((crypto, index) => {
        const up = crypto.price_change_percentage_24h >= 0;
        return (
          <motion.li
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            onClick={() => (window.location.href = `/trade/${crypto.symbol.toUpperCase()}_USDC`)}
            key={crypto.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/10 shrink-0">
                <Image src={crypto.image} alt={crypto.symbol} width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-white/90">{crypto.symbol}</p>
                <p className="text-[10px] text-white/30 truncate max-w-[80px]">{crypto.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs font-medium text-white tabular-nums">{formatCurrency(crypto.current_price)}</p>
              <p className={`flex items-center justify-end gap-0.5 font-mono text-[10px] mt-0.5 ${up ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {formatPercentage(crypto.price_change_percentage_24h)}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

// ── CRYPTO TABLE ──────────────────────────────────────────────────────────────

interface CryptoTableRowProps {
  name: string;
  image: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  klineData: LineCryptoDataPoint[] | undefined;
}

function CryptoTable({ data }: { data: CombinedCryptoData[] | null }) {
  if (!data) return null;
  const rows = data
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, -5)
    .filter((item) => !item.symbol.toLowerCase().includes("usdc"));

  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-white/[0.07]">
            {["Name", "Price", "Market Cap", "24h Volume", "24h Change", "7 Days"].map((h, i) => (
              <th key={h} className={`px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/28 ${i <= 1 ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <CryptoTableRow
              key={index}
              image={item.image}
              name={item.name}
              symbol={item.symbol}
              price={item.current_price}
              marketCap={item.market_cap}
              volume={item.total_volume}
              change={item.price_change_percentage_24h}
              klineData={item.KlineData}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CryptoTableRow({ name, image, symbol, price, marketCap, volume, change, klineData }: CryptoTableRowProps) {
  const up = change > 0;
  return (
    <motion.tr
      whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
      className="cursor-pointer transition-colors border-b border-white/[0.05] group"
      onClick={() => (window.location.href = `/trade/${symbol.toUpperCase()}_USDC`)}
    >
      {/* Name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 bg-white/[0.04] shrink-0">
            <Image src={image} alt={symbol} width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-[10px] font-medium uppercase text-white/30">{symbol}</p>
          </div>
        </div>
      </td>
      {/* Price */}
      <td className="px-5 py-3.5">
        <span className="font-mono text-sm text-white tabular-nums">
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </td>
      {/* Market cap */}
      <td className="px-5 py-3.5 text-right">
        <span className="font-mono text-sm text-white/55 tabular-nums">${formatNumber(marketCap)}</span>
      </td>
      {/* Volume */}
      <td className="px-5 py-3.5 text-right">
        <span className="font-mono text-sm text-white/55 tabular-nums">${formatNumber(volume)}</span>
      </td>
      {/* Change */}
      <td className="px-5 py-3.5 text-right">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
          up
            ? "text-[#22c55e] bg-[#22c55e]/10 ring-1 ring-[#22c55e]/20"
            : "text-[#ef4444] bg-[#ef4444]/10 ring-1 ring-[#ef4444]/20"
        }`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? "+" : ""}{change?.toFixed(2)}%
        </span>
      </td>
      {/* Sparkline */}
      <td className="px-5 py-3.5 flex justify-end items-center">
        <CryptoLineChart data={klineData ?? []} color={up ? "#22c55e" : "#ef4444"} />
      </td>
    </motion.tr>
  );
}

// ── SPARKLINE ─────────────────────────────────────────────────────────────────

const formatData = (data: LineCryptoDataPoint[]) =>
  data.map((point) => ({
    time: (new Date(point.end).getTime() / 1000) as UTCTimestamp,
    value: parseFloat(point.close),
  }));

const CryptoLineChart = ({ data, color }: { data: LineCryptoDataPoint[]; color: string }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef<IChartApi | null>(null);
  const formattedData = useMemo(() => formatData(data), [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      height: 36,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "transparent" },
      watermark: { visible: false },
      rightPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      grid: { horzLines: { visible: false }, vertLines: { visible: false } },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });
    chart.priceScale("right").applyOptions({ borderVisible: false });
    const lineSeries = chart.addLineSeries({ color, lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
    lineSeries.setData(formattedData);
    chartRef.current = chart;
    return () => chart.remove();
  }, [formattedData, color]);

  if (!data) return <div className="w-28" />;
  return <div className="w-28 bg-transparent" ref={chartContainerRef} />;
};
