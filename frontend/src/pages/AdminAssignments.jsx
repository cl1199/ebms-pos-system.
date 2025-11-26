// =====================================================
//  AdminAssignments.jsx (VERSIÓN PREMIUM FINAL)
// =====================================================

import { useEffect, useMemo, useState } from "react";
import api from "@/services/axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminAssignments() {
  const [events, setEvents] = useState([]);
  const [bars, setBars] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // <-- usuarios filtrados CASHIER
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    eventId: "",
    barId: "",
    userId: "",
  });

  // ----------------------------------------------
  // Reset form
  // ----------------------------------------------
  const resetForm = () => {
    setForm({
      eventId: "",
      barId: "",
      userId: "",
    });
  };

  // ----------------------------------------------
  // Load initial data (events, bars, users, assigns)
  // ----------------------------------------------
  const loadData = async () => {
    try {
      setLoading(true);

      const [eventsRes, barsRes, usersRes, assignsRes] = await Promise.all([
        api.get("/api/events"),
        api.get("/api/bars"),
        api.get("/api/users"),
        api.get("/api/assignments"),
      ]);

      console.log("🟩 events:", eventsRes.data);
      console.log("🟦 bars:", barsRes.data);
      console.log("🟪 users:", usersRes.data);
      console.log("🟨 assigns:", assignsRes.data);

      //------------------------------------------------------
      // events => { events: [...] }
      //------------------------------------------------------
      setEvents(eventsRes.data?.events || []);

      //------------------------------------------------------
      // bars => array simple
      //------------------------------------------------------
      setBars(barsRes.data || []);

      //------------------------------------------------------
      // users => filtrar cajeros (role: CASHIER)
      //------------------------------------------------------
      if (Array.isArray(usersRes.data)) {
        const cashiers = usersRes.data.filter((u) => u.role === "CASHIER");
        setAllUsers(cashiers);
      } else {
        setAllUsers([]);
      }

      //------------------------------------------------------
      // assignments => { assignments: [...] }
      //------------------------------------------------------
      setAssignments(assignsRes.data?.assignments || []);
    } catch (err) {
      console.error("❌ Error cargando asignaciones:", err);
      setMessage({
        type: "error",
        text: "Error al cargar datos de asignaciones.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------------
  // Filter bars by event
  // ----------------------------------------------
  const filteredBars = useMemo(() => {
    if (!form.eventId) return [];
    const eventIdNum = Number(form.eventId);
    return bars.filter((b) => b.eventId === eventIdNum);
  }, [bars, form.eventId]);

  // ----------------------------------------------
  // Handle form inputs
  // ----------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "eventId" ? { barId: "" } : {}),
    }));
  };

  // ----------------------------------------------
  // Create new assignment
  // ----------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.eventId || !form.barId || !form.userId) {
      return setMessage({
        type: "error",
        text: "Evento, barra y cajero son obligatorios.",
      });
    }

    const payload = {
      eventId: Number(form.eventId),
      barId: Number(form.barId),
      userId: Number(form.userId),
    };

    try {
      setSaving(true);

      await api.post("/api/assignments", payload);

      setMessage({
        type: "success",
        text: "Asignación creada correctamente.",
      });

      resetForm();
      loadData();
    } catch (err) {
      console.error("❌ Error creando asignación:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.error || "No se pudo crear la asignación.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------
  // Delete assignment
  // ----------------------------------------------
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar la asignación?")) return;

    try {
      await api.delete(`/api/assignments/${id}`);

      setAssignments((prev) => prev.filter((a) => a.id !== id));

      setMessage({
        type: "success",
        text: "Asignación eliminada.",
      });
    } catch (err) {
      console.error("❌ Error eliminando asignación:", err);
      setMessage({
        type: "error",
        text: "No se pudo eliminar la asignación.",
      });
    }
  };

  // ----------------------------------------------
  // Helpers
  // ----------------------------------------------
  const getEventName = (id) =>
    events.find((e) => e.id === id)?.name || `Evento ${id}`;

  const getBarName = (id) =>
    bars.find((b) => b.id === id)?.name || `Barra ${id}`;

  const getUserName = (id) =>
    allUsers.find((u) => u.id === id)?.name || `Usuario ${id}`;

  // ----------------------------------------------
  // UI
  // ----------------------------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card>
        <CardHeader>
          <CardTitle>Asignación de Cajeros a Barras</CardTitle>
          <CardDescription>
            Define qué cajero opera qué barra durante cada evento.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* FORMULARIO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva asignación</CardTitle>
          <CardDescription className="text-xs">
            Selecciona evento, barra y cajero.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            {/* Evento */}
            <div>
              <label className="text-xs font-medium">Evento *</label>
              <select
                name="eventId"
                value={form.eventId}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm w-full bg-white"
              >
                <option value="">Selecciona evento</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Barra */}
            <div>
              <label className="text-xs font-medium">Barra *</label>
              <select
                name="barId"
                value={form.barId}
                disabled={!form.eventId}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm w-full bg-white"
              >
                <option value="">
                  {form.eventId ? "Selecciona barra" : "Selecciona evento primero"}
                </option>

                {filteredBars.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cajero */}
            <div>
              <label className="text-xs font-medium">Cajero *</label>
              <select
                name="userId"
                value={form.userId}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm w-full bg-white"
              >
                <option value="">Selecciona cajero</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-2 md:justify-end">
              <Button
                type="button"
                variant="outline"
                className="text-xs"
                onClick={resetForm}
              >
                Limpiar
              </Button>

              <Button type="submit" className="text-xs" disabled={saving}>
                {saving ? "Guardando..." : "Crear asignación"}
              </Button>
            </div>
          </form>

          {message && (
            <p
              className={`mt-3 text-xs ${
                message.type === "success"
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* TABLA DE ASIGNACIONES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asignaciones actuales</CardTitle>
          <CardDescription className="text-xs">
            {loading
              ? "Cargando..."
              : `Total: ${assignments.length} asignación(es).`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {assignments.length === 0 && !loading ? (
            <p className="text-xs text-gray-500">No hay asignaciones registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="text-left p-2 border-b">ID</th>
                    <th className="text-left p-2 border-b">Evento</th>
                    <th className="text-left p-2 border-b">Barra</th>
                    <th className="text-left p-2 border-b">Cajero</th>
                    <th className="text-left p-2 border-b">Creado</th>
                    <th className="text-right p-2 border-b">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-2 border-b">{a.id}</td>
                      <td className="p-2 border-b">{getEventName(a.eventId)}</td>
                      <td className="p-2 border-b">{getBarName(a.barId)}</td>
                      <td className="p-2 border-b">{getUserName(a.userId)}</td>
                      <td className="p-2 border-b">
                        {new Date(a.createdAt).toLocaleString("es-GT")}
                      </td>
                      <td className="p-2 border-b text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => handleDelete(a.id)}
                        >
                          Eliminar
                        </Button>
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