import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useBoot } from "@/components/boot";
import { Player } from "@/components/player";
import { KIND_LABEL, type Kind } from "@/lib/math/engine";
import { startSession, type SessionView } from "@/lib/server/training";

export const Route = createFileRoute("/_app/diagnostico")({ component: DiagnosticPage });

type Report = {
  level: number;
  perKind: Record<string, number>;
  mastered: string[];
  weak: string[];
  medianMs: number;
  speedLabel: string;
  recommendations: string[];
};

function DiagnosticPage() {
  const { boot, reload } = useBoot();
  const [sessionId, setSessionId] = useState<string | null>(boot.activeDiagnosticId);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  function capture(session: SessionView) {
    const stored = (session.result as { report?: Report } | null)?.report;
    if (session.status === "completed" && stored) setReport(stored);
  }

  if (sessionId && !report) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Diagnóstico</h1>
        <Player
          sessionId={sessionId}
          sound={boot.soundOn}
          onSession={(session) => {
            capture(session);
            if (session.status === "completed") void reload();
          }}
          onLeave={() => {
            setSessionId(null);
            void reload();
          }}
        />
      </div>
    );
  }

  if (report) {
    return (
      <section className="max-w-2xl space-y-4">
        <p className="text-sm uppercase tracking-widest text-muted">Informe</p>
        <h1 className="text-4xl font-semibold">Nivel {report.level}</h1>
        <p>
          Velocidad {report.speedLabel}. Mediana {Math.round(report.medianMs / 100) / 10} s por ejercicio.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-line bg-card p-4">
            <h2 className="font-semibold">Mejor encaje</h2>
            <p className="mt-2 text-sm">{report.mastered.length ? report.mastered.join(", ") : "Todavía sin una operación estable."}</p>
          </article>
          <article className="rounded-2xl border border-line bg-card p-4">
            <h2 className="font-semibold">Rendimiento bajo</h2>
            <p className="mt-2 text-sm">{report.weak.length ? report.weak.join(", ") : "Ninguna operación quedó por debajo del umbral."}</p>
          </article>
        </div>
        <ul className="space-y-2">
          {Object.entries(report.perKind).map(([kind, level]) => (
            <li key={kind} className="flex justify-between border-b border-line py-2 text-sm">
              <span>{KIND_LABEL[kind as Kind] ?? kind}</span>
              <span>nivel {level}</span>
            </li>
          ))}
        </ul>
        <div>
          <h2 className="font-semibold">Qué hacer ahora</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {report.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted">
          {boot.hasBaseline
            ? "Este resultado no sustituye el diagnóstico original. La comparación está en Progreso."
            : "Este informe queda guardado como diagnóstico original."}
        </p>
        <button type="button" className="rounded-xl border border-line px-4 py-3" onClick={() => { setReport(null); setSessionId(null); }}>
          Cerrar
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-semibold">Examen diagnóstico</h1>
      <p className="mt-3 text-muted">
        Doce respuestas escritas. Empieza por sumas y restas y sube si la base aguanta. El nivel no sale solo del número de aciertos: también cuentan el tiempo y la operación.
      </p>
      {boot.hasBaseline && (
        <p className="mt-3 text-sm">Ya existe un diagnóstico original. Repetirlo mide el cambio y no lo borra.</p>
      )}
      <button
        type="button"
        className="mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper"
        onClick={() => {
          void startSession({ data: { mode: "diagnostic" } })
            .then((session) => {
              capture(session);
              setSessionId(session.id);
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "No pude empezar."));
        }}
      >
        {boot.activeDiagnosticId ? "Continuar diagnóstico" : "Comenzar"}
      </button>
      {error && <p className="mt-3 text-wrong">{error}</p>}
    </section>
  );
}
