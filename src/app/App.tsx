import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from "recharts";
import {
  Brain,
  TrendingUp,
  School,
  Megaphone,
  ChevronDown,
  Sparkles,
  Activity,
  DollarSign,
} from "lucide-react";

// ─── Palette ────────────────────────────────────────────────────────────────

const TEAL = "#7fa89c";
const VIOLET = "#a78bfa";
const AMBER = "#f2b155";
const SLATE = "#94a3b8";
const GRID = "rgba(15,23,42,0.06)";
const AXIS = "#8a95a6";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#e7ebf2";
const TEAL_DIM = "rgba(127,168,156,0.18)";
const VIOLET_DIM = "rgba(167,139,250,0.18)";

// ─── Static Data ────────────────────────────────────────────────────────────

type Month = "Jul" | "Ago" | "Set";

const MONTHLY = {
  Jul: { lic: 1, ingresoMensual: 208, ingresoAcum: 208, citas: 47, pub: 200 },
  Ago: { lic: 1, ingresoMensual: 208, ingresoAcum: 416, citas: 47, pub: 200 },
  Set: { lic: 2, ingresoMensual: 416, ingresoAcum: 832, citas: 94, pub: 200 },
} satisfies Record<Month, { lic: number; ingresoMensual: number; ingresoAcum: number; citas: number; pub: number }>;

const PREDICTIVE = {
  Oct: { lic: 3, rango: "2–4", ing: 624, pub: 300 },
  Nov: { lic: 5, rango: "4–6", ing: 1040, pub: 450 },
  Dic: { lic: 6, rango: "5–8", ing: 1248, pub: 450 },
};

const colegiosNuevosData = [
  { mes: "Jul", colegios: 0 },
  { mes: "Ago", colegios: 0 },
  { mes: "Set", colegios: 1 },
];

const ingresoAcumData = [
  { mes: "Jul", ingreso: 208 },
  { mes: "Ago", ingreso: 416 },
  { mes: "Set", ingreso: 832 },
];

const citasPieData = [
  { name: "Académico", value: 85, pct: 45, color: TEAL },
  { name: "Conducta", value: 47, pct: 25, color: VIOLET },
  { name: "Trámites", value: 38, pct: 20, color: AMBER },
  { name: "Otros", value: 18, pct: 10, color: SLATE },
];

const scatterReal = [
  { citas: 141, csat: 4.2, nombre: "IE San Martín de Porres" },
  { citas: 47, csat: 4.0, nombre: "Colegio 2" },
];

const scatterGhost = [
  { citas: 90, csat: 4.1 },
  { citas: 65, csat: 3.8 },
  { citas: 110, csat: 4.4 },
  { citas: 75, csat: 4.3 },
  { citas: 130, csat: 4.6 },
  { citas: 55, csat: 3.9 },
];

const rankingData = [
  { nombre: "IE San Martín de Porres", citas: 141 },
  { nombre: "Colegio 2", citas: 47 },
];

const predColegiosData = [
  { mes: "Jul", real: 1, proj: null as number | null, lower: null as number | null, band: null as number | null },
  { mes: "Ago", real: 1, proj: null, lower: null, band: null },
  { mes: "Set", real: 2, proj: 2, lower: 2, band: 0 },
  { mes: "Oct", real: null as number | null, proj: 3, lower: 2, band: 2 },
  { mes: "Nov", real: null, proj: 5, lower: 4, band: 2 },
  { mes: "Dic", real: null, proj: 6, lower: 5, band: 3 },
];

const predIngresoData = [
  { mes: "Jul", real: 208, proj: null as number | null, lower: null as number | null, band: null as number | null },
  { mes: "Ago", real: 208, proj: null, lower: null, band: null },
  { mes: "Set", real: 416, proj: 416, lower: 416, band: 0 },
  { mes: "Oct", real: null as number | null, proj: 624, lower: 500, band: 250 },
  { mes: "Nov", real: null, proj: 1040, lower: 832, band: 416 },
  { mes: "Dic", real: null, proj: 1248, lower: 1000, band: 500 },
];

const predPublicidadData = [
  { mes: "Jul", real: 200, proj: null as number | null, lower: null as number | null, band: null as number | null },
  { mes: "Ago", real: 200, proj: null, lower: null, band: null },
  { mes: "Set", real: 200, proj: 200, lower: 200, band: 0 },
  { mes: "Oct", real: null as number | null, proj: 300, lower: 250, band: 100 },
  { mes: "Nov", real: null, proj: 450, lower: 380, band: 140 },
  { mes: "Dic", real: null, proj: 450, lower: 380, band: 140 },
];

function dailyCitas(month: string): { dia: string; citas: number }[] {
  const base = month === "Set" ? 4.3 : 2.1;
  const offset = month === "Set" ? 1 : month === "Ago" ? 2.5 : 0;
  return Array.from({ length: 22 }, (_, i) => ({
    dia: `D${i + 1}`,
    citas: Math.max(1, Math.round(base + Math.sin(i * 0.7 + offset) * 1.5)),
  }));
}

// ─── Tooltip ────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string; stroke?: string }[];
  label?: string;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  const filtered = payload.filter(
    (p) => p.name !== "lower" && p.name !== "band" && p.value != null
  );
  if (!filtered.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xl text-xs">
      {label && <p className="font-mono text-slate-500 mb-1.5 text-[11px]">{label}</p>}
      {filtered.map((p, i) => (
        <p
          key={i}
          className="font-mono"
          style={{ color: p.color || p.stroke || "#334155" }}
        >
          {p.name !== "real" && p.name !== "proj" ? `${p.name}: ` : ""}
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString("es-PE") : p.value}
          {suffix}
        </p>
      ))}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function KPICard({
  icon,
  title,
  value,
  sub,
  color,
  isAI = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  color: string;
  isAI?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: CARD_BG, borderColor: CARD_BORDER }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"
        style={{ background: `${color}15` }}
      />
      <div className="flex items-center justify-between relative">
        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest leading-none">
          {title}
        </p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="relative">
        <p className="text-2xl font-semibold text-slate-700 font-mono leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1.5 leading-snug">{sub}</p>
      </div>
      {isAI && (
        <div
          className="flex items-center gap-1 text-[11px] font-mono w-fit rounded-full px-2 py-0.5"
          style={{ color: VIOLET, background: `${VIOLET}15` }}
        >
          <Brain size={9} />
          proyección IA
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  color,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700 leading-none">{title}</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 font-mono">{subtitle}</p>
        </div>
      </div>
      {badge}
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-3 ${className}`}
      style={{ background: CARD_BG, borderColor: CARD_BORDER }}
    >
      <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest leading-none">
        {title}
      </p>
      {children}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="appearance-none rounded-lg border text-slate-700 text-xs px-3 py-2 pr-7 font-mono focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors hover:border-slate-300"
          style={{
            background: "#ffffff",
            borderColor: CARD_BORDER,
            color: disabled ? "#b7c0cd" : "#334155",
          }}
        >
          {options.map((o) => (
            <option key={o} value={o} style={{ background: "#ffffff" }}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={11}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: AXIS }}
        />
      </div>
    </div>
  );
}

function PredLegend({ realColor = TEAL }: { realColor?: string }) {
  return (
    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 mt-1">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-4 h-0.5 rounded" style={{ background: realColor }} />
        Real
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block w-4 h-0.5 rounded"
          style={{ background: VIOLET, backgroundImage: `repeating-linear-gradient(90deg, ${VIOLET} 0 4px, transparent 4px 7px)` }}
        />
        Proyección
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: VIOLET_DIM }} />
        Rango conf.
      </span>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [selectedDay, setSelectedDay] = useState("Todos");

  const historicalSet = new Set(["Jul", "Ago", "Set"]);
  const predictiveSet = new Set(["Oct", "Nov", "Dic"]);
  const isHistorical = historicalSet.has(selectedMonth);
  const isPredictive = predictiveSet.has(selectedMonth);
  const isFiltered = selectedMonth !== "Todos";

  const dayOptions = ["Todos", ...Array.from({ length: 22 }, (_, i) => `Día ${i + 1}`)];
  const selectedDayNum = selectedDay !== "Todos" ? parseInt(selectedDay.replace("Día ", "")) : null;

  const kpi = useMemo(() => {
    if (isPredictive) {
      const p = PREDICTIVE[selectedMonth as keyof typeof PREDICTIVE];
      return { lic: p.lic, pub: p.pub, ing: p.ing, isAI: true };
    }
    if (isHistorical) {
      const m = MONTHLY[selectedMonth as Month];
      return { lic: m.lic, pub: m.pub, ing: m.ingresoMensual, isAI: false };
    }
    return { lic: 2, pub: 600, ing: 832, isAI: false };
  }, [selectedMonth, isHistorical, isPredictive]);

  // Bar chart: daily citas when month selected, monthly colegios otherwise
  const barData = useMemo(() => {
    if (isHistorical) return dailyCitas(selectedMonth);
    return colegiosNuevosData;
  }, [selectedMonth, isHistorical]);

  // Highlighted month in monthly bar chart
  const getBarFill = (mes: string) =>
    !isFiltered || selectedMonth === mes ? TEAL : `${TEAL}30`;

  // Daily detail data if a day is selected
  const dailyDetail = useMemo(() => {
    if (!isHistorical || !selectedDayNum) return null;
    const all = dailyCitas(selectedMonth);
    return all[selectedDayNum - 1];
  }, [isHistorical, selectedMonth, selectedDayNum]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-20 border-b px-6 py-3 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.85)", borderColor: CARD_BORDER, backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${TEAL}20` }}
          >
            <School size={15} style={{ color: TEAL }} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-700">EduBot</span>
            <span className="text-[11px] font-mono text-slate-500 ml-2">
              Tablero de Control
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>
              <span style={{ color: TEAL }}>■ </span>Histórico Jul–Set
            </span>
            <span>
              <span style={{ color: VIOLET }}>■ </span>Proyección IA Oct–Dic
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-500">activo</span>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto space-y-6">
        {/* ── Filters ── */}
        <div
          className="rounded-xl border p-4 flex flex-wrap items-end gap-4"
          style={{ background: CARD_BG, borderColor: CARD_BORDER }}
        >
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest self-end pb-2 mr-1">
            Filtros
          </p>
          <FilterSelect label="Año" value="2026" options={["2026"]} onChange={() => {}} />
          <FilterSelect
            label="Mes"
            value={selectedMonth}
            options={["Todos", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]}
            onChange={(v) => {
              setSelectedMonth(v);
              setSelectedDay("Todos");
            }}
          />
          <FilterSelect
            label="Día"
            value={selectedDay}
            options={dayOptions}
            onChange={setSelectedDay}
            disabled={!isHistorical}
          />

          {dailyDetail && (
            <div
              className="ml-auto flex items-center gap-3 rounded-xl border px-4 py-2 text-xs font-mono"
              style={{ borderColor: `${TEAL}40`, background: `${TEAL}08` }}
            >
              <Activity size={13} style={{ color: TEAL }} />
              <span className="text-slate-500">
                {selectedMonth} · {selectedDay}:
              </span>
              <span style={{ color: TEAL }} className="font-semibold">
                {dailyDetail.citas} citas
              </span>
            </div>
          )}

          {isPredictive && (
            <div
              className="ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-mono"
              style={{ borderColor: `${VIOLET}40`, background: `${VIOLET}10`, color: VIOLET }}
            >
              <Brain size={11} />
              Mostrando datos predictivos · {selectedMonth} 2026
            </div>
          )}

          {isFiltered && (
            <button
              onClick={() => {
                setSelectedMonth("Todos");
                setSelectedDay("Todos");
              }}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            icon={<School size={14} />}
            title="Licencias activas"
            value={String(kpi.lic)}
            sub={
              kpi.isAI
                ? `Colegios proyectados · ${selectedMonth} 2026`
                : isHistorical
                ? `Colegios con licencia SaaS · ${selectedMonth}`
                : "Colegios al cierre de Set 2026"
            }
            color={TEAL}
            isAI={kpi.isAI}
          />
          <KPICard
            icon={<Megaphone size={14} />}
            title="Publicidad / difusión"
            value={`S/ ${kpi.pub.toLocaleString("es-PE")}`}
            sub={
              kpi.isAI
                ? `Inversión proyectada · ${selectedMonth} 2026`
                : isHistorical
                ? `Invertido en ${selectedMonth} 2026`
                : "Acumulado Jul–Set 2026"
            }
            color={AMBER}
            isAI={kpi.isAI}
          />
          <KPICard
            icon={<DollarSign size={14} />}
            title="Ingreso"
            value={`S/ ${kpi.ing.toLocaleString("es-PE")}`}
            sub={
              kpi.isAI
                ? `Ingreso mensual proyectado · ${selectedMonth} 2026`
                : isHistorical
                ? `Ingreso mensual · ${selectedMonth} 2026`
                : "Ingreso acumulado Jul–Set 2026"
            }
            color={VIOLET}
            isAI={kpi.isAI}
          />
        </div>

        {/* ── Descriptive Section ── */}
        {!isPredictive && (
          <section>
            <SectionHeader
              icon={<TrendingUp size={16} />}
              title="Analítica Descriptiva"
              subtitle={
                isHistorical
                  ? `${selectedMonth} 2026 · Datos históricos reales`
                  : "Jul · Ago · Set 2026 · Datos históricos reales"
              }
              color={TEAL}
              badge={
                <div
                  className="hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono"
                  style={{ borderColor: `${TEAL}30`, background: `${TEAL}08`, color: TEAL }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} />
                  Datos reales verificados
                </div>
              }
            />

            {/* Row 1: 3 charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Chart 1: Bar */}
              <ChartCard
                title={
                  isHistorical
                    ? `Citas por día hábil — ${selectedMonth} 2026`
                    : "Colegios nuevos captados por mes"
                }
              >
                <ResponsiveContainer width="100%" height={175}>
                  {isHistorical ? (
                    <BarChart
                      data={barData}
                      margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis
                        dataKey="dia"
                        tick={{ fontSize: 9, fill: AXIS, fontFamily: "JetBrains Mono" }}
                        interval={3}
                      />
                      <YAxis tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }} />
                      <Tooltip content={<ChartTooltip suffix=" citas" />} />
                      <Bar dataKey="citas" name="Citas" radius={[2, 2, 0, 0]}>
                        {(barData as { dia: string; citas: number }[]).map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              selectedDayNum === i + 1 ? VIOLET : selectedDayNum ? `${TEAL}40` : TEAL
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <BarChart
                      data={colegiosNuevosData}
                      margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 11, fill: AXIS, fontFamily: "JetBrains Mono" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }}
                        allowDecimals={false}
                        domain={[0, 2]}
                      />
                      <Tooltip content={<ChartTooltip suffix=" colegios" />} />
                      <Bar dataKey="colegios" name="Colegios" radius={[4, 4, 0, 0]}>
                        {colegiosNuevosData.map((entry, i) => (
                          <Cell key={i} fill={getBarFill(entry.mes)} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 2: Line */}
              <ChartCard title="Evolución del ingreso acumulado (S/)">
                <ResponsiveContainer width="100%" height={175}>
                  <LineChart
                    data={ingresoAcumData}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 11, fill: AXIS, fontFamily: "JetBrains Mono" }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }} />
                    <Tooltip content={<ChartTooltip prefix="S/ " />} />
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={TEAL} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={TEAL} />
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="ingreso"
                      name="S/ acum."
                      stroke={TEAL}
                      strokeWidth={2}
                      dot={(props: { cx: number; cy: number; payload: { mes: string } }) => {
                        const { cx, cy, payload } = props;
                        const active = isFiltered && selectedMonth === payload.mes;
                        return (
                          <circle
                            key={payload.mes}
                            cx={cx}
                            cy={cy}
                            r={active ? 6 : 4}
                            fill={active ? TEAL : CARD_BG}
                            stroke={TEAL}
                            strokeWidth={2}
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 3: Pie */}
              <ChartCard title="Distribución de citas por motivo">
                <div className="flex items-center gap-2">
                  <ResponsiveContainer width="50%" height={175}>
                    <PieChart>
                      <Pie
                        data={citasPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        dataKey="value"
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {citasPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as typeof citasPieData[0];
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono shadow-xl">
                              <p style={{ color: d.color }}>{d.name}</p>
                              <p className="text-slate-700 mt-0.5">
                                {d.value} citas · {d.pct}%
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2.5 text-xs flex-1">
                    {citasPieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: d.color }}
                        />
                        <span className="text-slate-500 text-[12px] truncate">{d.name}</span>
                        <span
                          className="font-mono text-[12px] ml-auto font-semibold"
                          style={{ color: d.color }}
                        >
                          {d.pct}%
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] font-mono text-slate-500 mt-1 border-t border-slate-100 pt-2">
                      Total: 188 citas · Jul–Set
                    </p>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Row 2: 2 charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chart 4: Scatter */}
              <ChartCard title="Citas gestionadas vs. satisfacción del padre (CSAT 1–5)">
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis
                      dataKey="citas"
                      type="number"
                      name="Citas"
                      domain={[0, 160]}
                      tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }}
                      label={{
                        value: "Citas gestionadas",
                        position: "insideBottom",
                        offset: -12,
                        fontSize: 10,
                        fill: AXIS,
                        fontFamily: "JetBrains Mono",
                      }}
                    />
                    <YAxis
                      dataKey="csat"
                      type="number"
                      name="CSAT"
                      domain={[3.5, 5]}
                      tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }}
                      label={{
                        value: "CSAT",
                        angle: -90,
                        position: "insideLeft",
                        offset: 20,
                        fontSize: 10,
                        fill: AXIS,
                        fontFamily: "JetBrains Mono",
                      }}
                    />
                    <ZAxis range={[55, 55]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3", stroke: GRID }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { citas: number; csat: number; nombre?: string };
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono shadow-xl">
                            <p className="text-slate-500 mb-1">{d.nombre ?? "Colegio proyectado*"}</p>
                            <p className="text-slate-700">Citas: {d.citas}</p>
                            <p className="text-slate-700">CSAT: {d.csat}</p>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={scatterGhost} fill={`${TEAL}25`} stroke={`${TEAL}40`} strokeWidth={1} />
                    <Scatter data={scatterReal} fill={TEAL} stroke={TEAL} strokeWidth={2} />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-[10px] font-mono text-slate-500">
                  * Puntos translúcidos = adopción proyectada Oct–Dic
                </p>
              </ChartCard>

              {/* Chart 5: Horizontal bars */}
              <ChartCard title="Ranking de colegios por citas gestionadas">
                <div className="flex flex-col gap-5 py-3">
                  {rankingData.map((r, i) => (
                    <div key={r.nombre} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-[11px] w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: `${TEAL}18`, color: TEAL }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-slate-700 text-[12px]">{r.nombre}</span>
                        </div>
                        <span className="font-mono font-semibold" style={{ color: TEAL }}>
                          {r.citas}
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.06)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(r.citas / 188) * 100}%`,
                            background: `linear-gradient(90deg, ${TEAL}cc, ${TEAL})`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-slate-500">
                        {Math.round((r.citas / 188) * 100)}% del total · Jul–Set 2026
                      </p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs font-mono border-t border-slate-100 pt-4 mt-1">
                    <span className="text-slate-500">Total acumulado Jul–Set</span>
                    <span className="font-semibold" style={{ color: TEAL }}>
                      188 citas
                    </span>
                  </div>
                </div>
              </ChartCard>
            </div>
          </section>
        )}

        {/* ── Predictive Section ── */}
        <section>
          <SectionHeader
            icon={<Brain size={16} />}
            title="Proyección IA"
            subtitle="Oct · Nov · Dic 2026 · Simulación predictiva con rango de confianza"
            color={VIOLET}
            badge={
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono"
                style={{ borderColor: `${VIOLET}40`, background: `${VIOLET}10`, color: VIOLET }}
              >
                <Brain size={10} />
                IA · Modelo de Negocio Integrado
              </div>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Pred 1: Colegios */}
            <ChartCard title="Colegios activos proyectados">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                  data={predColegiosData}
                  margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: AXIS, fontFamily: "JetBrains Mono" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip suffix=" colegios" />} />
                  <ReferenceLine
                    x="Set"
                    stroke="rgba(15,23,42,0.15)"
                    strokeDasharray="4 3"
                    label={{ value: "▶ IA", position: "top", fontSize: 9, fill: VIOLET, fontFamily: "JetBrains Mono" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="band"
                    stroke="none"
                    fillOpacity={0}
                    connectNulls={false}
                    legendType="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="band"
                    stackId="band"
                    stroke="none"
                    fill={VIOLET_DIM}
                    name="Rango"
                    connectNulls={false}
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke={TEAL}
                    strokeWidth={2}
                    name="Real"
                    dot={{ fill: TEAL, r: 4, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proj"
                    stroke={VIOLET}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    name="Proyección"
                    dot={{ fill: VIOLET, r: 4, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <PredLegend />
            </ChartCard>

            {/* Pred 2: Ingreso */}
            <ChartCard title="Ingreso mensual proyectado (S/)">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                  data={predIngresoData}
                  margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: AXIS, fontFamily: "JetBrains Mono" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }} />
                  <Tooltip content={<ChartTooltip prefix="S/ " />} />
                  <ReferenceLine
                    x="Set"
                    stroke="rgba(15,23,42,0.15)"
                    strokeDasharray="4 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="band"
                    stroke="none"
                    fillOpacity={0}
                    connectNulls={false}
                    legendType="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="band"
                    stackId="band"
                    stroke="none"
                    fill={VIOLET_DIM}
                    name="Rango"
                    connectNulls={false}
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke={TEAL}
                    strokeWidth={2}
                    name="Real"
                    dot={{ fill: TEAL, r: 4, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proj"
                    stroke={VIOLET}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    name="Proyección"
                    dot={{ fill: VIOLET, r: 4, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <PredLegend />
            </ChartCard>

            {/* Pred 3: Publicidad */}
            <ChartCard title="Inversión en publicidad proyectada (S/)">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                  data={predPublicidadData}
                  margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: AXIS, fontFamily: "JetBrains Mono" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: AXIS, fontFamily: "JetBrains Mono" }} />
                  <Tooltip content={<ChartTooltip prefix="S/ " />} />
                  <ReferenceLine
                    x="Set"
                    stroke="rgba(15,23,42,0.15)"
                    strokeDasharray="4 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="band"
                    stroke="none"
                    fillOpacity={0}
                    connectNulls={false}
                    legendType="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="band"
                    stackId="band"
                    stroke="none"
                    fill={VIOLET_DIM}
                    name="Rango"
                    connectNulls={false}
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke={AMBER}
                    strokeWidth={2}
                    name="Real"
                    dot={{ fill: AMBER, r: 4, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proj"
                    stroke={VIOLET}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    name="Proyección"
                    dot={{ fill: VIOLET, r: 4, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <PredLegend realColor={AMBER} />
            </ChartCard>
          </div>

          {/* Summary table */}
          <div
            className="rounded-xl border p-5"
            style={{ background: CARD_BG, borderColor: CARD_BORDER }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={13} style={{ color: VIOLET }} />
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                Resumen proyección IA · Oct–Dic 2026
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "Mes",
                      "Colegios activos",
                      "Rango confianza",
                      "Ingreso mensual",
                      "Inversión publi.",
                      "Ingreso acum.",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left pb-3 pr-6 text-slate-500 font-medium text-[11px] uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { mes: "Octubre", col: 3, rango: "2 – 4", ing: 624, pub: 300, acum: 1456 },
                    { mes: "Noviembre", col: 5, rango: "4 – 6", ing: 1040, pub: 450, acum: 2496 },
                    { mes: "Diciembre", col: 6, rango: "5 – 8", ing: 1248, pub: 450, acum: 3744 },
                  ].map((row, i) => (
                    <tr
                      key={row.mes}
                      className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50"
                    >
                      <td className="py-3 pr-6 text-slate-700">{row.mes}</td>
                      <td className="py-3 pr-6 font-semibold" style={{ color: VIOLET }}>
                        {row.col}
                      </td>
                      <td className="py-3 pr-6 text-slate-500">{row.rango}</td>
                      <td className="py-3 pr-6" style={{ color: TEAL }}>
                        S/ {row.ing.toLocaleString("es-PE")}
                      </td>
                      <td className="py-3 pr-6" style={{ color: AMBER }}>
                        S/ {row.pub.toLocaleString("es-PE")}
                      </td>
                      <td className="py-3 pr-6 font-semibold" style={{ color: TEAL }}>
                        S/ {row.acum.toLocaleString("es-PE")}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200">
                    <td className="pt-4 text-slate-500 font-semibold">Total Oct–Dic</td>
                    <td className="pt-4" />
                    <td className="pt-4" />
                    <td className="pt-4 font-semibold" style={{ color: TEAL }}>
                      S/ 2,912
                    </td>
                    <td className="pt-4 font-semibold" style={{ color: AMBER }}>
                      S/ 1,200
                    </td>
                    <td className="pt-4 font-semibold text-slate-700">S/ 3,744</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-4 border-t border-slate-100 pt-4">
          <span>EduBot · Tablero de Control · Jul–Dic 2026</span>
          <span>Datos: Modelo de Negocio Integrado · Tabla 16 · HU001</span>
        </footer>
      </main>
    </div>
  );
}