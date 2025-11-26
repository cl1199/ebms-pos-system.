// src/pages/Home.jsx
import React from "react";

export default function Home() {
  return (
    <div className="relative min-h-full w-full overflow-hidden ebms-shell">

      {/* Fondo con tu imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/home-bg.png')" }}
      />



      {/* Contenedor vacío */}
      <div className="relative z-10 w-full h-full" />

    </div>
  );
}