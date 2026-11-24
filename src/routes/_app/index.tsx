import { createFileRoute, Link } from "@tanstack/react-router";
import { useBoot } from "@/components/boot";
import { updateSettings } from "@/lib/server/training";
import { LEVEL_NAME, formatVariety, varietyLowerBound } from "@/lib/math/engine";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
  const { boot, reload } = useBoot();
  const showSeason = boot.seasonSeen < boot.season.number;
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted">Temporada {boot.season.number}</p>
        <h1 className="text-4xl font-semibold tracking-tight">{boot.season.name}</h1>
        <p className="mt-2 max-w-2xl text-muted">{boot.season.blurb}</p>
      </header>

      {showSeason && (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="text-lg font-semibold">Empieza la temporada {boot.season.number}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {boot.season.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
          {boot.previousSeason && (
            <p className="mt-3 text-sm text-muted">
              La temporada {boot.previousSeason.number} queda archivada. Los récords históricos no se borran.
            </p>
          )}
          <button
            type="button"
            className="mt-4 rounded-xl bg-accent px-4 py-3 text-paper"
            onClick={() => void updateSettings({ data: { seenSeason: true } }).then(reload)}
          >
            Entendido
          </button>
        </section>
      )}

      {!boot.diagnosticDone && (
        <section className="rounded-2xl border border-accent bg-accent-2 p-5">
          <h2 className="text-lg font-semibold">Diagnóstico inicial</h2>
          <p className="mt-2 text-sm">
            Doce ejercicios, sin opciones múltiples. Mide precisión, tiempo y tipo de operación antes de fijar tu nivel.
            El resultado original se conserva aunque lo repitas más adelante.
          </p>
          <Link to="/diagnostico" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-3 text-paper">
            {boot.activeDiagnosticId ? "Continuar diagnóstico" : "Empezar diagnóstico"}
          </Link>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-card p-5">
          <p className="text-sm text-muted">Reto de hoy · {boot.today}</p>
          <p className="mt-2 font-mono text-5xl">{boot.streak.current}</p>
          <p className="text-sm text-muted">
            {boot.streak.current === 1 ? "día de racha." : "días de racha."} Mejor marca: {boot.streak.best}.
          </p>
          <p className="mt-3 text-sm">
            {boot.todayStats.dailyCompleted
              ? `Reto completado. Hoy ${boot.todayStats.correct} aciertos de ${boot.todayStats.attempted}.`
              : boot.activeDailyId
                ? "Hay un reto en curso. El cronómetro no se reinicia."
                : !boot.diagnosticDone
                  ? "Diez minutos en cuanto cierres el diagnóstico. El tiempo corre en el servidor y no se reinicia al recargar."
                  : "Diez minutos. Entras, pulsas comenzar y calculas."}
          </p>
          <Link to="/reto" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-3 font-medium text-paper">
            {boot.activeDailyId ? "Continuar reto" : "Empezar reto"}
          </Link>
        </article>
        <article className="rounded-2xl border border-line bg-card p-5">
          <p className="text-sm text-muted">Nivel estimado</p>
          <p className="mt-2 text-5xl font-semibold">{LEVEL_NAME[boot.level]}</p>
          <p className="mt-2 text-sm text-muted">
            No sube por acumular ejercicios fáciles. Hace falta precisión y ritmo en el nivel anterior, y el nivel 4 exige varias operaciones.
          </p>
          <p className="mt-3 text-sm">Ejercicios ya mostrados y que no volverán: {boot.seenCount}.</p>
          <p className="mt-1 text-sm text-muted">
            Solo en sumas de nivel 4 hay {formatVariety(varietyLowerBound("add", 4))} de combinaciones, antes de ampliar rangos.
          </p>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/libre" className="rounded-2xl border border-line bg-card p-4">
          <h2 className="font-semibold">Modo libre</h2>
          <p className="mt-1 text-sm text-muted">Elige operación, nivel y cantidad.</p>
        </Link>
        <Link to="/reloj" className="rounded-2xl border border-line bg-card p-4">
          <h2 className="font-semibold">Reloj</h2>
          <p className="mt-1 text-sm text-muted">Horas, minutos, segundos y 12/24 h.</p>
        </Link>
        <Link to="/laboratorio" className="rounded-2xl border border-line bg-card p-4">
          <h2 className="font-semibold">Laboratorio</h2>
          <p className="mt-1 text-sm text-muted">Métodos para calcular, no definiciones.</p>
        </Link>
      </section>
    </div>
  );
}
