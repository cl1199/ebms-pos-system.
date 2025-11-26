export default function InventoryTimeline({ history }) {
  return (
    <div className="space-y-3">
      {history.length === 0 && (
        <p className="text-slate-400 text-xs">No hay movimientos registrados.</p>
      )}

      {history.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-2xl bg-slate-900/50 border border-white/10 p-3 shadow-xl"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />

          <div className="flex-1">
            <p className="text-slate-200 text-sm">
              {item.description}
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              {new Date(item.createdAt).toLocaleString("es-GT")}
            </p>
          </div>

          <span className="text-xs text-emerald-300 font-semibold">
            {item.quantity > 0 ? "+" : ""}
            {item.quantity}
          </span>
        </div>
      ))}
    </div>
  );
}