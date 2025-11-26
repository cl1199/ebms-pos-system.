// src/pages/AdminProducts.jsx
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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // estado del formulario
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    unit: "",
  });

  const [message, setMessage] = useState(null);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: "",
      price: "",
      cost: "",
      unit: "",
    });
  };

 // ─────────────────────────────
// Cargar productos (versión PRO con normalización)
// ─────────────────────────────
const loadProducts = async () => {
  try {
    setLoading(true);
    const res = await axios.get("/api/products");

    // Normalización universal
    const list =
      Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.products)
        ? res.data.products
        : [];

    setProducts(list);
  } catch (err) {
    console.error("Error cargando productos:", err);
    setMessage({
      type: "error",
      text: "Error al cargar productos.",
    });
  } finally {
    setLoading(false);
  }
};

  // ─────────────────────────────
  // Manejo de cambios de formulario
  // ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ─────────────────────────────
  // Crear / Actualizar producto
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      price: Number(form.price),
      cost: Number(form.cost),
      unit: form.unit.trim(),
    };

    if (!payload.name || !payload.unit || isNaN(payload.price)) {
      setMessage({
        type: "error",
        text: "Nombre, precio y unidad son obligatorios.",
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/products/${editingId}`, payload);
        setMessage({ type: "success", text: "Producto actualizado correctamente." });
      } else {
        await axios.post("/api/products", payload);
        setMessage({ type: "success", text: "Producto creado correctamente." });
      }

      resetForm();
      loadProducts();
    } catch (err) {
      console.error("Error guardando producto:", err);
      setMessage({
        type: "error",
        text: "Error al guardar el producto.",
      });
    }
  };

  // ─────────────────────────────
  // Editar producto
  // ─────────────────────────────
  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      cost: String(product.cost ?? ""),
      unit: product.unit || "",
    });
  };

  // ─────────────────────────────
  // Eliminar producto
  // ─────────────────────────────
  const handleDelete = async (id) => {
    const ok = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!ok) return;

    try {
      await axios.delete(`/api/products/${id}`);
      setMessage({ type: "success", text: "Producto eliminado." });
      // filtramos localmente para respuesta más rápida
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      setMessage({
        type: "error",
        text: "Error al eliminar el producto.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Administración de productos</CardTitle>
          <CardDescription>
            Crea, edita y elimina productos que estarán disponibles en el POS.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Formulario */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">
            {editingId ? "Editar producto" : "Nuevo producto"}
          </CardTitle>
          <CardDescription className="text-xs">
            Completa los datos y guarda los cambios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                placeholder="Vodka Stolichnaya"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Categoría
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                placeholder="Shots, Botellas, Mixers..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Precio (Q) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Costo (Q)
              </label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Unidad *
              </label>
              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                placeholder="unidad, shot, botella..."
              />
            </div>

            <div className="flex gap-2 md:col-span-5 md:justify-end">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs"
                  onClick={resetForm}
                >
                  Cancelar edición
                </Button>
              )}
              <Button type="submit" className="text-xs">
                {editingId ? "Guardar cambios" : "Crear producto"}
              </Button>
            </div>
          </form>

          {message && (
            <p
              className={`mt-3 text-xs ${
                message.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">Listado de productos</CardTitle>
          <CardDescription className="text-xs">
            {loading
              ? "Cargando productos..."
              : `Total: ${products.length} producto(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 && !loading ? (
            <p className="text-xs text-slate-500">
              No hay productos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    <th className="text-left p-2 border-b border-slate-200 dark:border-slate-800">
                      ID
                    </th>
                    <th className="text-left p-2 border-b border-slate-200 dark:border-slate-800">
                      Nombre
                    </th>
                    <th className="text-left p-2 border-b border-slate-200 dark:border-slate-800">
                      Categoría
                    </th>
                    <th className="text-right p-2 border-b border-slate-200 dark:border-slate-800">
                      Precio (Q)
                    </th>
                    <th className="text-right p-2 border-b border-slate-200 dark:border-slate-800">
                      Costo (Q)
                    </th>
                    <th className="text-left p-2 border-b border-slate-200 dark:border-slate-800">
                      Unidad
                    </th>
                    <th className="text-right p-2 border-b border-slate-200 dark:border-slate-800">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/60"
                    >
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {p.id}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {p.name}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {p.category || "-"}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800 text-right">
                        {p.price != null ? `Q ${p.price.toFixed(2)}` : "-"}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800 text-right">
                        {p.cost != null ? `Q ${p.cost.toFixed(2)}` : "-"}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {p.unit}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => handleEdit(p)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                             className="h-7 px-2 text-[11px] bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            onClick={() => handleDelete(p.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}