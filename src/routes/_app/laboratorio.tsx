import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LESSONS } from "@/lib/content/lessons";
import { getLab } from "@/lib/server/training";

export const Route = createFileRoute("/_app/laboratorio")({ component: LabIndex });

function LabIndex() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getLab>>>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void getLab()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No pude cargar el progreso."));
  }, []);
  const progress = new Map(rows.map((row) => [row.id, row]));
  return (
    <section>
      <h1 className="text-3xl font-semibold">Laboratorio</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Diez técnicas cortas. Cada una trae el método, ejemplos resueltos, errores típicos, práctica escrita y un test de tres preguntas.
      </p>
      {error && <p className="mt-3 text-wrong">{error}</p>}
      <ol className="mt-6 space-y-3">
        {LESSONS.map((lesson, index) => {
          const row = progress.get(lesson.id);
          const started = Boolean(row && (row.practiceAttempted > 0 || row.quizScore != null));
          return (
            <li key={lesson.id}>
              <Link to="/laboratorio/$lessonId" params={{ lessonId: lesson.id }} className="block rounded-2xl border border-line bg-card p-4">
                <p className="text-sm text-muted">
                  {index + 1}
                  {row?.mastered ? " · dominio" : started ? ` · práctica ${row?.practiceCorrect}/${row?.practiceAttempted}` : ""}
                </p>
                <h2 className="text-lg font-semibold">{lesson.title}</h2>
                <p className="text-sm text-muted">{lesson.summary}</p>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
