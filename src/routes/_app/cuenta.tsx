import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useBoot } from "@/components/boot";
import { UserButton } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { deleteMyData, exportStats, updateSettings } from "@/lib/server/training";

export const Route = createFileRoute("/_app/cuenta")({ component: AccountPage });

const ZONES = [
  "Europe/Madrid",
  "Atlantic/Canary",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/Montevideo",
  "America/Caracas",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "UTC",
];

function AccountPage() {
  const { boot, reload } = useBoot();
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zones = browserZone && !ZONES.includes(browserZone) ? [browserZone, ...ZONES] : ZONES;
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="max-w-xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Cuenta</h1>
        <div className="mt-4">
          <UserButton />
        </div>
        <button type="button" className="mt-3 text-sm text-muted underline-offset-4 hover:underline md:hidden" onClick={() => void signOut()}>
          Cerrar sesión
        </button>
      </header>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void updateSettings({
            data: {
              timezone: String(form.get("timezone") ?? boot.timezone),
              theme: String(form.get("theme") ?? boot.theme),
              soundOn: form.get("sound") === "on",
            },
          })
            .then(() => reload())
            .then(() => setMessage("Preferencias guardadas. No afectan a la medición de los récords."))
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudo guardar."));
        }}
      >
        <label className="block text-sm">
          Zona horaria del reto
          <select name="timezone" defaultValue={boot.timezone} className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3">
            {zones.map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm">Apariencia</legend>
          <div className="mt-2 flex gap-2">
            <label className="min-h-11 flex-1 rounded-xl border border-line px-3 py-3">
              <input type="radio" name="theme" value="paper" defaultChecked={boot.theme === "paper"} className="mr-2" />
              Papel
            </label>
            <label className="min-h-11 flex-1 rounded-xl border border-line px-3 py-3">
              <input type="radio" name="theme" value="ink" defaultChecked={boot.theme === "ink"} className="mr-2" />
              Tinta
            </label>
          </div>
        </fieldset>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" name="sound" value="on" defaultChecked={boot.soundOn} />
          Sonido breve al responder. Viene apagado.
        </label>
        <button type="submit" className="min-h-11 rounded-xl bg-accent px-4 py-3 text-paper">Guardar</button>
      </form>

      <div>
        <h2 className="text-lg font-semibold">Exportar</h2>
        <p className="mt-1 text-sm text-muted">Descarga estadísticas, récords, días y los últimos intentos. No incluye la cuenta de acceso.</p>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-xl border border-line px-4 py-3"
          onClick={() => {
            void exportStats()
              .then((data) => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "cifra-estadisticas.json";
                link.click();
                URL.revokeObjectURL(url);
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudo exportar."));
          }}
        >
          Descargar JSON
        </button>
      </div>

      <div className="rounded-2xl border border-wrong p-4">
        <h2 className="text-lg font-semibold">Eliminar datos de entrenamiento</h2>
        <p className="mt-1 text-sm">
          Borra perfil, historial, récords, calendario y lecciones de esta cuenta. No se puede deshacer. La identidad de acceso puede seguir existiendo para volver a entrar.
        </p>
        <label className="mt-3 block text-sm">
          Escribe BORRAR
          <input value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3" />
        </label>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-xl bg-wrong px-4 py-3 text-paper"
          onClick={() => {
            setError(null);
            void deleteMyData({ data: { confirm } })
              .then(() => reload())
              .then(() => {
                setConfirm("");
                setMessage("Datos de entrenamiento eliminados.");
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudo borrar."));
          }}
        >
          Eliminar mis datos
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {error && <p className="text-wrong">{error}</p>}
    </section>
  );
}
