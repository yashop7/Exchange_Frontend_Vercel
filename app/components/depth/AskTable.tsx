import { formatNumber } from './BidTable';

const ROWS = 14;

const R = 'rgb(234,56,59)';
const R_DEPTH = 'rgba(234,56,59,0.10)';
const R_QTY   = 'rgba(234,56,59,0.22)';

export const AskTable = ({ asks }: { asks: [string, string][] }) => {
  const relevant = asks.slice(0, ROWS);
  let cumulative = 0;
  const rows: [string, string, number][] = relevant.map(
    ([p, q]) => [p, q, (cumulative += Number(q))]
  );
  const maxTotal = cumulative;

  const display = [...rows].reverse();

  return (
    <div className="flex flex-col justify-end overflow-hidden" style={{ height: `${ROWS * 22}px` }}>
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
