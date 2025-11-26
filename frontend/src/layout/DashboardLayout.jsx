import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  BarChart2,
  Package,
  Users,
  UserCog,
  LogOut,
  Menu,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

// Single menu item
function NavItem({ to, icon, label }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
        ${active ? "bg-white/15 text-white shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white"}
      `}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const role = user?.role;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#111a2e] relative">

      {/* Fondo gradiente sutil */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br 
       from-blue-900/20 via-transparent to-indigo-900/10"></div>

      {/* ░░ SIDEBAR ░░ */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40
          bg-[#142039] border-r border-white/10 px-4 py-5
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* EBMS LOGO PREMIUM */}
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="text-4xl font-extrabold tracking-widest 
          text-transparent bg-clip-text 
          bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500
          drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]">
            EBMS
            </span>
            
            <p className="text-[10px] tracking-[0.35em] text-white/40 mt-1">
            EVENT BAR MANAGEMENT SYSTEM
            </p>
            </div>
        {/* MENU */}
        <nav className="flex-1 flex flex-col gap-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-3 py-4 shadow-xl">

          {/* HOME */}
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2">Inicio</div>
          <NavItem to="/" icon={<LayoutDashboard size={16} />} label="Home" />

          {/* GESTIÓN DEL EVENTO */}
          {(role === "ADMIN" || role === "SUPERVISOR") && (
            <>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2 mt-4">Gestión del Evento</div>
              <NavItem to="/event-dashboard" icon={<BarChart2 size={16} />} label="Dashboard Evento" />
              <NavItem to="/pos" icon={<ShoppingCart size={16} />} label="POS" />
              <NavItem to="/inventario" icon={<Package size={16} />} label="Inventario en Vivo" />
            </>
          )}

          {/* ADMINISTRACIÓN DEL EVENTO */}
          {role === "ADMIN" && (
            <>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2 mt-4">Administración del Evento</div>

              <NavItem to="/admin/events" icon={<Settings size={16} />} label="Eventos" />
              <NavItem to="/admin/inventory-init" icon={<Package size={16} />} label="Inventario Inicial" />
              <NavItem to="/admin/staff" icon={<Users size={16} />} label="Staff" />
              <NavItem to="/admin/bars" icon={<Settings size={16} />} label="Barras" />
              <NavItem to="/admin/assignments" icon={<Settings size={16} />} label="Asignaciones" />
            </>
          )}

          {/* ADMIN GLOBAL */}
          {role === "ADMIN" && (
            <>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2 mt-4">Administración</div>

              <NavItem to="/admin/products" icon={<Package size={16} />} label="Productos" />
              <NavItem to="/admin/users" icon={<UserCog size={16} />} label="Usuarios" />
              <NavItem to="/sales" icon={<BarChart2 size={16} />} label="Reportes / Ventas" />
            </>
          )}
        </nav>

        {/* FOOTER */}
        <div className="mt-4 text-[11px] text-slate-500 px-1">
          Powered by <span className="font-semibold">MECCA Software</span>
        </div>
      </aside>

      {/* ░░ CONTENIDO ░░ */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300 
          ${sidebarOpen ? "pl-64" : "pl-0"}
        `}
      >
        {/* Header */}
        <header className="mb-4 flex items-center justify-between px-4 pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-white/10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={22} />
          </Button>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 
                px-3 py-2 backdrop-blur-xl shadow-xl text-slate-200">
                  {/* círculo con iniciales */}
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br 
                  from-sky-500 to-blue-600 flex items-center 
                  justify-center text-sm font-bold text-white shadow-md">
                    {user?.name?.[0] || "U"}
                    </div>
                    {/* nombre y rol */}
                     <div className="hidden sm:flex flex-col leading-tight">
                      <span className="text-sm font-medium text-slate-100">
                        {user?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-[0.18em]">
                          {role}
                          </span>
                           </div>
                           {/* logout button */}
                           <Button
                           variant="ghost"
                           size="icon"
                           className="text-slate-300 hover:text-white hover:bg-white/10"
                           onClick={logout}
                           title="Cerrar sesión"
                           >
                            <LogOut size={18} />
                            </Button>
                            </div>
                            </header>
{/* Content */}
        <section className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-4 shadow-xl mx-4 mb-4">
          <Outlet />
        </section>
      </div>
    </div>
  );
}