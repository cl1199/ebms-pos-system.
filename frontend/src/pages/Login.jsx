import { useState } from "react";
import api from "@/services/axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      login(res.data.user, res.data.token);

      // 🔥 Esta es la parte que faltaba
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="relative h-screen w-screen overflow-hidden">

{/* 🔥 VIDEO DE FONDO */}
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover z-0"
>
  <source src="/video/login-bg.mp4" type="video/mp4" />
</video>

{/* 🔥 OVERLAY OSCURO */}
<div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10" />

{/* 🔥 CONTENEDOR CENTRAL */}
<div className="absolute inset-0 flex items-center justify-center p-4 z-20">
  <div className="bg-white/20 backdrop-blur-xl border border-white/30 
                  shadow-2xl rounded-3xl p-10 w-full max-w-md
                  animate-[fadeIn_0.8s_ease]">

    {/* LOGO */}
    {/* LOGO GLASS */}
<div className="flex flex-col items-center mb-8">
  <div className="text-center">
    <span className="text-6xl font-extrabold tracking-widest
      text-transparent bg-clip-text 
      bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500
      drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]
    ">
      EBMS
    </span>
    <p className="text-xs tracking-[0.35em] text-white/50 mt-2">
      EVENT BAR MANAGEMENT SYSTEM
    </p>
  </div>
</div>
   

          {/* FORM */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-white text-sm">Correo</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-white/20 border border-white/30 
                           text-white placeholder-white/50 outline-none focus:ring-2 
                           focus:ring-blue-400"
                placeholder="correo@empresa.com"
              />
            </div>

            <div>
              <label className="text-white text-sm">Contraseña</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-white/20 border border-white/30 
                           text-white placeholder-white/50 outline-none focus:ring-2 
                           focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 text-white font-semibold rounded-lg 
                         bg-gradient-to-r from-blue-500 to-blue-700 
                         hover:opacity-90 transition-all shadow-xl 
                         active:scale-[0.98]"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}