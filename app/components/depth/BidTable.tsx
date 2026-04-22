const ROWS = 14;

const G = 'rgb(0,194,120)';
const G_DEPTH = 'rgba(0,194,120,0.10)';
const G_QTY   = 'rgba(0,194,120,0.22)';

export const BidTable = ({ bids }: { bids: [string, string][] }) => {
  const relevant = bids.slice(0, ROWS);
  let cumulative = 0;
  const rows: [string, string, number][] = relevant.map(
    ([p, q]) => [p, q, (cumulative += Number(q))]
  );
  const maxTotal = cumulative;

  return (
    <div className="overflow-hidden" style={{ height: `${ROWS * 22}px` }}>
      {rows.map(([price, quantity, total]) => (
        <BidRow key={price} price={price} quantity={quantity} total={total} maxTotal={maxTotal} />
      ))}
    </div>
  );
};

function BidRow({ price, quantity, total, maxTotal }: {
  price: string; quantity: string; total: number; maxTotal: number;
}) {
  const depthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const qtyPct   = maxTotal > 0 ? (Number(quantity) / maxTotal) * 55 : 0;

  return (
    <div className="relative h-[22px] cursor-pointer group overflow-hidden border-b border-white/[0.03]">
      <div
        className="absolute top-0 right-0 h-full transition-[width] duration-200"
        style={{ width: `${depthPct * 0.65}%`, background: G_DEPTH, borderRadius: '3px 0 0 3px' }}
      />
      <div
        className="absolute top-0 right-0 h-full transition-[width] duration-200"
        style={{ width: `${qtyPct}%`, background: G_QTY, borderRadius: '3px 0 0 3px' }}
      />
      <div className="relative z-10 flex items-center h-full px-3 group-hover:bg-white/[0.025]">
        <span className="flex-1 text-[11.5px] font-medium tabular-nums" style={{ color: G }}>
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

export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  return num.toFixed(4);
}
