import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({ email, password, name: name || email, callbackURL: "/" })
          : await authClient.signIn.email({ email, password, callbackURL: "/" });
      if (result.error) {
        setError(result.error.message ?? "No se pudo entrar.");
        setBusy(false);
        return;
      }
      void navigate({ to: "/" });
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5 py-12">
      <div className="w-full">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Cálculo mental</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Cifra</h1>
        <p className="mt-3 text-muted">
          La misma cuenta guarda récords, rachas y el historial de ejercicios en cualquier dispositivo.
        </p>
        {authEnabled ? (
          <>
            <div className="mt-8 space-y-2">
              {GROK_PROVIDERS.map((provider) => (
                <button
                  key={provider.providerId}
                  type="button"
                  className="min-h-11 w-full rounded-xl border border-line bg-card px-4 py-3 text-left font-medium"
                  onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}
                >
                  Continuar con {provider.label}
                </button>
              ))}
            </div>
            <p className="my-6 text-center text-sm text-muted">o con correo</p>
            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "up" && (
                <label className="block text-sm">
                  Nombre
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3"
                    autoComplete="name"
                  />
                </label>
              )}
              <label className="block text-sm">
                Correo
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3"
                  autoComplete="email"
                />
              </label>
              <label className="block text-sm">
                Contraseña
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3"
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                />
              </label>
              {error && <p className="text-sm text-wrong">{error}</p>}
              <button type="submit" disabled={busy} className="min-h-11 w-full rounded-xl bg-accent px-4 py-3 font-medium text-paper disabled:opacity-60">
                {busy ? "Entrando…" : mode === "up" ? "Crear cuenta" : "Entrar"}
              </button>
            </form>
            <button
              type="button"
              className="mt-4 text-sm text-muted underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "up" ? "in" : "up")}
            >
              {mode === "up" ? "Ya tengo cuenta" : "Crear una cuenta con correo"}
            </button>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted">El acceso está desactivado.</p>
        )}
      </div>
    </main>
  );
}
