// src/pages/EventDashboard.jsx
import { useEffect, useState } from "react";
import api from "@/services/axios";
import {
  BarChart2,
  Activity,
  AlertTriangle,
  ShoppingBag,
  Loader2,
} from "lucide-react";

export default function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [error, setError] = useState("");

  // Datos del dashboard
  const [summary, setSummary] = useState(null);
  const [byBar, setByBar] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [criticalInventory, setCriticalInventory] = useState([]);

  // ============================
  // Cargar eventos al inicio
  // ============================
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/events");
        const list = res.data?.events || [];
        setEvents(list);

        if (list.length > 0) setSelectedEventId(String(list[0].id));
      } catch (err) {
        console.error("Error cargando eventos:", err);
        setError("No se pudieron cargar los eventos.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // ============================
  // Cargar datos del evento
  // ============================
  useEffect(() => {
    if (!selectedEventId) return;

    const loadEventData = async () => {
      try {
        setLoadingEventData(true);
        setError("");

        const eventId = Number(selectedEventId);

        const [summaryRes, byBarRes, topRes, criticalRes] = await Promise.all([
          api.get(`/reports/sales/summary?eventId=${eventId}`),
          api.get(`/reports/sales/by-bar?eventId=${eventId}`),
          api.get(`/reports/sales/top-products?eventId=${eventId}`),
          api.get(`/reports/inventory/critical?eventId=${eventId}`),
        ]);

        setSummary(summaryRes.data || null);
        setByBar(byBarRes.data || []);
        setTopProducts(topRes.data || []);
        setCriticalInventory(criticalRes.data || []);
      } catch (err) {
        console.error("Error cargando datos de evento:", err);
        setError(
          err.response?.data?.error ||
            "No se pudo cargar la información del evento."
        );
      } finally {
        setLoadingEventData(false);
      }
    };

    loadEventData();
  }, [selectedEventId]);

  const selectedEvent =
    events.find((e) => String(e.id) === String(selectedEventId)) || null;

  const formatCurrency = (n) =>
    typeof n === "number"
      ? n.toLocaleString("es-GT", { minimumFractionDigits: 2 })
      : "-";

  const formatInt = (n) =>
    typeof n === "number" ? n.toLocaleString("es-GT") : "-";

  // Para las barras pseudo-gráficas
  const maxBarTotal = Math.max(...byBar.map((b) => b.total || b.totalSales || 0), 1);
  const maxQty = Math.max(...topProducts.map((p) => p.totalQty || 0), 1);

  return (
    <div className="relative min-h-full w-full overflow-hidden">

      {/* Fondo premium */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 p-4 md:p-6 space-y-6 text-slate-100">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
              Dashboard del Evento
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitorea ventas, productos y stock en tiempo real.
            </p>
          </div>

          {/* Selector de evento */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-xs text-slate-400">Evento seleccionado</span>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl px-3 py-2 shadow-lg">
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando...
                </div>
              ) : (
                <select
                  className="bg-transparent text-sm text-slate-50 outline-none border-none pr-6 appearance-none cursor-pointer"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  {events.map((ev) => (
                    <option
                      key={ev.id}
                      value={ev.id}
                      className="bg-slate-900 text-slate-50"
                    >
                      {ev.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-400/40 text-red-200 px-4 py-3 text-xs">
            {error}
          </div>
        )}

        {/* MÉTRICAS PRINCIPALES */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<BarChart2 className="w-5 h-5 text-emerald-300" />}
            label="Ventas totales"
            value={`Q ${formatCurrency(summary?.totalSales)}`}
            subtitle="Monto vendido"
            loading={loadingEventData}
          />

          <MetricCard
            icon={<Activity className="w-5 h-5 text-sky-300" />}
            label="Tickets"
            value={formatInt(summary?.totalTickets)}
            subtitle="Transacciones registradas"
            loading={loadingEventData}
          />

          <MetricCard
            icon={<ShoppingBag className="w-5 h-5 text-violet-300" />}
            label="Ticket promedio"
            value={`Q ${formatCurrency(summary?.avgTicket)}`}
            subtitle="Promedio por venta"
            loading={loadingEventData}
          />

          <MetricCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-300" />}
            label="Productos en riesgo"
            value={formatInt(criticalInventory.length)}
            subtitle="Stock bajo"
            loading={loadingEventData}
          />
        </section>

        {/* GRÁFICAS Y LISTAS */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Ventas por barra */}
          <div className="xl:col-span-2 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-emerald-300" />
              Ventas por barra
            </h2>

            {byBar.length === 0 ? (
              <p className="text-xs text-slate-400">Aún no hay ventas</p>
            ) : (
              <div className="space-y-2">
                {byBar.map((bar) => {
                  const pct =
                    ((bar.total || bar.totalSales || 0) / maxBarTotal) * 100;

                  return (
                    <div key={bar.barId} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>{bar.barName}</span>
                        <span>Q {formatCurrency(bar.total || bar.totalSales)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900/70 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top productos */}
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-sky-300" />
              Top productos
            </h2>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400">Sin productos vendidos</p>
            ) : (
              <div className="space-y-2">
                {topProducts.slice(0, 5).map((p, idx) => {
                  const pct =
                    ((p.totalQty || p.totalUnits || 0) / maxQty) * 100;

                  return (
                    <div
                      key={p.productName}
                      className="flex flex-col gap-1 rounded-2xl bg-slate-950/40 border border-slate-800/60 px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px]">
                            {idx + 1}
                          </span>
                          {p.productName}
                        </span>
                        <span className="text-emerald-300 font-medium">
                          {formatInt(p.totalQty)}
                        </span>
                      </div>

                      <div className="h-1.5 rounded-full bg-slate-900/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Ventas</span>
                        <span>Q {formatCurrency(p.totalSales)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* INVENTARIO CRÍTICO */}
        <section>
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              Inventario en riesgo
            </h2>

            {criticalInventory.length === 0 ? (
              <p className="text-xs text-slate-400">Todo en orden</p>
            ) : (
              <table className="w-full text-[11px] text-slate-200 border-separate border-spacing-y-1">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left">Producto</th>
                    <th className="text-left">Barra</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalInventory.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-slate-950/60 border border-amber-500/30 rounded-xl"
                    >
                      <td className="px-2 py-2 rounded-l-xl">
                        {item.productName}
                      </td>
                      <td className="px-2 py-2">{item.barName}</td>
                      <td className="px-2 py-2 text-center text-red-300 font-semibold">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {item.minStock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// =====================================
// Tarjetas de métricas
// =====================================
function MetricCard({ icon, label, value, subtitle, loading }) {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl px-4 py-3 shadow-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center rounded-full bg-slate-900/70 border border-slate-700/70 p-2">
          {icon}
        </span>
        {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-xl font-semibold text-slate-50">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}