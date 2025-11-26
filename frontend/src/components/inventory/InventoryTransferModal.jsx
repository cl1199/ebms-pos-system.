import { useState } from "react";
import axios from "axios";

export default function InventoryTransferModal({ item, bars, onClose, onSubmit }) {
  const [toBar, setToBar] = useState("");
  const [qty, setQty] = useState("");

  const submit = async () => {
    await axios.post("/api/pos/inventory/transfer", {
      eventId: item.eventId,
      fromBarId: item.barId,
      toBarId: Number(toBar),
      productId: item.productId,
      quantity: Number(qty),
      userId: 1,
      reason: "Transferencia manual"
    });

    onSubmit();
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Transferir Producto</h2>

        <p className="font-medium mb-2">{item.productName}</p>

        <select
          className="border p-2 w-full mb-2"
          value={toBar}
          onChange={(e) => setToBar(e.target.value)}
        >
          <option value="">Seleccionar barra destino</option>
          {bars.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Cantidad"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-300" onClick={onClose}>Cancelar</button>
          <button className="px-3 py-1 bg-purple-600 text-white" onClick={submit}>Transferir</button>
        </div>
      </div>
    </div>
  );
}
