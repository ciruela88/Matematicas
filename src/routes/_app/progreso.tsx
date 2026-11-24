import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useBoot } from "@/components/boot";
import { getProgress } from "@/lib/server/training";

export const Route = createFileRoute("/_app/progreso")({ component: ProgressPage });

type Progress = Awaited<ReturnType<typeof getProgress>>;

function formatMs(ms: number) {
  if (!ms) return "—";
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

function formatPractice(ms: number) {
  if (ms <= 0) return "0 min";
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))} s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min`;
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.round((ms % 3_600_000) / 60_000);
  return `${hours} h ${minutes} min`;
}

function formatRecord(key: string, value: number) {
  if (key.includes("accuracy")) return `${value.toFixed(1).replace(".", ",")} %`;
  if (key.includes("avg_correct")) return formatMs(value);
  if (key === "best_streak") return `${Math.round(value)} días`;
  return String(Math.round(value));
}

function ProgressPage() {
  const { boot } = useBoot();
  const [year, setYear] = useState(Number(boot.today.slice(0, 4)));
  const [month, setMonth] = useState(Number(boot.today.slice(5, 7)));
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getProgress({ data: { year, month } })
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No pude cargar el progreso.");
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  if (error) return <p className="text-wrong">{error}</p>;
  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-paper-2" aria-busy="true" />;

  const accuracy = data.totals.attempted
    ? Math.round((data.totals.correct / data.totals.attempted) * 1000) / 10
    : 0;
  const bestSpeed = data.records.find((record) => record.key === "daily:avg_correct_ms");
  const baseline = data.diagnostics.find((item) => item.baseline);

  function shift(delta: number) {
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYear(date.getUTCFullYear());
    setMonth(date.getUTCMonth() + 1);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Progreso</h1>
        <p className="mt-2 text-muted">
          Histórico y temporada {data.boot.season.number} van separados. Un día en blanco no borra récords.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Nivel" value={String(data.boot.level)} />
        <Stat label="Precisión histórica" value={`${String(accuracy).replace(".", ",")} %`} />
        <Stat label="Respondidos, histórico" value={String(data.totals.attempted)} />
        <Stat label="Aciertos, histórico" value={String(data.totals.correct)} />
        <Stat label="Tiempo de práctica" value={formatPractice(data.totals.practiceMs)} />
        <Stat label="Días con actividad" value={String(data.totals.days)} />
        <Stat label="Racha actual" value={String(data.boot.streak.current)} />
        <Stat label="Mejor velocidad" value={bestSpeed ? formatMs(bestSpeed.value) : "Aún no"} />
      </section>
      <p className="text-sm text-muted">El bloque anterior no se reinicia con la temporada. Abajo va solo la temporada en curso.</p>

      <SeasonNow seasons={data.seasons} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Calendario</h2>
          <div className="flex gap-2">
            <button type="button" className="min-h-11 rounded-lg border border-line px-3" onClick={() => shift(-1)} aria-label="Mes anterior">←</button>
            <span className="self-center text-sm">{monthName(month)} {year}</span>
            <button type="button" className="min-h-11 rounded-lg border border-line px-3" onClick={() => shift(1)} aria-label="Mes siguiente">→</button>
          </div>
        </div>
        <Calendar year={year} month={month} today={boot.today} days={data.calendar} />
        <p className="mt-2 text-xs text-muted">D: reto completo. P: práctica sin reto. El número es el mejor resultado del reto ese día.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Evolución reciente</h2>
        {data.series.length === 0 ? (
          <p className="mt-2 text-muted">Todavía no hay días con respuestas.</p>
        ) : (
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series} margin={{ left: 4, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted)" fontSize={12} />
                <YAxis stroke="var(--color-muted)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" name="Precisión %" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="correct" name="Aciertos" stroke="var(--color-ink)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <table className="mt-4 w-full text-left text-sm">
          <caption className="sr-only">Aciertos y precisión por día</caption>
          <thead>
            <tr className="text-muted">
              <th className="py-1 font-medium">Día</th>
              <th className="py-1 font-medium">Aciertos</th>
              <th className="py-1 font-medium">Precisión</th>
            </tr>
          </thead>
          <tbody>
            {data.series.slice(-10).map((day) => (
              <tr key={day.full} className="border-t border-line">
                <td className="py-1">{day.full}</td>
                <td>{day.correct}/{day.attempted}</td>
                <td>{day.accuracy} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Por dificultad</h2>
        {data.byLevel.length === 0 ? (
          <p className="mt-2 text-muted">Sin respuestas todavía.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-4">
            {data.byLevel.map((row) => {
              const rowAccuracy = row.attempted ? Math.round((row.correct / row.attempted) * 100) : 0;
              return (
                <li key={row.level} className="rounded-xl border border-line bg-card p-3">
                  <p className="text-sm text-muted">Nivel {row.level}</p>
                  <p className="text-xl font-semibold">{rowAccuracy} %</p>
                  <p className="text-sm text-muted">{row.correct}/{row.attempted}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Por operación</h2>
        {data.byKind.length === 0 ? (
          <p className="mt-2 text-muted">Sin datos todavía.</p>
        ) : (
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregate(data.byKind)}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={11} interval={0} angle={-20} height={50} textAnchor="end" />
                <YAxis stroke="var(--color-muted)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="accuracy" name="Precisión %" fill="var(--color-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="py-1 font-medium">Operación</th>
                <th className="py-1 font-medium">Familia</th>
                <th className="py-1 font-medium">Aciertos</th>
                <th className="py-1 font-medium">Tiempo medio</th>
              </tr>
            </thead>
            <tbody>
              {data.byKind.map((row) => (
                <tr key={`${row.kind}-${row.family}`} className="border-t border-line">
                  <td className="py-1">{row.label}</td>
                  <td>{row.family.replaceAll("_", " ")}</td>
                  <td>{row.correct}/{row.attempted}</td>
                  <td>{formatMs(row.avgMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Puntos débiles</h2>
        {data.weaknesses.length === 0 ? (
          <p className="mt-2 text-muted">Hacen falta al menos cinco respuestas de un tipo para señalar un punto débil.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.weaknesses.map((item) => (
              <li key={item.key} className="rounded-xl border border-line bg-card p-4">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted">
                  Precisión {Math.round(item.accuracy * 100)} % · {formatMs(item.avgMs)} · {item.attempted} respuestas
                </p>
                <p className="mt-2 text-sm">{item.suggestion}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Récords históricos</h2>
          {data.records.length === 0 ? (
            <p className="mt-2 text-muted">Completa un reto de 10 minutos para abrir los récords de sesión.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.records.map((record) => (
                <li key={record.key} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                  <span className="text-sm">{record.label}</span>
                  <span className="font-mono">{formatRecord(record.key, record.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Temporadas</h2>
          <ul className="mt-3 space-y-2">
            {data.seasons.length === 0 && <li className="text-muted">La temporada actual aún no tiene respuestas.</li>}
            {data.seasons.map((season) => (
              <li key={season.number} className="rounded-xl border border-line px-4 py-3 text-sm">
                <p className="font-medium">
                  {season.number}. {season.name}
                  {season.current ? " · actual" : ""}
                </p>
                <p className="text-muted">{season.correct} aciertos de {season.attempted}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Diagnóstico y ahora</h2>
        {baseline ? (
          <BaselineNow report={baseline.report} currentLevel={data.boot.level} accuracy={accuracy} />
        ) : (
          <p className="mt-2 text-sm text-muted">No hay diagnóstico original guardado.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Historial de sesiones</h2>
        <ul className="mt-3 space-y-2">
          {data.history.length === 0 && <li className="text-muted">Sin sesiones.</li>}
          {data.history.map((session) => (
            <li key={session.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm">
              <span>{session.date} · {labelMode(session.mode)}{session.full ? " · completa" : ""}</span>
              <span>{session.correct}/{session.attempted}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SeasonNow({ seasons }: { seasons: Progress["seasons"] }) {
  const season = seasons.find((item) => item.current) ?? seasons[seasons.length - 1];
  if (!season) {
    return (
      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="text-lg font-semibold">Temporada actual</h2>
        <p className="mt-2 text-sm text-muted">Todavía no hay respuestas en esta temporada.</p>
      </section>
    );
  }
  const accuracy = season.attempted ? Math.round((season.correct / season.attempted) * 1000) / 10 : 0;
  return (
    <section className="rounded-2xl border border-line bg-card p-4">
      <h2 className="text-lg font-semibold">
        Temporada {season.number}. {season.name}
        {season.current ? "" : " · última con datos"}
      </h2>
      <p className="mt-2">
        {season.correct === 1 ? "1 acierto" : `${season.correct} aciertos`} de {season.attempted}. Precisión {String(accuracy).replace(".", ",")} %.
      </p>
      <p className="mt-1 text-sm text-muted">Estas cifras se reinician al pasar de temporada. Los récords de arriba no.</p>
    </section>
  );
}

function BaselineNow({
  report,
  currentLevel,
  accuracy,
}: {
  report: Progress["diagnostics"][number]["report"];
  currentLevel: number;
  accuracy: number;
}) {
  const data = report && typeof report === "object" && !Array.isArray(report) ? report : null;
  const level = typeof data?.level === "number" ? data.level : null;
  const speed = typeof data?.speedLabel === "string" ? data.speedLabel : null;
  const weak = Array.isArray(data?.weak) ? data.weak.filter((item): item is string => typeof item === "string") : [];
  return (
    <p className="mt-2 text-sm">
      El diagnóstico original estimó el nivel {level ?? "—"}.
      {speed ? ` Velocidad inicial: ${speed}.` : ""} Hoy el nivel de práctica es {currentLevel} y la precisión histórica es {String(accuracy).replace(".", ",")} %.
      {weak.length ? ` Entonces flojeaban: ${weak.join(", ")}.` : ""}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function monthName(month: number) {
  return ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][month - 1] ?? "";
}

function labelMode(mode: string) {
  if (mode === "daily") return "reto";
  if (mode === "free") return "libre";
  if (mode === "clock") return "reloj";
  if (mode === "lab") return "laboratorio";
  if (mode === "diagnostic") return "diagnóstico";
  return mode;
}

function Calendar({
  year,
  month,
  today,
  days,
}: {
  year: number;
  month: number;
  today: string;
  days: Progress["calendar"];
}) {
  const map = new Map(days.map((day) => [day.date, day]));
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<number | null> = [...Array(offset).fill(null)];
  for (let day = 1; day <= count; day += 1) cells.push(day);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {["L", "M", "X", "J", "V", "S", "D"].map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <div key={`e-${index}`} />;
          const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const info = map.get(iso);
          const practiced = Boolean(info && (info.freePracticed || info.clockPracticed || info.labPracticed || info.attempted > 0));
          return (
            <div
              key={iso}
              className={`min-h-12 rounded-lg border p-1 text-left text-xs ${
                info?.dailyCompleted ? "border-accent bg-accent-2" : practiced ? "border-line bg-card" : "border-transparent"
              } ${iso === today ? "ring-1 ring-accent" : ""}`}
            >
              <span>{day}</span>
              {info?.dailyCompleted && <span className="mt-1 block">D {info.bestDailyCorrect || ""}</span>}
              {!info?.dailyCompleted && practiced && <span className="mt-1 block text-muted">P</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function aggregate(rows: Progress["byKind"]) {
  const map = new Map<string, { label: string; correct: number; attempted: number }>();
  for (const row of rows) {
    const cur = map.get(row.kind) ?? { label: row.label, correct: 0, attempted: 0 };
    cur.correct += row.correct;
    cur.attempted += row.attempted;
    map.set(row.kind, cur);
  }
  return [...map.values()].map((row) => ({
    label: row.label,
    accuracy: row.attempted ? Math.round((row.correct / row.attempted) * 100) : 0,
  }));
}
