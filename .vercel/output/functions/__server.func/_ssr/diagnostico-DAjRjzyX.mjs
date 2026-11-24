import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as KIND_LABEL } from "./engine-BJ3P1mPN.mjs";
import { d as startSession } from "./training-1zuZf7E1.mjs";
import { n as useBoot } from "./boot-0OAGXx07.mjs";
import { t as Player } from "./player-BBvS2jZC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diagnostico-DAjRjzyX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DiagnosticPage() {
	const { boot, reload } = useBoot();
	const [sessionId, setSessionId] = (0, import_react.useState)(boot.activeDiagnosticId);
	const [report, setReport] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	function capture(session) {
		const stored = session.result?.report;
		if (session.status === "completed" && stored) setReport(stored);
	}
	if (sessionId && !report) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "mb-4 text-2xl font-semibold",
		children: "Diagnóstico"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
		sessionId,
		sound: boot.soundOn,
		onSession: (session) => {
			capture(session);
			if (session.status === "completed") reload();
		},
		onLeave: () => {
			setSessionId(null);
			reload();
		}
	})] });
	if (report) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-2xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm uppercase tracking-widest text-muted",
				children: "Informe"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-4xl font-semibold",
				children: ["Nivel ", report.level]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Velocidad ",
				report.speedLabel,
				". Mediana ",
				Math.round(report.medianMs / 100) / 10,
				" s por ejercicio."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Mejor encaje"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: report.mastered.length ? report.mastered.join(", ") : "Todavía sin una operación estable."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Rendimiento bajo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: report.weak.length ? report.weak.join(", ") : "Ninguna operación quedó por debajo del umbral."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: Object.entries(report.perKind).map(([kind, level]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between border-b border-line py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: KIND_LABEL[kind] ?? kind }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["nivel ", level] })]
				}, kind))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Qué hacer ahora"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 list-disc space-y-1 pl-5",
				children: report.recommendations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: boot.hasBaseline ? "Este resultado no sustituye el diagnóstico original. La comparación está en Progreso." : "Este informe queda guardado como diagnóstico original."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rounded-xl border border-line px-4 py-3",
				onClick: () => {
					setReport(null);
					setSessionId(null);
				},
				children: "Cerrar"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Examen diagnóstico"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "Doce respuestas escritas. Empieza por sumas y restas y sube si la base aguanta. El nivel no sale solo del número de aciertos: también cuentan el tiempo y la operación."
			}),
			boot.hasBaseline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				children: "Ya existe un diagnóstico original. Repetirlo mide el cambio y no lo borra."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper",
				onClick: () => {
					startSession({ data: { mode: "diagnostic" } }).then((session) => {
						capture(session);
						setSessionId(session.id);
					}).catch((err) => setError(err instanceof Error ? err.message : "No pude empezar."));
				},
				children: boot.activeDiagnosticId ? "Continuar diagnóstico" : "Comenzar"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-wrong",
				children: error
			})
		]
	});
}
//#endregion
export { DiagnosticPage as component };
