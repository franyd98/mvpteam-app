import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import FitnessApp from "./pages/FitnessApp";
import SetPasswordPage from "./pages/SetPasswordPage";
import MVPLogo from "./components/MVPLogo";

type Profile = { id: string; full_name: string; role: string };

// Detecta si el usuario llegó desde un email de invitación (?set-password=1)
const arrivedViaInvite = new URLSearchParams(window.location.search).has("set-password");

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // true mientras el usuario invitado no ha creado su contraseña
  const [needsPassword, setNeedsPassword] = useState(arrivedViaInvite);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data ?? null);
    setLoading(false);
  };

  const Spinner = () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "linear-gradient(160deg, #0A0A0A 60%, #1A0810 100%)" }}>
      <MVPLogo size={56} />
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A2F] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A2F] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A2F] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );

  if (loading) return <Spinner />;

  // Usuario invitado que necesita crear contraseña
  if (needsPassword) {
    // Si el token aún no se procesó y no hay sesión, esperamos
    if (!user) return <Spinner />;
    return <SetPasswordPage onComplete={() => setNeedsPassword(false)} />;
  }

  if (!user || !profile) return <LoginPage />;
  if (profile.role === "admin") return <AdminPage profile={profile} />;
  return <FitnessApp profile={profile} />;
}
