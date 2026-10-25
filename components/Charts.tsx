import { formatCurrency, formatNumber } from "@/lib/utils";

export type SeriesPoint = {
  month: string;
  label: string;
  income: number;
  expense: number;
};

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    const midX = (prev.x + current.x) / 2;
    path += ` C ${midX} ${prev.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
  }
  return path;
}

export function CashflowChart({ series, currency = "PEN" }: { series: SeriesPoint[]; currency?: string }) {
  const width = 720;
  const height = 260;
  const pad = { top: 18, right: 12, bottom: 32, left: 12 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const maxValue =
    Math.max(1, ...series.flatMap((point) => [point.income, point.expense])) * 1.12;
  const baseline = pad.top + plotHeight;
  const x = (index: number) =>
    pad.left + (series.length === 1 ? plotWidth / 2 : (index * plotWidth) / (series.length - 1));
  const y = (value: number) => pad.top + (1 - value / maxValue) * plotHeight;

  const incomePoints = series.map((point, index) => ({ x: x(index), y: y(point.income) }));
  const expensePoints = series.map((point, index) => ({ x: x(index), y: y(point.expense) }));
  const incomeLine = buildSmoothPath(incomePoints);
  const expenseLine = buildSmoothPath(expensePoints);
  const incomeArea =
    incomeLine +
    ` L ${incomePoints[incomePoints.length - 1].x} ${baseline} L ${incomePoints[0].x} ${baseline} Z`;

  const totalIncome = series.reduce((sum, point) => sum + point.income, 0);
  const totalExpense = series.reduce((sum, point) => sum + point.expense, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="inline-flex items-center gap-2 text-xs text-mist">
          <span className="h-2 w-2 rounded-full bg-mint" />
          Ingresos
          <span className="font-semibold text-white tnum">{formatCurrency(totalIncome, currency, { compact: true })}</span>
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-mist">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          Gastos
          <span className="font-semibold text-white tnum">{formatCurrency(totalExpense, currency, { compact: true })}</span>
        </span>
        <span className="ml-auto hidden text-[11px] text-slate-500 sm:inline">Últimos 6 meses</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Flujo de ingresos y gastos de los últimos seis meses"
      >
        <defs>
          <linearGradient id="income-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2fe0a4" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#2fe0a4" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#2fe0a4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.33, 0.66, 1].map((fraction) => (
          <line
            key={fraction}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + plotHeight * fraction}
            y2={pad.top + plotHeight * fraction}
            stroke="#1a2634"
            strokeDasharray={fraction === 1 ? "0" : "3 6"}
            strokeWidth={1}
          />
        ))}

        <path d={incomeArea} fill="url(#income-area)" />
        <path
          d={expenseLine}
          fill="none"
          stroke="#fb7185"
          strokeWidth={2}
          strokeOpacity={0.75}
          strokeLinecap="round"
        />
        <path
          d={incomeLine}
          fill="none"
          stroke="#2fe0a4"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {incomePoints.map((point, index) => (
          <g key={`income-${series[index].month}`}>
            <circle cx={point.x} cy={point.y} r={4} fill="#07110d" stroke="#2fe0a4" strokeWidth={2} />
            <circle cx={point.x} cy={point.y} r={12} fill="transparent">
              <title>{`${series[index].label} · Ingresos: ${formatCurrency(series[index].income, "PEN")}`}</title>
            </circle>
          </g>
        ))}

        {expensePoints.map((point, index) => (
          <circle key={`expense-${series[index].month}`} cx={point.x} cy={point.y} r={9} fill="transparent">
            <title>{`${series[index].label} · Gastos: ${formatCurrency(series[index].expense, "PEN")}`}</title>
          </circle>
        ))}

        {series.map((point, index) => (
          <text
            key={point.month}
            x={x(index)}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#6e8399"
            className="capitalize"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function CategoryDonut({
  slices,
  total,
  currency = "PEN",
}: {
  slices: Array<{ label: string; value: number; color: string }>;
  total: number;
  currency?: string;
}) {
  const size = 190;
  const radius = 68;
  const stroke = 17;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cursor = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-[168px] w-[168px] -rotate-90"
          role="img"
          aria-label="Distribución de gastos por categoría"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#14202c"
            strokeWidth={stroke}
          />
          {slices.map((slice) => {
            const fraction = total > 0 ? slice.value / total : 0;
            const length = fraction * circumference;
            const dash = Math.max(length - 4, 0);
            const offset = cursor;
            cursor += length;
            if (dash <= 0) return null;
            return (
              <circle
                key={slice.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              >
                <title>{`${slice.label}: ${formatCurrency(slice.value, currency)}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Gastos</span>
          <span className="mt-0.5 text-lg font-semibold tracking-tight text-white tnum">
            {formatCurrency(total, currency, { compact: total >= 10000, decimals: false })}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {slices.slice(0, 5).map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-slate-300">{slice.label}</span>
            <span className="text-slate-500 tnum">
              {formatNumber(total > 0 ? (slice.value / total) * 100 : 0)}%
            </span>
            <span className="w-20 text-right font-medium text-white tnum">
              {formatCurrency(slice.value, currency, { decimals: false })}
            </span>
          </li>
        ))}
        {slices.length === 0 && (
          <li className="text-xs text-slate-500">Aún no hay gastos registrados este mes.</li>
        )}
      </ul>
    </div>
  );
}
