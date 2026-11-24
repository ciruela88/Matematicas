import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BootProvider } from "@/components/boot";
import { Shell } from "@/components/shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10" aria-busy="true">
        <p className="text-sm uppercase tracking-widest text-muted">Cifra</p>
        <p className="mt-3 text-lg">Cargando tu sesión…</p>
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <BootProvider>
      <Shell>
        <Outlet />
      </Shell>
    </BootProvider>
  );
}
