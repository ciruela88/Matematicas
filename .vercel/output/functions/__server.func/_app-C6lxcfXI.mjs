import { b as Link, g as Outlet, p as useRouterState, w as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as useCurrentUserState, n as useBoot, t as BootProvider } from "./_ssr/boot-0OAGXx07.mjs";
import { n as UserButton, t as RedirectToSignIn } from "./_ssr/gates-C92060AB.mjs";
import { a as Clock, i as Sigma, o as ChartLine, r as Timer, s as BookOpen, t as UserRound } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-C6lxcfXI.js
var import_jsx_runtime = require_jsx_runtime();
var LINKS = [
	{
		to: "/reto",
		label: "Reto",
		icon: Timer
	},
	{
		to: "/libre",
		label: "Libre",
		icon: Sigma
	},
	{
		to: "/reloj",
		label: "Reloj",
		icon: Clock
	},
	{
		to: "/laboratorio",
		label: "Laboratorio",
		icon: BookOpen
	},
	{
		to: "/progreso",
		label: "Progreso",
		icon: ChartLine
	}
];
function Shell({ children }) {
	const { boot } = useBoot();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-24 md:pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs uppercase tracking-[0.22em] text-muted",
								children: "Cálculo mental"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xl font-semibold tracking-tight",
								children: "Cifra"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "hidden items-center gap-1 md:flex",
							"aria-label": "Secciones",
							children: LINKS.map((link) => {
								const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: link.to,
									className: `rounded-lg px-3 py-2 text-sm font-medium ${active ? "nav-active" : "text-ink"}`,
									children: link.label
								}, link.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/cuenta",
									className: `hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium md:inline-flex ${pathname === "/cuenta" ? "nav-active" : ""}`,
									children: "Cuenta"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/cuenta",
									className: "grid h-11 w-11 place-items-center rounded-full border border-line md:hidden",
									"aria-label": "Cuenta",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { size: 18 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden md:block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden text-sm text-muted lg:inline",
									children: ["Nivel ", boot.level]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-5xl px-4 py-6",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper md:hidden",
				"aria-label": "Secciones",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-5",
					children: LINKS.map((link) => {
						const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
						const Icon = link.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: link.to,
							className: `flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${active ? "text-accent" : "text-muted"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								size: 18,
								"aria-hidden": true
							}), link.label]
						}) }, link.to);
					})
				})
			})
		]
	});
}
function AppLayout() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-5 py-10",
		"aria-busy": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm uppercase tracking-widest text-muted",
			children: "Cifra"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-lg",
			children: "Cargando tu sesión…"
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) });
}
//#endregion
export { AppLayout as component };
