import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getBootstrap, type Bootstrap } from "@/lib/server/training";

type BootContextValue = {
  boot: Bootstrap;
  reload: () => Promise<void>;
};

const BootContext = createContext<BootContextValue | null>(null);

export function useBoot() {
  const ctx = useContext(BootContext);
  if (!ctx) throw new Error("useBoot fuera del perfil");
  return ctx;
}

export function BootProvider({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const next = await getBootstrap({ data: { timezone } });
    setBoot(next);
    setError(null);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void load().catch((err: unknown) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : "No pude cargar tu perfil.");
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, load]);

  useEffect(() => {
    if (!boot) return;
    document.documentElement.dataset.theme = boot.theme;
  }, [boot]);

  if (error) {
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-2xl font-semibold">No hay conexión con tus datos</h1>
        <p className="mt-3 text-muted">{error}</p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-accent px-4 py-3 font-medium text-paper"
          onClick={() => void load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Error"))}
        >
          Reintentar
        </button>
      </main>
    );
  }

  if (!boot) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10" aria-busy="true">
        <p className="text-sm uppercase tracking-widest text-muted">Cifra</p>
        <div className="mt-6 h-10 w-48 animate-pulse rounded-lg bg-paper-2" />
        <div className="mt-4 h-28 animate-pulse rounded-2xl bg-paper-2" />
      </main>
    );
  }

  return <BootContext.Provider value={{ boot, reload: load }}>{children}</BootContext.Provider>;
}
