import { useEffect, useRef, useState } from "react";
import { finishSession, getReview, getSession, skipExercise, submitAnswer, type SessionView } from "@/lib/server/training";
import { KIND_LABEL, LEVEL_NAME, type Kind, type Level } from "@/lib/math/engine";

type Grade = {
  correct: boolean | null;
  solutionText: string | null;
  explain: string | null;
  responseMs: number | null;
  duplicate: boolean;
  prompt: string;
};

type ReviewItem = {
  label: string;
  prompt: string;
  given: string;
  expected: string;
  explain: string;
  responseMs: number;
};

function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function countLabel(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function formatSeconds(ms: number) {
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

function beep(ok: boolean) {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = ok ? 660 : 196;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.07);
  window.setTimeout(() => void ctx.close(), 300);
}

export function Player({
  sessionId,
  sound,
  onLeave,
  onChange,
  onSession,
}: {
  sessionId: string;
  sound: boolean;
  onLeave?: () => void;
  onChange?: () => void;
  onSession?: (session: SessionView) => void;
}) {
  const [session, setSession] = useState<SessionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [review, setReview] = useState<ReviewItem[] | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const offsetRef = useRef(0);
  const serverNowSeen = useRef("");

  function publish(next: SessionView) {
    setSession(next);
    onSession?.(next);
    return next;
  }

  async function refresh() {
    const next = await getSession({ data: { id: sessionId } });
    publish(next);
    return next;
  }

  useEffect(() => {
    let cancelled = false;
    void refresh()
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No pude abrir la sesión.");
      });
    return () => {
      cancelled = true;
    };
    // sessionId is the only identity of this run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (!session || session.status !== "active") return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [session?.status, session?.id]);

  const offset = (() => {
    if (!session) return 0;
    if (session.serverNow !== serverNowSeen.current) {
      serverNowSeen.current = session.serverNow;
      offsetRef.current = new Date(session.serverNow).getTime() - Date.now();
    }
    return offsetRef.current;
  })();
  const elapsedMs = session
    ? Math.max(0, now + offset - new Date(session.startedAt).getTime())
    : 0;
  const remaining =
    session?.durationMs != null ? Math.max(0, session.durationMs - elapsedMs) : null;

  useEffect(() => {
    if (!session || session.status !== "active" || session.durationMs == null || remaining == null || remaining > 0) {
      return;
    }
    const id = window.setInterval(() => {
      void refresh()
        .then((next) => {
          if (next.status !== "active") onChange?.();
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Error al cerrar el tiempo."));
    }, 1000);
    return () => window.clearInterval(id);
  }, [session?.id, session?.status, remaining === 0]);

  useEffect(() => {
    if (session?.status === "active") inputRef.current?.focus();
  }, [session?.current?.signature, session?.status]);

  useEffect(() => {
    if (session?.status !== "completed") return;
    void getReview({ data: { id: sessionId } })
      .then(setReview)
      .catch(() => setReview([]));
    onChange?.();
  }, [session?.status, sessionId]);

  async function send(skip: boolean) {
    if (!session || session.status !== "active" || busy) return;
    if (!skip && !answer.trim()) return;
    setBusy(true);
    setError(null);
    setConfirmEnd(false);
    const token = crypto.randomUUID();
    const prompt = session.current?.prompt ?? "";
    try {
      const result = skip
        ? await skipExercise({ data: { sessionId, token } })
        : await submitAnswer({ data: { sessionId, token, answer } });
      setSession(result.session);
      onSession?.(result.session);
      if (!result.duplicate && result.correct !== null) {
        setGrade({ ...result, prompt });
        if (sound) beep(result.correct);
      } else if (skip) {
        setGrade(null);
      }
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la respuesta.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  if (error && !session) {
    return (
      <div className="rounded-2xl border border-line bg-card p-6">
        <p>{error}</p>
        <button type="button" className="mt-4 rounded-xl bg-accent px-4 py-3 text-paper" onClick={() => void refresh()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!session) {
    return <div className="h-48 animate-pulse rounded-2xl bg-paper-2" aria-busy="true" />;
  }

  if (session.status === "completed") {
    const result = (session.result ?? {}) as {
      full?: boolean;
      accuracy?: number;
      avgCorrectMs?: number | null;
      records?: { label: string; value: number; key: string }[];
      reason?: string;
    };
    const accuracy = session.attempted ? Math.round((session.correct / session.attempted) * 1000) / 10 : 0;
    const avgMs = session.attempted ? Math.round(session.sumResponseMs / session.attempted) : null;
    const elapsedDone = session.finishedAt
      ? new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()
      : 0;
    const rate =
      session.mode === "daily" && elapsedDone > 0 ? (session.correct / elapsedDone) * 60000 : null;
    return (
      <section className="space-y-6">
        <header>
          <p className="text-sm uppercase tracking-widest text-muted">Sesión cerrada</p>
          <h1 className="mt-1 text-3xl font-semibold">
            {countLabel(session.correct, "acierto", "aciertos")} de {session.attempted}
          </h1>
          <p className="mt-2 text-muted">
            Precisión {String(accuracy).replace(".", ",")} %.
            {avgMs != null ? ` Media ${formatSeconds(avgMs)}.` : ""}
            {rate != null ? ` Ritmo ${rate.toFixed(1).replace(".", ",")} aciertos/min.` : ""}
            {session.incorrect > 0 ? ` ${countLabel(session.incorrect, "error", "errores")}.` : " Sin errores respondidos."}
            {session.abandoned > 0 ? ` ${countLabel(session.abandoned, "pasada", "pasadas")}, fuera de la precisión.` : ""}
          </p>
          {session.mode === "daily" && (
            <p className="mt-2 text-sm">
              {result.full || session.countsForStreak
                ? "Sesión completa de 10 minutos. Opta a récords."
                : "Sesión terminada antes de tiempo. Queda en el historial, pero no opta a récords de 10 minutos ni a la racha."}
            </p>
          )}
          {session.mode === "diagnostic" && result.reason === "incomplete" && (
            <p className="mt-2 text-sm">
              Saliste antes de las 12 respuestas. Este intento no crea ni sustituye el diagnóstico original.
            </p>
          )}
        </header>
        {result.records && result.records.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {result.records.map((record) => (
              <li key={record.key} className="rounded-xl border border-line bg-accent-2 px-4 py-3">
                <p className="text-sm text-muted">Nuevo récord</p>
                <p className="font-medium">{record.label}</p>
                <p className="font-mono text-lg">{formatRecord(record.key, record.value)}</p>
              </li>
            ))}
          </ul>
        )}
        {review && review.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold">Errores para revisar</h2>
            <ul className="mt-3 space-y-3">
              {review.map((item) => (
                <li key={`${item.prompt}-${item.given}`} className="rounded-xl border border-line bg-card p-4">
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="expr mt-1 text-2xl">{item.prompt}</p>
                  <p className="mt-2">
                    Escribiste <span className="font-mono">{item.given || "—"}</span>. Correcto:{" "}
                    <span className="font-mono">{item.expected}</span>.
                  </p>
                  {item.explain && <p className="mt-2 text-sm text-muted">{item.explain}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {review && review.length === 0 && session.incorrect === 0 && session.attempted > 0 && (
          <p className="text-muted">No hay errores que revisar en esta sesión.</p>
        )}
        {onLeave && (
          <button type="button" className="rounded-xl border border-line px-4 py-3" onClick={onLeave}>
            Volver
          </button>
        )}
      </section>
    );
  }

  const current = session.current;
  const live = session.correct + session.incorrect;
  const accuracyNow = session.attempted ? Math.round((session.correct / session.attempted) * 100) : null;
  const avgNow = session.attempted ? session.sumResponseMs / session.attempted : null;
  const rateNow =
    session.durationMs != null && elapsedMs >= 5000 ? (session.correct / elapsedMs) * 60000 : null;
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <p className="text-sm text-muted" aria-live="polite">
          {countLabel(session.correct, "acierto", "aciertos")} · {countLabel(session.incorrect, "error", "errores")}
          {session.abandoned > 0 ? ` · ${countLabel(session.abandoned, "pasada", "pasadas")}` : ""}
          {session.mode === "diagnostic" ? ` · ${session.attempted}/12` : ""}
          {session.config.count ? ` · ${session.attempted}/${session.config.count}` : ""}
          {accuracyNow != null ? ` · ${accuracyNow} %` : ""}
          {avgNow != null ? ` · ${formatSeconds(avgNow)}` : ""}
          {rateNow != null ? ` · ${rateNow.toFixed(1).replace(".", ",")} aciertos/min` : ""}
        </p>
        {remaining != null && (
          <p className="font-mono text-3xl tabular-nums" aria-label={`Tiempo restante ${formatClock(remaining)}`}>
            {formatClock(remaining)}
          </p>
        )}
      </div>
      {grade && !grade.duplicate && (
        <p
          className={`mb-4 rounded-xl px-4 py-3 ${grade.correct ? "bg-accent-2 text-ink" : "bg-wrong-bg text-wrong"}`}
          role="status"
        >
          <span className="font-medium">{grade.correct ? "Correcto" : "Incorrecto"}</span>
          {grade.prompt ? <span className="expr ml-2 text-base">{grade.prompt}</span> : null}
          {grade.responseMs != null ? ` · ${formatSeconds(grade.responseMs)}` : ""}
          {!grade.correct && session.mode !== "daily" && session.mode !== "diagnostic" && grade.solutionText
            ? ` · la respuesta era ${grade.solutionText}`
            : ""}
          {!grade.correct && (session.mode === "daily" || session.mode === "diagnostic")
            ? " · la corrección queda para el final."
            : ""}
          {session.mode !== "daily" && session.mode !== "diagnostic" && grade.explain ? ` ${grade.explain}` : ""}
        </p>
      )}
      {current ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(false);
          }}
          className="rounded-2xl border border-line bg-card p-5 sm:p-8"
        >
          <p className="text-sm text-muted">
            {KIND_LABEL[current.kind as Kind] ?? current.kind} · {LEVEL_NAME[current.level as Level] ?? `nivel ${current.level}`}
          </p>
          <p className="expr mt-4 text-4xl sm:text-6xl">{current.prompt}</p>
          <label className="mt-8 block">
            <span className="text-sm text-muted">{current.answerLabel}</span>
            <span className="mt-2 flex gap-2">
              <input
                ref={inputRef}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                inputMode={current.input === "int" ? "decimal" : "text"}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="done"
                aria-label="Respuesta"
                className="w-full rounded-xl border border-line bg-paper px-4 py-4 font-mono text-2xl"
              />
              {current.input === "int" && (
                <button
                  type="button"
                  className="min-h-11 min-w-14 rounded-xl border border-line px-3 font-mono text-2xl"
                  aria-label="Cambiar signo"
                  onClick={() =>
                    setAnswer((currentValue) => {
                      const trimmed = currentValue.trim();
                      if (trimmed.startsWith("-") || trimmed.startsWith("−")) return trimmed.slice(1);
                      return trimmed ? `-${trimmed}` : "-";
                    })
                  }
                >
                  ±
                </button>
              )}
            </span>
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !answer.trim()} className="min-h-11 rounded-xl bg-accent px-5 py-3 font-medium text-paper disabled:opacity-50">
              Comprobar
            </button>
            <button type="button" disabled={busy} className="min-h-11 rounded-xl border border-line px-4 py-3" onClick={() => void send(true)}>
              Pasar
            </button>
            {!confirmEnd ? (
              <button type="button" className="min-h-11 rounded-xl px-4 py-3 text-muted" onClick={() => setConfirmEnd(true)}>
                Terminar
              </button>
            ) : (
              <button
                type="button"
                className="min-h-11 rounded-xl border border-wrong px-4 py-3 text-wrong"
                onClick={() => void finishSession({ data: { id: sessionId } }).then((next) => publish(next)).then(() => onChange?.())}
              >
                {session.mode === "daily"
                  ? "Sí, cerrar sin récord"
                  : session.mode === "diagnostic"
                    ? "Sí, salir sin guardar el diagnóstico"
                    : "Sí, terminar"}
              </button>
            )}
          </div>
          {error && <p className="mt-3 text-wrong">{error}</p>}
          <p className="mt-4 text-xs text-muted">
            {live === 0 ? "Escribe la respuesta y pulsa Enter." : "La precisión usa solo ejercicios respondidos, no los pasados."}
          </p>
        </form>
      ) : (
        <p>Preparando el siguiente ejercicio…</p>
      )}
    </section>
  );
}

function formatRecord(key: string, value: number) {
  if (key.includes("accuracy")) return `${value.toFixed(1).replace(".", ",")} %`;
  if (key.includes("avg_correct")) return formatSeconds(value);
  if (key === "best_streak") return `${Math.round(value)} días`;
  return String(Math.round(value));
}
