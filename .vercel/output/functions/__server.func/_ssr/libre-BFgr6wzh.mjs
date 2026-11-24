import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as varietyLowerBound, a as LEVEL_NAME, i as LEVEL_HINT, m as formatVariety, n as KIND_LABEL } from "./engine-BJ3P1mPN.mjs";
import { d as startSession, t as declineDiagnostic } from "./training-1zuZf7E1.mjs";
import { n as useBoot } from "./boot-0OAGXx07.mjs";
import { t as Player } from "./player-BBvS2jZC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/libre-BFgr6wzh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var OPS = [
	"add",
	"sub",
	"mul",
	"div",
	"pow",
	"root",
	"combo"
];
function LibrePage() {
	const { boot, reload } = useBoot();
	const [kinds, setKinds] = (0, import_react.useState)(["add", "sub"]);
	const [level, setLevel] = (0, import_react.useState)(boot.level);
	const [count, setCount] = (0, import_react.useState)(20);
	const [weights, setWeights] = (0, import_react.useState)({});
	const [sessionId, setSessionId] = (0, import_react.useState)(boot.activeFreeId);
	const [error, setError] = (0, import_react.useState)(null);
	function toggle(kind) {
		setKinds((current) => current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind]);
	}
	if (!boot.diagnosticDone) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Modo libre"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "El nivel de partida sale del diagnóstico. Puedes saltarlo y quedarte en nivel 1." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/diagnostico",
				className: "inline-flex rounded-xl bg-accent px-4 py-3 text-paper",
				children: "Hacer diagnóstico"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-3 rounded-xl border border-line px-4 py-3",
				onClick: () => void declineDiagnostic().then(reload),
				children: "Empezar en nivel 1"
			})
		]
	});
	if (sessionId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
		sessionId,
		sound: boot.soundOn,
		onLeave: () => setSessionId(null),
		onChange: () => void reload()
	});
	const variety = kinds.reduce((sum, kind) => sum + varietyLowerBound(kind, level), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Modo libre"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Sin reloj obligatorio. Cada ejercicio nuevo consulta tu historial antes de mostrarse."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-sm font-medium",
					children: "Operaciones"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [OPS.map((kind) => {
						const on = kinds.includes(kind);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": on,
							onClick: () => toggle(kind),
							className: `min-h-11 rounded-full border px-4 py-2 text-sm ${on ? "border-accent bg-accent-2" : "border-line"}`,
							children: KIND_LABEL[kind]
						}, kind);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-full border border-line px-4 py-2 text-sm",
						onClick: () => setKinds(OPS),
						children: "Todas"
					})]
				})]
			}),
			kinds.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-sm font-medium",
					children: "Proporción (0 a 5)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid gap-2 sm:grid-cols-2",
					children: kinds.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [KIND_LABEL[kind], /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 0,
							max: 5,
							value: weights[kind] ?? 1,
							onChange: (event) => setWeights({
								...weights,
								[kind]: Number(event.target.value)
							}),
							className: "w-20 rounded-lg border border-line bg-card px-2 py-2"
						})]
					}, kind))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "text-sm font-medium",
						children: "Dificultad"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-4 gap-2",
						children: [
							1,
							2,
							3,
							4
						].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": level === value,
							onClick: () => setLevel(value),
							className: `min-h-11 rounded-xl border px-1 text-sm ${level === value ? "border-accent bg-accent-2" : "border-line"}`,
							children: LEVEL_NAME[value]
						}, value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							LEVEL_HINT[level],
							" La exigencia no es la misma en una suma que en una raíz. Combinaciones de partida: ",
							formatVariety(variety),
							", y el generador amplía el rango si ese conjunto se agota."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-sm font-medium",
					children: "Cantidad"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [
						10,
						20,
						50,
						"continuous"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": count === value,
						onClick: () => setCount(value),
						className: `min-h-11 rounded-xl border px-4 ${count === value ? "border-accent bg-accent-2" : "border-line"}`,
						children: value === "continuous" ? "Continua" : value
					}, String(value)))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper",
				onClick: () => {
					setError(null);
					startSession({ data: {
						mode: "free",
						kinds,
						level,
						count: count === "continuous" ? null : count,
						weights
					} }).then((session) => setSessionId(session.id)).catch((err) => setError(err instanceof Error ? err.message : "No pude empezar."));
				},
				children: "Practicar"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-wrong",
				children: error
			})
		]
	});
}
//#endregion
export { LibrePage as component };
