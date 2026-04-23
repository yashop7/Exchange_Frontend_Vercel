import { formatNumber } from './BidTable';

const ROWS = 14;

const R       = 'rgb(234,56,59)';
const R_DEPTH = 'rgba(234,56,59,0.10)';
const R_QTY   = 'rgba(234,56,59,0.22)';

const DEMO_ASKS: [string, string][] = [
  ["2403.31", "4.1620"], ["2403.28", "4.8049"], ["2403.17", "4.8072"],
  ["2403.12", "4.8072"], ["2403.11", "1.4709"], ["2403.06", "4.8072"],
  ["2403.05", "0.0305"], ["2402.99", "4.8072"], ["2402.93", "0.7200"],
  ["2402.91", "4.8072"], ["2402.82", "2.2700"], ["2402.75", "1.7335"],
  ["2402.64", "0.5243"], ["2402.60", "0.4541"],
];

export const AskTable = ({ asks }: { asks: [string, string][] }) => {
  const source = asks.length > 0 ? asks : DEMO_ASKS;
  const isDemoMode = asks.length === 0;

  const relevant = source.slice(0, ROWS);
  let cumulative = 0;
  const rows: [string, string, number][] = relevant.map(
    ([p, q]) => [p, q, (cumulative += Number(q))]
  );
  const maxTotal = cumulative;

  const display = [...rows].reverse();

  return (
    <div className={`flex flex-col justify-end overflow-hidden ${isDemoMode ? "opacity-30 pointer-events-none select-none" : ""}`} style={{ height: `${ROWS * 22}px` }}>
      {display.map(([price, quantity, total]) => (
        <AskRow key={price} price={price} quantity={quantity} total={total} maxTotal={maxTotal} />
      ))}
    </div>
  );
};

function AskRow({ price, quantity, total, maxTotal }: {
  price: string; quantity: string; total: number; maxTotal: number;
}) {
  const depthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const qtyPct   = maxTotal > 0 ? (Number(quantity) / maxTotal) * 55 : 0;

  return (
    <div className="relative h-[22px] cursor-pointer group overflow-hidden border-b border-white/[0.03]">
      <div
        className="absolute top-0 right-0 h-full transition-[width] duration-200"
        style={{ width: `${depthPct * 0.65}%`, background: R_DEPTH, borderRadius: '3px 0 0 3px' }}
      />
      <div
        className="absolute top-0 right-0 h-full transition-[width] duration-200"
        style={{ width: `${qtyPct}%`, background: R_QTY, borderRadius: '3px 0 0 3px' }}
      />
      <div className="relative z-10 flex items-center h-full px-3 group-hover:bg-white/[0.025]">
        <span className="flex-1 text-[11.5px] font-medium tabular-nums" style={{ color: R }}>
          {parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="flex-1 text-[11.5px] text-white tabular-nums text-center">
          {formatNumber(quantity)}
        </span>
        <span className="flex-1 text-[11.5px] text-white tabular-nums text-right">
          {formatNumber(total.toFixed(2))}
        </span>
      </div>
    </div>
  );
}
