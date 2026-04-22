import { useEffect, useRef } from "react";
import { ChartManager } from "../utils/ChartManager";
import { getKlines, RateLimitError } from "../utils/httpClient";
import { KLine } from "../utils/types";
import { toast } from "@/hooks/use-toast";

function generateDummyKlines(count = 120, basePrice = 1000): { open: number; high: number; low: number; close: number; timestamp: Date }[] {
  const now = Date.now();
  const intervalMs = 60 * 60 * 1000; // 1h
  let price = basePrice;
  const candles = [];

  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.485) * price * 0.012;
    const close = Math.max(open + change, 1);
    const wick = price * (0.003 + Math.random() * 0.008);
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick;
    candles.push({ open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), timestamp: new Date(now - i * intervalMs) });
    price = close;
  }
  return candles;
}

export function TradeView({ market }: { market: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager>(null);

  useEffect(() => {
    const init = async () => {
      let data: { open: number; high: number; low: number; close: number; timestamp: Date }[] = [];

      try {
        const klineData: KLine[] = await getKlines(
          market,
          "1h",
          Math.floor((Date.now() - 1000 * 60 * 60 * 24 * 10) / 1000),
          Math.floor(Date.now() / 1000)
        );
        if (klineData?.length) {
          data = klineData
            .map((x) => ({
              close: parseFloat(x.close),
              high: parseFloat(x.high),
              low: parseFloat(x.low),
              open: parseFloat(x.open),
              timestamp: new Date(x.end),
            }))
            .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
        }
      } catch (err) {
        if (err instanceof RateLimitError) {
          toast({ variant: "destructive", title: "Chart rate limit", description: err.message, duration: 5000 });
        }
      }

      if (!data.length) {
        data = generateDummyKlines(120);
      }

      if (chartRef.current) {
        chartManagerRef.current?.destroy();
        // @ts-ignore
        chartManagerRef.current = new ChartManager(chartRef.current, data, {
          background: "#000000",
          color: "rgba(255,255,255,0.35)",
        });
      }
    };

    init();
  }, [market, chartRef]);

  return (
    <div className="font-inter" ref={chartRef} style={{ height: "75vh", width: "100%", marginTop: 4 }} />
  );
}
