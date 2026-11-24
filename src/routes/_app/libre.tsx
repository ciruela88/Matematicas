import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBoot } from "@/components/boot";
import { Player } from "@/components/player";
import { KIND_LABEL, LEVEL_HINT, LEVEL_NAME, formatVariety, varietyLowerBound, type Kind, type Level } from "@/lib/math/engine";
import { declineDiagnostic, startSession } from "@/lib/server/training";

export const Route = createFileRoute("/_app/libre")({ component: LibrePage });

const OPS: Kind[] = ["add", "sub", "mul", "div", "pow", "root", "combo"];

function LibrePage() {
  const { boot, reload } = useBoot();
  const [kinds, setKinds] = useState<Kind[]>(["add", "sub"]);
  const [level, setLevel] = useState<Level>(boot.level);
  const [count, setCount] = useState<number | "continuous">(20);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [sessionId, setSessionId] = useState<string | null>(boot.activeFreeId);
  const [error, setError] = useState<string | null>(null);

  function toggle(kind: Kind) {
    setKinds((current) => (current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind]));
  }

  if (!boot.diagnosticDone) {
    return (
      <section className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">Modo libre</h1>
        <p>El nivel de partida sale del diagnóstico. Puedes saltarlo y quedarte en nivel 1.</p>
        <Link to="/diagnostico" className="inline-flex rounded-xl bg-accent px-4 py-3 text-paper">Hacer diagnóstico</Link>
        <button type="button" className="ml-3 rounded-xl border border-line px-4 py-3" onClick={() => void declineDiagnostic().then(reload)}>
          Empezar en nivel 1
        </button>
      </section>
    );
  }

  if (sessionId) {
    return (
      <Player
        sessionId={sessionId}
        sound={boot.soundOn}
        onLeave={() => setSessionId(null)}
        onChange={() => void reload()}
      />
    );
  }

  const variety = kinds.reduce((sum, kind) => sum + varietyLowerBound(kind, level), 0);

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-semibold">Modo libre</h1>
      <p className="mt-2 text-muted">Sin reloj obligatorio. Cada ejercicio nuevo consulta tu historial antes de mostrarse.</p>
      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Operaciones</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {OPS.map((kind) => {
            const on = kinds.includes(kind);
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(kind)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm ${on ? "border-accent bg-accent-2" : "border-line"}`}
              >
                {KIND_LABEL[kind]}
              </button>
            );
          })}
          <button
            type="button"
            className="min-h-11 rounded-full border border-line px-4 py-2 text-sm"
            onClick={() => setKinds(OPS)}
          >
            Todas
          </button>
        </div>
      </fieldset>
      {kinds.length > 1 && (
        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Proporción (0 a 5)</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {kinds.map((kind) => (
              <label key={kind} className="flex items-center justify-between gap-3 text-sm">
                {KIND_LABEL[kind]}
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={weights[kind] ?? 1}
                  onChange={(event) => setWeights({ ...weights, [kind]: Number(event.target.value) })}
                  className="w-20 rounded-lg border border-line bg-card px-2 py-2"
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Dificultad</legend>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as Level[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={level === value}
              onClick={() => setLevel(value)}
              className={`min-h-11 rounded-xl border px-1 text-sm ${level === value ? "border-accent bg-accent-2" : "border-line"}`}
            >
              {LEVEL_NAME[value]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          {LEVEL_HINT[level]} La exigencia no es la misma en una suma que en una raíz.
          Combinaciones de partida: {formatVariety(variety)}, y el generador amplía el rango si ese conjunto se agota.
        </p>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Cantidad</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[10, 20, 50, "continuous" as const].map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={count === value}
              onClick={() => setCount(value)}
              className={`min-h-11 rounded-xl border px-4 ${count === value ? "border-accent bg-accent-2" : "border-line"}`}
            >
              {value === "continuous" ? "Continua" : value}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        className="mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper"
        onClick={() => {
          setError(null);
          void startSession({
            data: { mode: "free", kinds, level, count: count === "continuous" ? null : count, weights },
          })
            .then((session) => setSessionId(session.id))
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "No pude empezar."));
        }}
      >
        Practicar
      </button>
      {error && <p className="mt-3 text-wrong">{error}</p>}
    </section>
  );
}
