import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as LEVEL_NAME } from "./engine-BJ3P1mPN.mjs";
import { d as startSession } from "./training-1zuZf7E1.mjs";
import { n as useBoot } from "./boot-0OAGXx07.mjs";
import { t as Player } from "./player-BBvS2jZC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reloj-BXk2DmvM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MODES = [
	{
		id: "arith",
		title: "Horas, minutos y segundos",
		text: "Sumas y restas sexagesimales, con llevadas y préstamos."
	},
	{
		id: "clock12",
		title: "Reloj de 12 horas",
		text: "Qué hora será o qué hora era, con mediodía y medianoche."
	},
	{
		id: "convert",
		title: "24 h y 12 h",
		text: "00:00 es medianoche. 12:00 es mediodía."
	}
];
function RelojPage() {
	const { boot, reload } = useBoot();
	const [submode, setSubmode] = (0, import_react.useState)("arith");
	const [level, setLevel] = (0, import_react.useState)(1);
	const [count, setCount] = (0, import_react.useState)(15);
	const [sessionId, setSessionId] = (0, import_react.useState)(boot.activeClockId);
	const [error, setError] = (0, import_react.useState)(null);
	if (sessionId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
		sessionId,
		sound: boot.soundOn,
		onLeave: () => setSessionId(null),
		onChange: () => void reload()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Reloj y tiempo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "La corrección compara la hora o la duración, no un texto único. 2:35 p. m. y 14:35 son la misma hora."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-2",
				children: MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": submode === mode.id,
					onClick: () => setSubmode(mode.id),
					className: `block w-full rounded-2xl border p-4 text-left ${submode === mode.id ? "border-accent bg-accent-2" : "border-line bg-card"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: mode.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: mode.text
					})]
				}, mode.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-4 gap-2",
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-2",
				children: [
					10,
					15,
					null
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": count === value,
					onClick: () => setCount(value),
					className: `min-h-11 rounded-xl border px-4 ${count === value ? "border-accent bg-accent-2" : "border-line"}`,
					children: value == null ? "Continua" : `${value}`
				}, String(value)))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-6 min-h-12 rounded-xl bg-accent px-5 py-3 font-medium text-paper",
				onClick: () => {
					startSession({ data: {
						mode: "clock",
						submode,
						level,
						count
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
export { RelojPage as component };
