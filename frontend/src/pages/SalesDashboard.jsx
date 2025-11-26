// src/pages/SalesDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import {
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCcw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PRODUCT_COLORS = ["#22c55e", "#0ea5e9", "#a855f7", "#f97316", "#e11d48", "#eab308"];

export default function SalesDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  const [salesByBar, setSalesByBar] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [message, setMessage] = useState(null);

  // ─────────────────────────────
  // Cargar lista de eventos
  // ─────────────────────────────
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await axios.get("/api/events");
      // backend envía: { events: [...] }
      const list = res.data?.events || [];
      setEvents(list);

      if (list.length > 0 && !selectedEventId) {
        setSelectedEventId(String(list[0].id));
      }
    } catch (err) {
      console.error("Error cargando eventos:", err);
      setMessage({
        type: "error",
        text: "Error al cargar eventos disponibles.",
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────
  // Cargar reportes de un evento
  // ─────────────────────────────
  const loadReports = async (eventId) => {
    if (!eventId) return;

    try {
      setLoadingReports(true);
      setMessage(null);

      const [barsRes, productsRes, totalRes] = await Promise.all([
        axios.get(`/api/reports/sales-by-bar/${eventId}`),
        axios.get(`/api/reports/top-products/${eventId}`),
        axios.get(`/api/reports/event-total/${eventId}`),
      ]);

      setSalesByBar(barsRes.data?.results || []);
      setTopProducts(productsRes.data?.results || []);
      setSummary(totalRes.data || null);

      if (!totalRes.data || (totalRes.data.total || 0) === 0) {
        setMessage({
          type: "info",
          text: "Este evento aún no tiene ventas registradas.",
        });
      }
    } catch (err) {
      console.error("Error cargando reportes:", err);
      setMessage({
        type: "error",
        text: "Error al cargar reportes del evento.",
      });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadReports(Number(selectedEventId));
    }
  }, [selectedEventId]);

  const currentEvent = events.find(
    (ev) => String(ev.id) === String(selectedEventId)
  );

  const totalAmount = summary?.total || 0;
  const totalTickets = summary?.tickets || 0;
  const avgTicket = totalTickets > 0 ? totalAmount / totalTickets : 0;

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="space-y-6">
      {/* Encabezado y selector de evento */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              Reportes de ventas
            </CardTitle>
            <CardDescription className="text-sm">
              Visualiza el rendimiento por barra, los productos más vendidos
              y el resumen global de cada evento.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 mb-1">
                Evento seleccionado
              </span>
              <Select
                value={selectedEventId}
                onValueChange={(v) => setSelectedEventId(v)}
                disabled={loadingEvents}
              >
                <SelectTrigger className="w-56">
                  <SelectValue
                    placeholder={
                      loadingEvents
                        ? "Cargando eventos..."
                        : "Selecciona un evento"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={String(ev.id)}>
                      {ev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                loadEvents();
                if (selectedEventId) {
                  loadReports(Number(selectedEventId));
                }
              }}
              disabled={loadingReports || loadingEvents}
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Total vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              Q {totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Suma de todas las ventas del evento.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Tickets emitidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              {totalTickets}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Número total de ventas registradas.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Ticket promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              Q {avgTicket.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total vendido / número de tickets.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Layout principal: gráfico barras + dona + tablas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Ventas por barra */}
        <Card className="xl:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Ventas por barra
              </CardTitle>
              <CardDescription className="text-xs">
                Total vendido y número de tickets por barra.
              </CardDescription>
            </div>
            {currentEvent && (
              <Badge variant="outline" className="text-[11px]">
                {currentEvent.name}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="h-72">
            {salesByBar.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No hay ventas registradas para este evento.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByBar} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <XAxis
                    dataKey="barName"
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "totalSales") {
                        return [`Q ${Number(value).toFixed(2)}`, "Total vendido"];
                      }
                      if (name === "tickets") {
                        return [value, "Tickets"];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Barra: ${label}`}
                  />
                  <Bar
                    dataKey="totalSales"
                    name="Total vendido"
                    radius={[4, 4, 0, 0]}
                    fill="#0f766e"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Productos más vendidos
              </CardTitle>
              <CardDescription className="text-xs">
                Unidades vendidas por producto.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="h-56">
              {topProducts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No hay productos vendidos aún.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      dataKey="totalUnits"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {topProducts.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.productId}`}
                          fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} unidades`, "Cantidad"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Listado compacto de productos */}
            <ScrollArea className="h-32 border rounded-md">
              <div className="p-2 space-y-1">
                {topProducts.map((p, idx) => (
                  <div
                    key={p.productId}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            PRODUCT_COLORS[idx % PRODUCT_COLORS.length],
                        }}
                      />
                      <span className="truncate max-w-[140px]">
                        {p.name}
                      </span>
                    </div>
                    <span className="font-medium">
                      {p.totalUnits} u.
                    </span>
                  </div>
                ))}

                {topProducts.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    Sin datos por mostrar.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <Card className="border-slate-200">
          <CardContent className="py-3">
            <p
              className={`text-xs ${
                message.type === "error"
                  ? "text-red-600"
                  : message.type === "info"
                  ? "text-slate-600"
                  : "text-emerald-600"
              }`}
            >
              {message.text}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}