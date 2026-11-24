import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as startSession, t as declineDiagnostic } from "./training-1zuZf7E1.mjs";
import { n as useBoot } from "./boot-0OAGXx07.mjs";
import { t as Player } from "./player-BBvS2jZC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reto-DAZeGPjK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RetoPage() {
	const { boot, reload } = useBoot();
	const [sessionId, setSessionId] = (0, import_react.useState)(boot.activeDailyId);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function begin() {
		setBusy(true);
		setError(null);
		try {
			const session = await startSession({ data: { mode: "daily" } });
			setSessionId(session.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "No pude empezar el reto.");
		} finally {
			setBusy(false);
		}
	}
	if (!boot.diagnosticDone) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Reto diario"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Antes del primer nivel hace falta el diagnóstico, o una decisión explícita de empezar por lo básico." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/diagnostico",
					className: "rounded-xl bg-accent px-4 py-3 text-paper",
					children: "Hacer diagnóstico"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-xl border border-line px-4 py-3",
					onClick: () => void declineDiagnostic().then(reload),
					children: "Empezar en nivel 1"
				})]
			})
		]
	});
	if (!sessionId) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm uppercase tracking-widest text-muted",
				children: "10:00"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-4xl font-semibold",
				children: "Reto del día"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "El tiempo corre en el servidor. Recargar, cambiar de sección o cerrar el navegador no regala minutos: la sesión se recupera donde estaba."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: busy,
				className: "mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper",
				onClick: () => void begin(),
				children: busy ? "Abriendo…" : "Comenzar"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-wrong",
				children: error
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
		sessionId,
		sound: boot.soundOn,
		onLeave: () => {
			setSessionId(null);
			reload();
		},
		onChange: () => void reload()
	});
}
//#endregion
export { RetoPage as component };
