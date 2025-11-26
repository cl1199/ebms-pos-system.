import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950 text-slate-100">

      {/* ░░ DESKTOP SIDEBAR ░░ */}
      {sidebarVisible && (
        <aside className="hidden md:flex md:w-64 h-full">
          <Sidebar />
        </aside>
      )}

      {/* ░░ MOBILE OVERLAY SIDEBAR ░░ */}
      <div
        className={`
          fixed inset-0 z-50 md:hidden transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full w-64">
          <Sidebar onSelect={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* ░░ MAIN CONTENT ░░ */}
      <main className="flex-1 flex flex-col px-4 py-4 md:px-6 md:py-5 overflow-y-auto">

        {/* TOP BAR */}
        <header className="mb-4 flex items-center justify-between gap-3">

          {/* MOBILE: abrir sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-200 hover:bg-white/10"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </Button>

          {/* DESKTOP: mostrar/ocultar sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-slate-200 hover:bg-white/10"
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            <Menu size={20} />
          </Button>

          <div className="flex-1" />

          {/* USER BLOCK */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 backdrop-blur-xl shadow-xl">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xs font-semibold">
                {user?.name?.[0] || "U"}
              </div>
              <div className="hidden sm:flex flex-col text-xs leading-tight">
                <span className="font-medium truncate max-w-[150px]">{user?.name}</span>
                <span className="text-slate-300 uppercase tracking-[0.18em]">{user?.role}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-200 hover:bg-white/10"
                onClick={logout}
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 md:p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}