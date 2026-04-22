"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { OrderTable } from "@/app/components/OrderTable";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { BASE_URL } from "@/app/utils/httpClient";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface Order {
  price: number;
  quantity: number;
  orderId: string;
  filled: number;
  side: "buy" | "sell";
  userId: string;
}

export default function Page() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const market = segments[segments.length - 1];
  const [balance, setBalance] = useState("");
  const [inr, setInr] = useState("");
  const [openOrders, setOpenOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await axios.get(`${BASE_URL}/order/balance`, {
          params: { userId: "1", market: "TATA_INR" },
        });
        setOpenOrders(response.data.openOrders);
        setBalance(response.data.balance);
        setInr(response.data.inr);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
    fetchBalance();
    setInterval(() => { fetchBalance(); }, 1000 * 10);
  }, []);

  return (
    <div className="relative flex flex-col lg:flex-row w-full min-h-[calc(100vh-56px)] bg-black overflow-hidden">
      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Ticker */}
        <MarketBar market={market as string} />

        {/* Chart + Depth row */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Chart */}
          <div className="flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-white/10">
            <TradeView market={market as string} />
          </div>

          {/* Order book */}
          <div
            className="w-full lg:w-[260px] shrink-0 border-b lg:border-b-0 border-white/10 overflow-hidden"
            style={{ maxHeight: "calc(100vh - 56px - 56px)" }}
          >
            <Depth market={market as string} />
          </div>
        </div>

        {/* Open orders */}
        <OrderTable openOrders={openOrders} />
      </div>

      {/* Swap panel */}
      <div className="w-full lg:w-[300px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto no-scrollbar">
        <SwapUI market={market as string} balance={balance} inr={inr} />
      </div>
    </div>
  );
}
