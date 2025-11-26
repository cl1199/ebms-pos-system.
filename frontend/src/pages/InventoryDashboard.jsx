import { useEffect, useState } from "react";
import api from "@/services/axios";

import InventoryCard from "../components/inventory/InventoryCard";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryTimeline from "../components/inventory/InventoryTimeline";
import InventoryAdjustModal from "../components/inventory/InventoryAdjustModal";
import InventoryTransferModal from "../components/inventory/InventoryTransferModal";

export default function InventoryDashboard() {
  const eventId = 1; // temporal — luego lo conectamos con selector
  const [barId, setBarId] = useState(1);

  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [bars, setBars] = useState([]);

  const [adjustItem, setAdjustItem] = useState(null);
  const [transferItem, setTransferItem] = useState(null);

  // ==============================
  // 🔥 CARGA DE DATOS
  // ==============================
  const loadData = async () => {
    try {
      // 1) INVENTARIO DE LA BARRA
      const inv = await api.get(`/pos/inventory/bar/${eventId}/${barId}`);
      setInventory(inv.data?.inventory || []);

      // 2) INVENTARIO CRÍTICO (nuevo endpoint)
      const low = await api.get(`/reports/inventory/critical?eventId=${eventId}`);
      setLowStock(low.data || []);

      // 3) HISTORIAL DE MOVIMIENTOS
      const hist = await api.get(`/pos/inventory/history/${eventId}/${barId}`);
      setHistory(hist.data?.history || []);

      // 4) LISTA DE BARRAS POR EVENTO
      const barsRes = await api.get(`/bars/event/${eventId}`);
      setBars(barsRes.data?.bars || []);

    } catch (err) {
      console.error("Error cargando inventario:", err);
      setInventory([]);
      setLowStock([]);
      setHistory([]);
      setBars([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [barId]);

  return (
    <div className="p-6 space-y-6 text-slate-100">

      {/* TÍTULO */}
      <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-blue-300 to-sky-400 text-transparent bg-clip-text drop-shadow-lg">
        Inventario en Vivo
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InventoryCard
          title="Productos Totales"
          value={inventory?.length || 0}
          color="from-blue-500 to-sky-400"
        />

        <InventoryCard
          title="Stock Bajo"
          value={lowStock?.length || 0}
          color="from-amber-500 to-yellow-400"
        />

        <InventoryCard
          title="Agotados"
          value={(inventory || []).filter((i) => i.quantity === 0).length}
          color="from-red-500 to-pink-500"
        />
      </div>

      {/* SELECTOR DE BARRA */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 tracking-wider">
          Barra seleccionada
        </label>
        <select
          className="w-full md:w-64 bg-white/5 border border-white/10 backdrop-blur-xl 
                     rounded-2xl px-3 py-2 text-slate-100 shadow-xl
                     focus:ring-2 focus:ring-blue-500/50 outline-none"
          value={barId}
          onChange={(e) => setBarId(e.target.value)}
        >
          {(bars || []).map((b) => (
            <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLA */}
      <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">
          Inventario actual
        </h2>
        <InventoryTable
          inventory={inventory || []}
          onAdjust={(item) => setAdjustItem(item)}
          onTransfer={(item) => setTransferItem(item)}
        />
      </div>

      {/* TIMELINE */}
      <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">
          Movimientos recientes
        </h2>
        <InventoryTimeline history={history || []} />
      </div>

      {/* MODALES */}
      <InventoryAdjustModal
        item={adjustItem}
        onClose={() => setAdjustItem(null)}
        onSubmit={() => {
          setAdjustItem(null);
          loadData();
        }}
      />

      <InventoryTransferModal
        item={transferItem}
        bars={bars || []}
        onClose={() => setTransferItem(null)}
        onSubmit={() => {
          setTransferItem(null);
          loadData();
        }}
      />
    </div>
  );
}