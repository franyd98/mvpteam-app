import { useState } from "react";
import { supabase } from "../lib/supabase";
import MVPLogo from "../components/MVPLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Email o contraseña incorrectos."); setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}
    >
      {/* Fondo decorativo: línea diagonal carmesí */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute"
          style={{
            top: "-10%",
            right: "-5%",
            width: "45%",
            height: "130%",
            background: "linear-gradient(175deg, transparent 30%, #8B1A2F18 50%, transparent 70%)",
            transform: "skewX(-12deg)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "0",
            left: "0",
            width: "100%",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #8B1A2F60, transparent)",
          }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo + nombre */}
        <div className="flex flex-col items-center mb-10 gap-4">
          <MVPLogo size={56} />
          <div className="text-center leading-none">
            <h1 className="text-4xl font-black tracking-tight">
              <span className="text-white">MVP</span>
              <span style={{ color: "#8B1A2F" }}> Team</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-2 tracking-wide uppercase">
              Tu entrenamiento, tu progreso
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "#111111", borderColor: "#222222" }}
        >
          <p className="text-neutral-400 text-sm mb-5 text-center">Inicia sesión para continuar</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none transition-colors"
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#8B1A2F")}
                onBlur={e => (e.currentTarget.style.borderColor = "#2A2A2A")}
                placeholder="tu@email.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5 block">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none transition-colors"
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#8B1A2F")}
                onBlur={e => (e.currentTarget.style.borderColor = "#2A2A2A")}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm rounded-lg px-3 py-2"
                style={{ background: "#2A0A0A", border: "1px solid #4A1A1A" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all mt-2 disabled:opacity-40"
              style={{ background: loading ? "#5A1020" : "#8B1A2F" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#A01F38"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#8B1A2F"; }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-700 text-xs mt-6 tracking-wider uppercase">
          MVP Team · Entrenamiento Personalizado
        </p>
      </div>
    </div>
  );
}
