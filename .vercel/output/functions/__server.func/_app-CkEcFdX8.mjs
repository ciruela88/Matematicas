import { b as Link, w as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
import { D as varietyLowerBound, a as LEVEL_NAME, m as formatVariety } from "./_ssr/engine-BJ3P1mPN.mjs";
import { p as updateSettings } from "./_ssr/training-1zuZf7E1.mjs";
import { n as useBoot } from "./_ssr/boot-0OAGXx07.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-CkEcFdX8.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { boot, reload } = useBoot();
	const showSeason = boot.seasonSeen < boot.season.number;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: ["Temporada ", boot.season.number]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl font-semibold tracking-tight",
					children: boot.season.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-muted",
					children: boot.season.blurb
				})
			] }),
			showSeason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-semibold",
						children: ["Empieza la temporada ", boot.season.number]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 list-disc space-y-1 pl-5 text-sm",
						children: boot.season.changes.map((change) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: change }, change))
					}),
					boot.previousSeason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"La temporada ",
							boot.previousSeason.number,
							" queda archivada. Los récords históricos no se borran."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 rounded-xl bg-accent px-4 py-3 text-paper",
						onClick: () => void updateSettings({ data: { seenSeason: true } }).then(reload),
						children: "Entendido"
					})
				]
			}),
			!boot.diagnosticDone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-accent bg-accent-2 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Diagnóstico inicial"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: "Doce ejercicios, sin opciones múltiples. Mide precisión, tiempo y tipo de operación antes de fijar tu nivel. El resultado original se conserva aunque lo repitas más adelante."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/diagnostico",
						className: "mt-4 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-3 text-paper",
						children: boot.activeDiagnosticId ? "Continuar diagnóstico" : "Empezar diagnóstico"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: ["Reto de hoy · ", boot.today]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-5xl",
							children: boot.streak.current
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								boot.streak.current === 1 ? "día de racha." : "días de racha.",
								" Mejor marca: ",
								boot.streak.best,
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm",
							children: boot.todayStats.dailyCompleted ? `Reto completado. Hoy ${boot.todayStats.correct} aciertos de ${boot.todayStats.attempted}.` : boot.activeDailyId ? "Hay un reto en curso. El cronómetro no se reinicia." : !boot.diagnosticDone ? "Diez minutos en cuanto cierres el diagnóstico. El tiempo corre en el servidor y no se reinicia al recargar." : "Diez minutos. Entras, pulsas comenzar y calculas."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/reto",
							className: "mt-4 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-3 font-medium text-paper",
							children: boot.activeDailyId ? "Continuar reto" : "Empezar reto"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Nivel estimado"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-5xl font-semibold",
							children: LEVEL_NAME[boot.level]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "No sube por acumular ejercicios fáciles. Hace falta precisión y ritmo en el nivel anterior, y el nivel 4 exige varias operaciones."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm",
							children: [
								"Ejercicios ya mostrados y que no volverán: ",
								boot.seenCount,
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Solo en sumas de nivel 4 hay ",
								formatVariety(varietyLowerBound("add", 4)),
								" de combinaciones, antes de ampliar rangos."
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/libre",
						className: "rounded-2xl border border-line bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Modo libre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Elige operación, nivel y cantidad."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/reloj",
						className: "rounded-2xl border border-line bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Reloj"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Horas, minutos, segundos y 12/24 h."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/laboratorio",
						className: "rounded-2xl border border-line bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Laboratorio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Métodos para calcular, no definiciones."
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { Home as component };
