// Pantalla que aparece cuando un cliente llega desde el email de invitación.
// El usuario ya está autenticado (Supabase procesó el token) pero necesita
// elegir su contraseña antes de usar la app.

import { useState } from "react";
import { supabase } from "../lib/supabase";
import MVPLogo from "../components/MVPLogo";

export default function SetPasswordPage({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
      return;
    }

    // Limpiar el ?set-password=1 de la URL sin recargar la página
    window.history.replaceState({}, "", "/");
    onComplete();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 pt-safe pb-safe"
      style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <MVPLogo size={52} />
        </div>

        <h1 className="text-white text-2xl font-bold text-center mb-1">
          ¡Bienvenido/a!
        </h1>
        <p className="text-neutral-400 text-sm text-center mb-8">
          Crea tu contraseña para acceder a la app
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:border-[#8B1A2F] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-1">
              Repetir contraseña
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:border-[#8B1A2F] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-40 transition-opacity active:scale-95"
            style={{ background: "#8B1A2F" }}
          >
            {loading ? "Guardando…" : "Crear contraseña y entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
