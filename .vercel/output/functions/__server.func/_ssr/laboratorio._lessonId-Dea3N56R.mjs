import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as getLesson } from "./engine-BJ3P1mPN.mjs";
import { d as startSession, o as getLab } from "./training-1zuZf7E1.mjs";
import { n as useBoot } from "./boot-0OAGXx07.mjs";
import { t as Player } from "./player-BBvS2jZC.mjs";
import { n as Route$1 } from "./router-D04pYjf4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/laboratorio._lessonId-Dea3N56R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LessonPage() {
	const { lessonId } = Route$1.useParams();
	const lesson = getLesson(lessonId);
	const { boot, reload } = useBoot();
	const [sessionId, setSessionId] = (0, import_react.useState)(boot.activeLab?.lessonId === lessonId ? boot.activeLab.id : null);
	const [quiz, setQuiz] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getLab().then((rows) => {
			const row = rows.find((item) => item.id === lessonId);
			if (!row) return;
			const quizText = row.quizScore == null ? "test pendiente" : `test ${row.quizScore}/${row.quizTotal}`;
			setProgress(`${row.practiceCorrect} aciertos en ${row.practiceAttempted} de práctica · ${quizText}${row.mastered ? " · dominio" : ""}`);
		}).catch(() => void 0);
	}, [lessonId, sessionId]);
	if (!lesson) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Esa lección no existe. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/laboratorio",
		children: "Volver"
	})] });
	if (sessionId) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mb-4 text-sm text-muted",
		children: [
			quiz ? "Test de dominio" : "Práctica",
			" · ",
			lesson.title
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
		sessionId,
		sound: boot.soundOn,
		onLeave: () => {
			setSessionId(null);
			reload();
		},
		onChange: () => void reload()
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/laboratorio",
				className: "text-sm text-muted",
				children: "Laboratorio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl font-semibold",
				children: lesson.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2",
				children: lesson.summary
			}),
			progress && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-accent",
				children: progress
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-lg font-semibold",
				children: "Método"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-2 list-decimal space-y-2 pl-5",
				children: lesson.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: step }, step))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-lg font-semibold",
				children: "Ejemplos resueltos"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-3",
				children: lesson.examples.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "expr text-2xl",
							children: example.problem
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-2 list-decimal pl-5 text-sm",
							children: example.walkthrough.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-medium",
							children: ["Resultado: ", example.answer]
						})
					]
				}, example.problem))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-lg font-semibold",
				children: "Errores típicos"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 list-disc space-y-1 pl-5",
				children: lesson.mistakes.map((mistake) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: mistake }, mistake))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted",
				children: lesson.practice.note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-xl bg-accent px-4 py-3 text-paper",
					onClick: () => {
						setQuiz(false);
						startSession({ data: {
							mode: "lab",
							lessonId: lesson.id,
							quiz: false
						} }).then((session) => setSessionId(session.id)).catch((err) => setError(err instanceof Error ? err.message : "No pude abrir la práctica."));
					},
					children: "Practicar 4 ejercicios"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-xl border border-line px-4 py-3",
					onClick: () => {
						setQuiz(true);
						startSession({ data: {
							mode: "lab",
							lessonId: lesson.id,
							quiz: true
						} }).then((session) => setSessionId(session.id)).catch((err) => setError(err instanceof Error ? err.message : "No pude abrir el test."));
					},
					children: "Test de dominio"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-wrong",
				children: error
			})
		]
	});
}
//#endregion
export { LessonPage as component };
