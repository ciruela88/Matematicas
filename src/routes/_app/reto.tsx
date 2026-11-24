import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBoot } from "@/components/boot";
import { Player } from "@/components/player";
import { declineDiagnostic, startSession } from "@/lib/server/training";

export const Route = createFileRoute("/_app/reto")({ component: RetoPage });

function RetoPage() {
  const { boot, reload } = useBoot();
  const [sessionId, setSessionId] = useState<string | null>(boot.activeDailyId);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function begin() {
    setBusy(true);
    setError(null);
    try {
      const session = await startSession({ data: { mode: "daily" } });
      setSessionId(session.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude empezar el reto.");
    } finally {
      setBusy(false);
    }
  }

  if (!boot.diagnosticDone) {
    return (
      <section className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">Reto diario</h1>
        <p>Antes del primer nivel hace falta el diagnóstico, o una decisión explícita de empezar por lo básico.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/diagnostico" className="rounded-xl bg-accent px-4 py-3 text-paper">Hacer diagnóstico</Link>
          <button
            type="button"
            className="rounded-xl border border-line px-4 py-3"
            onClick={() => void declineDiagnostic().then(reload)}
          >
            Empezar en nivel 1
          </button>
        </div>
      </section>
    );
  }

  if (!sessionId) {
    return (
      <section className="max-w-xl">
        <p className="text-sm uppercase tracking-widest text-muted">10:00</p>
        <h1 className="mt-2 text-4xl font-semibold">Reto del día</h1>
        <p className="mt-3 text-muted">
          El tiempo corre en el servidor. Recargar, cambiar de sección o cerrar el navegador no regala minutos: la sesión se recupera donde estaba.
        </p>
        <button type="button" disabled={busy} className="mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper" onClick={() => void begin()}>
          {busy ? "Abriendo…" : "Comenzar"}
        </button>
        {error && <p className="mt-3 text-wrong">{error}</p>}
      </section>
    );
  }

  return (
    <Player
      sessionId={sessionId}
      sound={boot.soundOn}
      onLeave={() => {
        setSessionId(null);
        void reload();
      }}
      onChange={() => void reload()}
    />
  );
}
