import NavItem from "@/components/NavItem";
import {
  LayoutDashboard,
  ShoppingCart,
  StickyNote,
  Package,
  Store,
  Users,
  BriefcaseBusiness,
  User,
  BarChart2,
  ClipboardList,
  Gauge,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ onSelect }) {
  const { user } = useAuth();

  return (
    <aside className="w-64 h-full p-4 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-xl flex flex-col">
      
      {/* LOGO */}
      <div className="mb-4">
        <h1 className="text-lg font-bold tracking-tight">EBMS</h1>
        <p className="text-xs opacity-60">Event Bar Management System</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">

        {/* HOME */}
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2 mb-1">
          Inicio
        </div>
        <NavItem to="/" icon={<LayoutDashboard size={16} />} label="Home" onSelect={onSelect}/>

        {/* GESTIÓN DE EVENTO */}
        {(user?.role === "ADMIN" || user?.role === "SUPERVISOR") && (
          <>
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2 mt-4 mb-1">
              Gestión del Evento
            </div>
            <NavItem to="/pos" icon={<ShoppingCart size={16} />} label="POS" onSelect={onSelect}/>
            <NavItem to="/event-dashboard" icon={<Gauge size={16} />} label="Dashboard" onSelect={onSelect}/>
            <NavItem to="/inventario-live" icon={<ClipboardList size={16} />} label="Inventario en vivo" onSelect={onSelect}/>
          </>
        )}

        {/* ADMINISTRACIÓN DE EVENTOS */}
        {user?.role === "ADMIN" && (
          <>
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2 mt-4 mb-1">
              Administración de Eventos
            </div>
            <NavItem to="/admin/events" icon={<StickyNote size={16} />} label="Eventos" onSelect={onSelect}/>
            <NavItem to="/admin/inventory-start" icon={<Package size={16} />} label="Inventario inicial" onSelect={onSelect}/>
            <NavItem to="/admin/menu" icon={<Store size={16} />} label="Menú" onSelect={onSelect}/>
            <NavItem to="/admin/staff" icon={<Users size={16} />} label="Staff" onSelect={onSelect}/>
            <NavItem to="/admin/bars" icon={<BriefcaseBusiness size={16} />} label="Barras" onSelect={onSelect}/>
            <NavItem to="/admin/assignments" icon={<User size={16} />} label="Asignaciones" onSelect={onSelect}/>
          </>
        )}

        {/* ADMIN GENERAL */}
        {user?.role === "ADMIN" && (
          <>
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 px-2 mt-4 mb-1">
              Administración General
            </div>
            <NavItem to="/admin/users" icon={<User size={16} />} label="Usuarios" onSelect={onSelect}/>
            <NavItem to="/admin/reportes" icon={<BarChart2 size={16} />} label="Reportes" onSelect={onSelect}/>
          </>
        )}
      </nav>

      <div className="mt-4 text-[11px] text-slate-400 px-1">
        Powered by <span className="font-semibold">MECCA Software</span>
      </div>

    </aside>
  );
}