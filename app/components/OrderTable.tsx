import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Order } from "../trade/[market]/page";
import Image from "next/image";

export function OrderTable({ openOrders }: { openOrders: Order[] }) {
  const aggregated = openOrders.reduce((acc: Order[], order) => {
    const existing = acc.find((o) => o.price === order.price && o.side === order.side);
    if (existing) {
      existing.quantity += order.quantity;
      existing.filled += order.filled;
    } else {
      acc.push({ ...order });
    }
    return acc;
  }, []);

  return (
    <div className="border-t border-white/10 bg-black">
      <div className="px-4 pt-3 pb-2.5 border-b border-white/10">
        <span className="text-xs font-medium text-white/70">Open orders</span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Coin", "Price", "Quantity", "Filled", "Side"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[9px] font-medium uppercase tracking-widest text-white/28">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aggregated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-white/25">
                  No open orders
                </td>
              </tr>
            ) : (
              aggregated.map((order) => (
                <tr
                  key={order.orderId}
                  className="border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/10">
                      <Image src="/TATA.png" alt="coin" width={20} height={20} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-white/50">TATA</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white tabular-nums">{order.price}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60 tabular-nums">{order.quantity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60 tabular-nums">{order.filled}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        order.side === "buy"
                          ? "bg-[#22c55e]/10 text-[#22c55e] ring-1 ring-[#22c55e]/20"
                          : "bg-[#ef4444]/10 text-[#ef4444] ring-1 ring-[#ef4444]/20"
                      }`}
                    >
                      {order.side === "buy"
                        ? <ArrowUpIcon className="w-2.5 h-2.5" />
                        : <ArrowDownIcon className="w-2.5 h-2.5" />}
                      {order.side.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
