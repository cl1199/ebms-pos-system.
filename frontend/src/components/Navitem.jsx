import { NavLink } from "react-router-dom";

export default function NavItem({ to, icon, label, onSelect }) {
  return (
    <NavLink
      to={to}
      onClick={() => onSelect && onSelect()}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
        ${isActive ? "bg-white/20 text-white shadow-md" : "text-slate-300 hover:bg-white/10 hover:text-white"}
        `
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}