import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Clock, LineChart, Sigma, Timer, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useBoot } from "@/components/boot";

const LINKS = [
  { to: "/reto", label: "Reto", icon: Timer },
  { to: "/libre", label: "Libre", icon: Sigma },
  { to: "/reloj", label: "Reloj", icon: Clock },
  { to: "/laboratorio", label: "Laboratorio", icon: BookOpen },
  { to: "/progreso", label: "Progreso", icon: LineChart },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { boot } = useBoot();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="min-w-0">
            <span className="block text-xs uppercase tracking-[0.22em] text-muted">Cálculo mental</span>
            <span className="text-xl font-semibold tracking-tight">Cifra</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Secciones">
            {LINKS.map((link) => {
              const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${active ? "nav-active" : "text-ink"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/cuenta"
              className={`hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium md:inline-flex ${pathname === "/cuenta" ? "nav-active" : ""}`}
            >
              Cuenta
            </Link>
            <Link to="/cuenta" className="grid h-11 w-11 place-items-center rounded-full border border-line md:hidden" aria-label="Cuenta">
              <UserRound size={18} />
            </Link>
            <div className="hidden md:block">
              <UserButton />
            </div>
            <span className="hidden text-sm text-muted lg:inline">Nivel {boot.level}</span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper md:hidden" aria-label="Secciones">
        <ul className="grid grid-cols-5">
          {LINKS.map((link) => {
            const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
            const Icon = link.icon;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${active ? "text-accent" : "text-muted"}`}
                >
                  <Icon size={18} aria-hidden />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
