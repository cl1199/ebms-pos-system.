export default function InventoryTable({ inventory, onAdjust, onTransfer }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-slate-200 border-separate border-spacing-y-2">
        <thead>
          <tr className="text-slate-400 text-xs uppercase tracking-wide">
            <th className="text-left px-2">Producto</th>
            <th className="text-center px-2">Stock</th>
            <th className="text-center px-2">Mínimo</th>
            <th className="text-center px-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((item) => (
            <tr
              key={item.id}
              className="bg-slate-900/60 border border-white/10 rounded-xl"
            >
              <td className="px-3 py-2 rounded-l-xl">{item.productName}</td>

              <td
                className={`px-3 py-2 text-center font-semibold ${
                  item.quantity <= item.minStock
                    ? "text-amber-300"
                    : "text-emerald-300"
                }`}
              >
                {item.quantity}
              </td>

              <td className="px-3 py-2 text-center text-slate-300">
                {item.minStock}
              </td>

              <td className="px-3 py-2 rounded-r-xl flex gap-2 justify-center">
                <button
                  onClick={() => onAdjust(item)}
                  className="px-2 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  Ajustar
                </button>
                <button
                  onClick={() => onTransfer(item)}
                  className="px-2 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 transition"
                >
                  Transferir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {inventory.length === 0 && (
        <p className="text-slate-400 text-xs mt-3">No hay inventario para esta barra.</p>
      )}
    </div>
  );
}