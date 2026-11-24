import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as LESSONS } from "./engine-BJ3P1mPN.mjs";
import { o as getLab } from "./training-1zuZf7E1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/laboratorio-BSxQZg0q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LabIndex() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getLab().then(setRows).catch((err) => setError(err instanceof Error ? err.message : "No pude cargar el progreso."));
	}, []);
	const progress = new Map(rows.map((row) => [row.id, row]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Laboratorio"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-2xl text-muted",
			children: "Diez técnicas cortas. Cada una trae el método, ejemplos resueltos, errores típicos, práctica escrita y un test de tres preguntas."
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-wrong",
			children: error
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-6 space-y-3",
			children: LESSONS.map((lesson, index) => {
				const row = progress.get(lesson.id);
				const started = Boolean(row && (row.practiceAttempted > 0 || row.quizScore != null));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/laboratorio/$lessonId",
					params: { lessonId: lesson.id },
					className: "block rounded-2xl border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [index + 1, row?.mastered ? " · dominio" : started ? ` · práctica ${row?.practiceCorrect}/${row?.practiceAttempted}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: lesson.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: lesson.summary
						})
					]
				}) }, lesson.id);
			})
		})
	] });
}
//#endregion
export { LabIndex as component };
