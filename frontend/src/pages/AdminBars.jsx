// src/pages/AdminBars.jsx
import { useEffect, useState } from "react";
import api from "@/services/axios";
import axios from "axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

// Modal shadcn
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function AdminBars() {
  const [bars, setBars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    eventId: "",
  });

  const [message, setMessage] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      location: "",
      eventId: "",
    });
  };

  // ─────────────────────────────
  // Cargar datos iniciales
  // ─────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);

      const [barsRes, eventsRes] = await Promise.all([
        axios.get("/api/bars"),
        axios.get("/api/events"),
      ]);

      console.log("EVENTS RAW:", eventsRes.data);

      setBars(barsRes.data || []);
      setEvents(eventsRes.data.events ?? []);
    } catch (err) {
      console.error("Error cargando barras:", err);
      setMessage({
        type: "error",
        text: "Error al cargar barras o eventos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get("/events");
  
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.events;
  
        setEvents(data || []);
      } catch (err) {
        console.error("Error cargando eventos:", err);
        setEvents([]);
      }
    }
  
    loadEvents();
  }, []);
  
  // ─────────────────────────────
  // Manejo de formulario
  // ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ─────────────────────────────
  // Crear / Editar barra
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.eventId) {
      setMessage({
        type: "error",
        text: "El nombre y el evento son obligatorios.",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      location: form.location.trim() || null,
      eventId: Number(form.eventId),
    };

    try {
      if (editingId) {
        await axios.put(`/api/bars/${editingId}`, payload);
        setMessage({
          type: "success",
          text: "Barra actualizada correctamente.",
        });
      } else {
        await axios.post("/api/bars", payload);
        setMessage({
          type: "success",
          text: "Barra creada.",
        });
      }

      resetForm();
      loadData();
    } catch (err) {
      console.error("Error guardando barra:", err);
      setMessage({
        type: "error",
        text: "Error al guardar la barra.",
      });
    }
  };

  // ─────────────────────────────
  // Editar barra
  // ─────────────────────────────
  const handleEdit = (bar) => {
    setEditingId(bar.id);
    setForm({
      name: bar.name || "",
      location: bar.location || "",
      eventId: bar.eventId ? String(bar.eventId) : "",
    });
  };

  // ─────────────────────────────
  // Confirmar eliminación (modal)
  // ─────────────────────────────
  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/bars/${deleteId}`);
      setBars((prev) => prev.filter((b) => b.id !== deleteId));

      setMessage({
        type: "success",
        text: "Barra eliminada.",
      });
    } catch (err) {
      console.error("Error eliminando barra:", err);
      setMessage({
        type: "error",
        text: "No se pudo eliminar la barra.",
      });
    } finally {
      setDeleteId(null);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <Card>
        <CardHeader>
          <CardTitle>Administración de Barras</CardTitle>
          <CardDescription>
            Crea, edita y elimina barras asociadas a los eventos.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {editingId ? "Editar Barra" : "Nueva Barra"}
          </CardTitle>
          <CardDescription className="text-xs">
            Completa los datos y guarda los cambios.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            {/* Nombre */}
            <div>
              <label className="text-xs font-medium">Nombre *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm w-full dark:bg-slate-900"
                placeholder="Barra 1"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="text-xs font-medium">Ubicación</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm w-full dark:bg-slate-900"
                placeholder="VIP, General..."
              />
            </div>

            {/* Evento */}
            <div>
              <label className="text-xs font-medium">Evento *</label>
              <select
                name="eventId"
                value={form.eventId}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm w-full dark:bg-slate-900"
              >
                <option value="">Selecciona evento</option>

                {events.length === 0 && (
                  <option disabled>No hay eventos</option>
                )}

                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-2 md:justify-end">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" className="text-xs">
                {editingId ? "Guardar cambios" : "Crear Barra"}
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

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado de Barras</CardTitle>
          <CardDescription className="text-xs">
            {loading
              ? "Cargando barras..."
              : `Total: ${bars.length}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Ubicación</th>
                <th className="p-2 text-left">Evento</th>
                <th className="p-2 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {bars.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.id}</td>
                  <td className="p-2">{b.name}</td>
                  <td className="p-2">{b.location || "-"}</td>
                  <td className="p-2">{b.event?.name || "-"}</td>

                  <td className="p-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px]"
                        onClick={() => handleEdit(b)}
                      >
                        Editar
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button
                            size="sm"
                            className="h-7 px-2 text-[11px] bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            onClick={() => setDeleteId(b.id)}
                          >
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent
                         className="bg-white dark:bg-slate-900 
                         text-slate-800 dark:text-slate-200
                         border border-slate-300 dark:border-slate-700"
                        >
                        <AlertDialogHeader>
                      <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
                        ¿Eliminar barra?
                     </AlertDialogTitle>

                     <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
                        Esta acción no se puede deshacer.
                     </AlertDialogDescription>
                   </AlertDialogHeader>

                   <AlertDialogFooter>
                     <AlertDialogCancel
                        className="bg-slate-200 dark:bg-slate-800 
                        ext-slate-800 dark:text-slate-200
                        border border-slate-300 dark:border-slate-700"
                       >
                        Cancelar
                      </AlertDialogCancel>

                       <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={confirmDelete}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                     </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}