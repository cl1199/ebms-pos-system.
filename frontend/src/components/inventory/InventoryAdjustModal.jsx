import { useState } from "react";
import axios from "axios";

export default function InventoryAdjustModal({ item, onClose, onSubmit }) {
  const [qty, setQty] = useState("");
  const [type, setType] = useState("ENTRY");
  const [reason, setReason] = useState("");

  const submit = async () => {
    await axios.post("/api/pos/inventory/adjust", {
      eventId: item.eventId,
      barId: item.barId,
      productId: item.productId,
      quantity: Number(qty),
      type,
      userId: 1, // cambiar por usuario real
      reason
    });

    onSubmit();
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Ajustar Inventario</h2>

        <p className="font-medium mb-2">{item.productName}</p>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Cantidad"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="ENTRY">Entrada</option>
          <option value="EXIT">Salida</option>
          <option value="LOSS">Merma</option>
          <option value="CORRECTION">Corrección</option>
        </select>

        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Razón"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-300" onClick={onClose}>Cancelar</button>
          <button className="px-3 py-1 bg-blue-600 text-white" onClick={submit}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
