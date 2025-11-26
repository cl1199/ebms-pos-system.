// src/pages/AdminEvents.jsx
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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// 🔹 IMPORTANTE: aquí NO usamos AlertDialogTrigger para evitar el error de contexto

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    location: "",
    status: "ACTIVE",
  });

  const [message, setMessage] = useState(null);

  // 🔹 Estado para el modal de eliminación
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [barsCount, setBarsCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      date: "",
      location: "",
      status: "ACTIVE",
    });
  };

  // ─────────────────────────────
  // Cargar eventos
  // ─────────────────────────────
  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/events");

      console.log("RESPONSE EVENTS:", res.data);

      // Soporta backend que devuelve array o { events: [...] }
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.events || [];
      setEvents(list);
    } catch (err) {
      console.error("Error cargando eventos:", err);
      setMessage({
        type: "error",
        text: "Error al cargar eventos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ─────────────────────────────
  // Manejo de cambios de formulario
  // ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ─────────────────────────────
  // Crear / Actualizar evento
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      date: form.date ? new Date(form.date).toISOString() : null,
      location: form.location.trim() || null,
      status: form.status || "ACTIVE",
    };

    if (!payload.name) {
      setMessage({
        type: "error",
        text: "El nombre del evento es obligatorio.",
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/events/${editingId}`, payload);
        setMessage({
          type: "success",
          text: "Evento actualizado correctamente.",
        });
      } else {
        await axios.post("/api/events", payload);
        setMessage({
          type: "success",
          text: "Evento creado correctamente.",
        });
      }
      resetForm();
      loadEvents();
    } catch (err) {
      console.error("Error guardando evento:", err);
      setMessage({
        type: "error",
        text: "Error al guardar el evento.",
      });
    }
  };

  // ─────────────────────────────
  // Editar evento
  // ─────────────────────────────
  const handleEdit = (event) => {
    setEditingId(event.id);
    setForm({
      name: event.name || "",
      date: event.date ? event.date.substring(0, 10) : "",
      location: event.location || "",
      status: event.status || "ACTIVE",
    });
  };

  // ─────────────────────────────
  // Abrir modal de eliminación
  // ─────────────────────────────
  const openDeleteModal = async (event) => {
    setSelectedEvent(event);
    setBarsCount(0);

    try {
      // Usamos la ruta que YA tienes: /api/bars/event/:eventId
      const res = await axios.get(`/api/bars/event/${event.id}`);
      const count = res.data?.bars?.length || 0;
      setBarsCount(count);
    } catch (error) {
      console.error("Error obteniendo barras del evento:", error);
      setBarsCount(0);
    }

    setModalOpen(true);
  };

  // ─────────────────────────────
  // Confirmar eliminación (evento solo o evento + barras)
  // ─────────────────────────────
  const confirmDelete = async (deleteBars) => {
    if (!selectedEvent) return;
    setDeleting(true);

    try {
      let url = `/api/events/${selectedEvent.id}`;

      // Tu backend espera ?force=detach o ?force=delete
      if (barsCount > 0) {
        url += deleteBars ? "?force=delete" : "?force=detach";
      }

      await axios.delete(url);

      setMessage({
        type: "success",
        text: deleteBars
          ? "Evento y barras asociadas eliminados correctamente."
          : "Evento eliminado correctamente.",
      });

      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setSelectedEvent(null);
      setBarsCount(0);
      setModalOpen(false);
    } catch (err) {
      console.error("Error eliminando evento:", err);
      const data = err.response?.data;
      setMessage({
        type: "error",
        text: data?.error || data?.message || "Error al eliminar el evento.",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Administración de eventos</CardTitle>
          <CardDescription>
            Crea, edita y elimina eventos. Cada evento puede tener barras y ventas asociadas.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Formulario */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">
            {editingId ? "Editar evento" : "Nuevo evento"}
          </CardTitle>
          <CardDescription className="text-xs">
            Define el nombre, fecha, ubicación y estado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
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
                placeholder="Technasia by MECCA"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                placeholder="Ciudad de Guatemala, rooftop..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Estado
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="CLOSED">Cerrado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>

            <div className="flex gap-2 md:col-span-4 md:justify-end">
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
                {editingId ? "Guardar cambios" : "Crear evento"}
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

      {/* Tabla de eventos */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">Listado de eventos</CardTitle>
          <CardDescription className="text-xs">
            {loading
              ? "Cargando eventos..."
              : `Total: ${events.length} evento(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 && !loading ? (
            <p className="text-xs text-slate-500">
              No hay eventos registrados.
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
                      Fecha
                    </th>
                    <th className="text-left p-2 border-b border-slate-200 dark:border-slate-800">
                      Ubicación
                    </th>
                    <th className="text-left p-2 border-b border-slate-200 dark:border-slate-800">
                      Estado
                    </th>
                    <th className="text-right p-2 border-b border-slate-200 dark:border-slate-800">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr
                      key={ev.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/60"
                    >
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {ev.id}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {ev.name}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {ev.date
                          ? new Date(ev.date).toLocaleDateString("es-GT")
                          : "-"}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {ev.location || "-"}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                        {ev.status || "-"}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => handleEdit(ev)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-[11px] bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            onClick={() => openDeleteModal(ev)}
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

      {/* Modal de confirmación */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
      <AlertDialogContent
  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
>
  <AlertDialogHeader>
    <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
      ¿Eliminar evento?
    </AlertDialogTitle>

    <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
      {barsCount > 0 ? (
        <span>
          Este evento tiene <b>{barsCount}</b> barra(s) asociada(s).  
          ¿Deseas eliminar también esas barras?
        </span>
      ) : (
        "Esta acción no se puede deshacer."
      )}
    </AlertDialogDescription>
  </AlertDialogHeader>

  <AlertDialogFooter>
    <AlertDialogCancel className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
      Cancelar
    </AlertDialogCancel>

    {barsCount > 0 ? (
      <>
        <AlertDialogAction
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
          onClick={() => confirmDelete(false)}
        >
          Solo eliminar evento
        </AlertDialogAction>

        <AlertDialogAction
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => confirmDelete(true)}
        >
          Eliminar evento + barras
        </AlertDialogAction>
      </>
    ) : (
      <AlertDialogAction
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={() => confirmDelete(false)}
      >
        Eliminar
      </AlertDialogAction>
    )}
  </AlertDialogFooter>
</AlertDialogContent>
      </AlertDialog>
    </div>
  );
}