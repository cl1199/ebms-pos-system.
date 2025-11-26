// src/pages/POSPage.jsx
import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, Minus, Plus, RefreshCcw } from "lucide-react";

import api from "@/services/axios";
import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function POSPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [event, setEvent] = useState(null);
  const [bar, setBar] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [cart, setCart] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // ─────────────────────────────
  // CARGA DE DATOS: asignación + productos
  // ─────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const [assignRes, prodRes] = await Promise.all([
        api.get("/api/assignments/my-bar"),
        api.get("/api/products"),
      ]);

      // Asignación de barra/evento
      if (!assignRes.data?.bar) {
        setBar(null);
        setEvent(assignRes.data?.event || null);
        setMessage({
          type: "error",
          text: "No tienes una barra asignada para el evento activo. Pide a un administrador que te asigne.",
        });
      } else {
        setBar(assignRes.data.bar);
        setEvent(assignRes.data.event || null);
      }

      // Productos (acepta tanto { products: [] } como un array directo)
      const prodData = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data?.products || [];
      setProducts(prodData);
    } catch (err) {
      console.error("Error cargando datos POS:", err);
      setMessage({
        type: "error",
        text: "Error al cargar productos o asignación de barra.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────
  // CATEGORÍAS
  // ─────────────────────────────
  const categories = [
    "ALL",
    ...Array.from(new Set(products.map((p) => p.category || "Otros"))),
  ];

  const filteredProducts =
    categoryFilter === "ALL"
      ? products
      : products.filter(
          (p) => (p.category || "Otros") === categoryFilter
        );

  // ─────────────────────────────
  // CARRITO
  // ─────────────────────────────
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const changeQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: Math.max(1, item.quantity + delta),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ─────────────────────────────
  // CONFIRMAR VENTA
  // ─────────────────────────────
  const handleSale = async () => {
    if (!event || !event.id) {
      setMessage({
        type: "error",
        text: "No hay evento activo para registrar la venta.",
      });
      return;
    }

    if (!bar || !bar.id) {
      setMessage({
        type: "error",
        text: "No tienes una barra asignada. No puedes registrar ventas.",
      });
      return;
    }

    if (cart.length === 0) {
      setMessage({
        type: "error",
        text: "El carrito está vacío.",
      });
      return;
    }

    try {
      setSending(true);
      setMessage(null);

      const payload = {
        eventId: event.id,
        barId: bar.id,
        userId: user?.id, // el backend también puede sacar esto del token, pero lo mandamos por compatibilidad
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await api.post("/api/pos/sale", payload);

      setMessage({
        type: "success",
        text: `Venta realizada. Ticket #${res.data.id} · Total Q ${res.data.total.toFixed(
          2
        )}`,
      });
      clearCart();
    } catch (err) {
      console.error("Error al crear venta:", err);
      const msg =
        err.response?.data?.error || "Error al procesar la venta.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSending(false);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-5rem)] bg-slate-50 p-4">
      {/* COLUMNA IZQUIERDA | PRODUCTOS */}
      <div className="flex-1 flex flex-col">
        {/* Header POS */}
        <Card className="mb-4 bg-white text-slate-900 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                Punto de Venta
              </CardTitle>
              <CardDescription className="text-slate-500">
                Tu barra se toma automáticamente de tu asignación.
              </CardDescription>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="text-xs text-slate-500">
                Evento actual:
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {event?.name || "Sin evento"}
                </Badge>
                <span className="text-[11px] text-slate-500">
                  Barra asignada:{" "}
                  <span className="font-semibold">
                    {bar?.name || "Ninguna"}
                  </span>
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-500">
              Cajero:{" "}
              <span className="font-semibold">
                {user?.name || user?.email || "Desconocido"}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
              onClick={loadData}
              disabled={sending || loading}
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Filtros de categoría */}
        <div className="flex gap-2 flex-wrap mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                categoryFilter === cat
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {cat === "ALL" ? "Todas" : cat}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <Card className="flex-1 bg-white border-slate-200 shadow-inner">
          <CardContent className="p-3 h-full">
            <ScrollArea className="h-full">
              {loading ? (
                <p className="text-xs text-slate-500">
                  Cargando productos...
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[11px] text-slate-500 mb-1">
                          {product.category || "Sin categoría"}
                        </div>
                        <div className="font-semibold text-sm truncate text-slate-800">
                          {product.name}
                        </div>
                      </div>
                      <div className="mt-3 text-emerald-700 font-bold text-base">
                        Q {product.price.toFixed(2)}
                      </div>
                    </button>
                  ))}

                  {filteredProducts.length === 0 && (
                    <p className="text-xs text-slate-500 col-span-full">
                      No hay productos para esta categoría.
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* COLUMNA DERECHA | CARRITO */}
      <Card className="w-full lg:w-96 bg-white border-slate-200 shadow-md flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-800">
              Carrito
            </CardTitle>
            <Badge
              variant="outline"
              className="text-xs border-slate-300 text-slate-600 bg-slate-50"
            >
              {bar?.name || "Sin barra"}
            </Badge>
          </div>
          <CardDescription className="text-slate-500">
            Revisa los productos antes de confirmar la venta.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3">
          <ScrollArea className="flex-1 pr-2">
            {cart.length === 0 ? (
              <p className="text-xs text-slate-500">
                No hay productos en el carrito.
              </p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-2 bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Q {item.price.toFixed(2)} c/u
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => changeQuantity(item.id, +1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="text-sm font-semibold text-emerald-700">
                        Q {(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer carrito */}
          <div className="border-t border-slate-200 mt-3 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total</span>
              <span className="text-2xl font-bold text-emerald-700">
                Q {total.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                disabled={cart.length === 0 || sending}
                onClick={clearCart}
              >
                Limpiar
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={
                  cart.length === 0 ||
                  sending ||
                  !bar ||
                  !event ||
                  loading
                }
                onClick={handleSale}
              >
                {sending ? "Procesando..." : "Confirmar venta"}
              </Button>
            </div>

            {message && (
              <div
                className={`text-xs px-3 py-2 rounded-md border ${
                  message.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}