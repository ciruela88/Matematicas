import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useBoot } from "@/components/boot";
import { Player } from "@/components/player";
import { startSession } from "@/lib/server/training";
import { LEVEL_NAME, type Level } from "@/lib/math/engine";

export const Route = createFileRoute("/_app/reloj")({ component: RelojPage });

const MODES = [
  { id: "arith", title: "Horas, minutos y segundos", text: "Sumas y restas sexagesimales, con llevadas y préstamos." },
  { id: "clock12", title: "Reloj de 12 horas", text: "Qué hora será o qué hora era, con mediodía y medianoche." },
  { id: "convert", title: "24 h y 12 h", text: "00:00 es medianoche. 12:00 es mediodía." },
] as const;

function RelojPage() {
  const { boot, reload } = useBoot();
  const [submode, setSubmode] = useState<(typeof MODES)[number]["id"]>("arith");
  const [level, setLevel] = useState<Level>(1);
  const [count, setCount] = useState<number | null>(15);
  const [sessionId, setSessionId] = useState<string | null>(boot.activeClockId);
  const [error, setError] = useState<string | null>(null);

  if (sessionId) {
    return <Player sessionId={sessionId} sound={boot.soundOn} onLeave={() => setSessionId(null)} onChange={() => void reload()} />;
  }

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-semibold">Reloj y tiempo</h1>
      <p className="mt-2 text-muted">
        La corrección compara la hora o la duración, no un texto único. 2:35 p. m. y 14:35 son la misma hora.
      </p>
      <div className="mt-6 space-y-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            aria-pressed={submode === mode.id}
            onClick={() => setSubmode(mode.id)}
            className={`block w-full rounded-2xl border p-4 text-left ${submode === mode.id ? "border-accent bg-accent-2" : "border-line bg-card"}`}
          >
            <span className="font-medium">{mode.title}</span>
            <span className="mt-1 block text-sm text-muted">{mode.text}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-4 gap-2">
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
      <div className="mt-4 flex gap-2">
        {[10, 15, null].map((value) => (
          <button
            key={String(value)}
            type="button"
            aria-pressed={count === value}
            onClick={() => setCount(value)}
            className={`min-h-11 rounded-xl border px-4 ${count === value ? "border-accent bg-accent-2" : "border-line"}`}
          >
            {value == null ? "Continua" : `${value}`}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper"
        onClick={() => {
          void startSession({ data: { mode: "clock", submode, level, count } })
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
