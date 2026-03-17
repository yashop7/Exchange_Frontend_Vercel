import { motion } from "framer-motion";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Order } from "../trade/[market]/page";
import Image from "next/image";

export function OrderTable({ openOrders }: { openOrders: Order[] }) {
  const aggregatedOpenOrders = openOrders.reduce((acc: Order[], order) => {
    const existing = acc.find((o) => o.price === order.price && o.side === order.side);
    if (existing) {
      existing.quantity += order.quantity;
      existing.filled += order.filled;
    } else {
      acc.push({ ...order });
    }
    return acc;
  }, []);

  const filledOrders = [
    { price: 1006.5, quantity: 0.2, orderId: "2", filled: 0.2, side: "sell", userId: "2" },
    { price: 1006.5, quantity: 0.2, orderId: "2", filled: 0.2, side: "buy", userId: "2" },
    { price: 1006.5, quantity: 0.2, orderId: "2", filled: 0.2, side: "buy", userId: "2" },
    { price: 1006.5, quantity: 0.2, orderId: "2", filled: 0.2, side: "sell", userId: "2" },
    { price: 1006.5, quantity: 0.2, orderId: "2", filled: 0.2, side: "sell", userId: "2" },
  ];

  return (
    <div className="bg-transparent p-6 rounded-xl shadow-lg">
      <Tabs defaultValue="openOrders">
        <TabsList className="bg-transparent/30 p-4 rounded-md h-10 border border-gray-600/40 flex justify-start space-x-2">
          <TabsTrigger value="openOrders" className="px-4 m-5 hover:bg-gray-900 hover:border-gray-700/20 cursor-pointer py-1">
            Open Orders
          </TabsTrigger>
          <TabsTrigger value="filledOrders" className="px-4 py-1 hover:bg-gray-900 hover:border-gray-700/20 cursor-pointer m-2">
            Filled Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="openOrders">
          <div className="overflow-x-auto no-scrollbar rounded-lg mt-4">
            <table className="min-w-full text-left text-slate-200 border-collapse">
              <thead>
                <motion.tr className="bg-transparent text-neutral-400 text-sm uppercase tracking-wider border-b border-gray-800">
                  <th className="px-6 py-4 font-normal">COIN</th>
                  <th className="px-6 py-4 font-normal">PRICE</th>
                  <th className="px-6 py-4 font-normal">QUANTITY</th>
                  <th className="px-6 py-4 font-normal">FILLED</th>
                  <th className="px-6 py-4 font-normal">SIDE</th>
                </motion.tr>
              </thead>
              <motion.tbody>
                {aggregatedOpenOrders.map((order) => (
                  <motion.tr
                    key={order.orderId}
                    whileHover={{
                      scale: 1.002,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                    className="border-b border-gray-700 cursor-pointer"
                  >
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Image src="/TATA.png" alt="coin" width={24} height={24} className="w-6 h-6 rounded-full" />
                    </td>
                    <td className="px-6 py-4 font-medium">{order.price}</td>
                    <td className="px-6 py-4">{order.quantity}</td>
                    <td className="px-6 py-4">{order.filled}</td>
                    <td>
                      <span
                        className={
                          `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ` +
                          (order.side === "buy"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500")
                        }
                      >
                        {order.side === "buy" ? (
                          <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3" />
                        )}
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="filledOrders">
          <div className="overflow-x-auto no-scrollbar rounded-lg mt-4">
            <table className="min-w-full text-left text-slate-200 border-collapse">
              <thead>
                <motion.tr className="bg-transparent text-neutral-400 text-sm uppercase tracking-wider border-b border-gray-800">
                  <th className="px-6 py-4 font-normal">COIN</th>
                  <th className="px-6 py-4 font-normal">PRICE</th>
                  <th className="px-6 py-4 font-normal">QUANTITY</th>
                  <th className="px-6 py-4 font-normal">FILLED</th>
                  <th className="px-6 py-4 font-normal">SIDE</th>
                </motion.tr>
              </thead>
              <motion.tbody>
                {filledOrders.map((order) => (
                  <motion.tr
                    key={order.orderId}
                    whileHover={{
                      scale: 1.002,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                    className="border-b border-gray-700 cursor-pointer"
                  >
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Image src="/TATA.png" alt="coin" width={24} height={24} className="w-6 h-6 rounded-full" />
                    </td>
                    <td className="px-6 py-4 font-medium">{order.price}</td>
                    <td className="px-6 py-4">{order.quantity}</td>
                    <td className="px-6 py-4">{order.filled}</td>
                    <td>
                      <span
                        className={
                          `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ` +
                          (order.side === "buy"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500")
                        }
                      >
                        {order.side === "buy" ? (
                          <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3" />
                        )}
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
