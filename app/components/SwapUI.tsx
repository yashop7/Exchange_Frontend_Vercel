"use client";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { RateLimitError } from "../utils/httpClient";
import { orderLimiter } from "../utils/rateLimiter";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function SwapUI({
  market,
  balance,
  inr,
}: {
  market: string;
  balance: string;
  inr: string;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("buy");
  const [type, setType] = useState("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const isBuy = activeTab === "buy";

  return (
    <div className="relative h-full flex flex-col overflow-y-auto no-scrollbar bg-black">
      <div className="p-4 flex flex-col gap-4">

        {/* ── Buy / Sell toggle ── */}
        <div className="relative flex rounded-lg p-1 bg-white/[0.05] border border-white/10">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
            className="absolute inset-y-1 w-[calc(50%-4px)] rounded-md"
            style={{
              left: isBuy ? "4px" : "calc(50% + 0px)",
              background: isBuy ? "rgba(0,194,120,0.15)" : "rgba(234,56,59,0.15)",
              border: isBuy ? "1px solid rgba(0,194,120,0.25)" : "1px solid rgba(234,56,59,0.25)",
            }}
          />
          <button
            type="button"
            onClick={() => setActiveTab("buy")}
            className={`relative flex-1 py-2.5 text-sm font-semibold rounded-md z-10 transition-colors duration-200 ${
              isBuy ? "text-[rgb(0,194,120)]" : "text-white/35 hover:text-white/60"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sell")}
            className={`relative flex-1 py-2.5 text-sm font-semibold rounded-md z-10 transition-colors duration-200 ${
              !isBuy ? "text-[rgb(234,56,59)]" : "text-white/35 hover:text-white/60"
            }`}
          >
            Sell
          </button>
        </div>

        {/* ── Order type chips ── */}
        <div className="flex gap-2">
          {["limit", "market"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                type === t
                  ? "bg-white/10 border border-white/20 text-white"
                  : "border border-white/10 text-white/35 hover:text-white/65 hover:border-white/15"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Balance display ── */}
        <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
              Available balance
            </p>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {[
              { src: "/usdc copy.webp", symbol: "USDC", value: parseFloat(balance || "0").toFixed(2) },
              { src: "/TATA.png", symbol: "TATA", value: parseFloat(inr || "0").toFixed(7) },
            ].map(({ src, symbol, value }) => (
              <div key={symbol} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/10">
                    <Image src={src} alt={symbol} width={20} height={20} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-white/45 font-medium">{symbol}</span>
                </div>
                <span className="font-mono text-xs font-medium text-white tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Price input ── */}
        <InputField
          label="Price"
          placeholder="0.00"
          value={price ? parseFloat(price).toLocaleString("en-US") : ""}
          onChange={(v) => setPrice(v)}
          iconSrc="/usdc copy.webp"
          iconLabel="USDC"
        />

        {/* ── Quantity input ── */}
        <div className="flex flex-col gap-2">
          <InputField
            label="Quantity"
            placeholder="0.00"
            value={quantity ? parseFloat(quantity).toLocaleString("en-US") : ""}
            onChange={(v) => setQuantity(v)}
            iconSrc="/TATA.png"
            iconLabel="TATA"
          />

          {/* Percentage pills */}
          <div className="grid grid-cols-4 gap-1.5">
            {["25%", "50%", "75%", "Max"].map((pct) => (
              <button
                key={pct}
                type="button"
                className="py-1.5 rounded-md border border-white/10 bg-white/[0.03] text-[10px] font-medium text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-150"
              >
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* ── Order value (read-only) ── */}
        <InputField
          label="Order value"
          placeholder="0.00"
          value={price && quantity ? (parseFloat(price) * parseFloat(quantity)).toLocaleString("en-US") : ""}
          onChange={() => {}}
          iconSrc="/usdc copy.webp"
          iconLabel="USDC"
          readOnly
        />

        {/* ── Submit button ── */}
        <motion.button
          type="button"
          onClick={async () => {
            if (market !== "TATA_INR") {
              toast({ title: "Market unavailable", description: "Trading is only supported for TATA_INR at the moment.", duration: 4000 });
              return;
            }
            const rl = orderLimiter.check();
            if (!rl.allowed) {
              toast({
                variant: "destructive",
                title: "Order rate limit reached",
                description: `You've hit the 30 orders/min limit. Try again in ${rl.retryAfterSec}s.`,
                duration: 5000,
              });
              return;
            }
            try {
              await axios.post(`/api/engine/order`, {
                market,
                price: price.toString(),
                quantity: quantity.toString(),
                side: activeTab.toString(),
                userId: "1",
              });
              setOrderPlaced(!orderPlaced);
              toast({ variant: "success", title: "Order placed", description: `Order submitted · ${orderLimiter.remaining()} orders remaining this minute`, duration: 4000 });
            } catch (err) {
              if (err instanceof RateLimitError) {
                toast({ variant: "destructive", title: "Rate limit", description: err.message, duration: 5000 });
              } else {
                toast({ variant: "destructive", title: "Order failed", description: "Could not reach the exchange engine. Please try again.", duration: 5000 });
              }
            }
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
            market !== "TATA_INR"
              ? "opacity-40 bg-white/[0.05] border border-white/10 text-white/40"
              : isBuy ? "text-black" : "text-white"
          }`}
          style={market === "TATA_INR" ? { background: isBuy ? 'rgb(0,194,120)' : 'rgb(234,56,59)' } : {}}
        >
          {isBuy ? "Place buy order" : "Place sell order"}
        </motion.button>

        {/* ── Options ── */}
        <div className="flex items-center gap-5 pb-2">
          {[
            { id: "postOnly", label: "Post only" },
            { id: "ioc",      label: "IOC" },
          ].map(({ id, label }) => (
            <div key={id} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                id={id}
                className="h-3.5 w-3.5 rounded border border-white/15 bg-white/[0.04] data-[state=checked]:bg-white data-[state=checked]:border-white focus:ring-0 shadow-none"
              />
              <label
                htmlFor={id}
                className="text-xs text-white/35 group-hover:text-white/65 cursor-pointer select-none transition-colors"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  iconSrc,
  iconLabel,
  readOnly = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  iconSrc: string;
  iconLabel: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium uppercase tracking-widest text-white/30">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          step="0.01"
          placeholder={placeholder}
          readOnly={readOnly}
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/,/g, "");
            if (v === "" || /^\d*\.?\d*$/.test(v)) onChange(v);
          }}
          className={`w-full h-11 rounded-lg border border-white/10 bg-white/[0.04] pr-16 pl-4 text-right font-mono text-sm text-white tabular-nums placeholder-white/20 transition-all duration-150 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] ${readOnly ? "cursor-default text-white/40" : ""}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full overflow-hidden ring-1 ring-white/10">
            <Image src={iconSrc} alt={iconLabel} width={16} height={16} className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] font-medium text-white/35">{iconLabel}</span>
        </div>
      </div>
    </div>
  );
}
