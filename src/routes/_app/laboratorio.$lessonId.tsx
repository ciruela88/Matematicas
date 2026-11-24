import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useBoot } from "@/components/boot";
import { Player } from "@/components/player";
import { getLesson } from "@/lib/content/lessons";
import { getLab, startSession } from "@/lib/server/training";

export const Route = createFileRoute("/_app/laboratorio/$lessonId")({ component: LessonPage });

function LessonPage() {
  const { lessonId } = Route.useParams();
  const lesson = getLesson(lessonId);
  const { boot, reload } = useBoot();
  const [sessionId, setSessionId] = useState<string | null>(
    boot.activeLab?.lessonId === lessonId ? boot.activeLab.id : null,
  );
  const [quiz, setQuiz] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getLab()
      .then((rows) => {
        const row = rows.find((item) => item.id === lessonId);
        if (!row) return;
        const quizText = row.quizScore == null ? "test pendiente" : `test ${row.quizScore}/${row.quizTotal}`;
        setProgress(`${row.practiceCorrect} aciertos en ${row.practiceAttempted} de práctica · ${quizText}${row.mastered ? " · dominio" : ""}`);
      })
      .catch(() => undefined);
  }, [lessonId, sessionId]);

  if (!lesson) {
    return (
      <p>
        Esa lección no existe. <Link to="/laboratorio">Volver</Link>
      </p>
    );
  }

  if (sessionId) {
    return (
      <div>
        <p className="mb-4 text-sm text-muted">{quiz ? "Test de dominio" : "Práctica"} · {lesson.title}</p>
        <Player
          sessionId={sessionId}
          sound={boot.soundOn}
          onLeave={() => {
            setSessionId(null);
            void reload();
          }}
          onChange={() => void reload()}
        />
      </div>
    );
  }

  return (
    <article className="max-w-2xl">
      <Link to="/laboratorio" className="text-sm text-muted">Laboratorio</Link>
      <h1 className="mt-2 text-3xl font-semibold">{lesson.title}</h1>
      <p className="mt-2">{lesson.summary}</p>
      {progress && <p className="mt-2 text-sm text-accent">{progress}</p>}
      <h2 className="mt-6 text-lg font-semibold">Método</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5">
        {lesson.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h2 className="mt-6 text-lg font-semibold">Ejemplos resueltos</h2>
      <div className="mt-2 space-y-3">
        {lesson.examples.map((example) => (
          <section key={example.problem} className="rounded-2xl border border-line bg-card p-4">
            <p className="expr text-2xl">{example.problem}</p>
            <ol className="mt-2 list-decimal pl-5 text-sm">
              {example.walkthrough.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <p className="mt-2 font-medium">Resultado: {example.answer}</p>
          </section>
        ))}
      </div>
      <h2 className="mt-6 text-lg font-semibold">Errores típicos</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {lesson.mistakes.map((mistake) => (
          <li key={mistake}>{mistake}</li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">{lesson.practice.note}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-11 rounded-xl bg-accent px-4 py-3 text-paper"
          onClick={() => {
            setQuiz(false);
            void startSession({ data: { mode: "lab", lessonId: lesson.id, quiz: false } })
              .then((session) => setSessionId(session.id))
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "No pude abrir la práctica."));
          }}
        >
          Practicar 4 ejercicios
        </button>
        <button
          type="button"
          className="min-h-11 rounded-xl border border-line px-4 py-3"
          onClick={() => {
            setQuiz(true);
            void startSession({ data: { mode: "lab", lessonId: lesson.id, quiz: true } })
              .then((session) => setSessionId(session.id))
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "No pude abrir el test."));
          }}
        >
          Test de dominio
        </button>
      </div>
      {error && <p className="mt-3 text-wrong">{error}</p>}
    </article>
  );
}
