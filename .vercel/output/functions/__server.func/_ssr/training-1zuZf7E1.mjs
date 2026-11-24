import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { S as safeTimeZone, g as getLesson, s as authMiddleware } from "./engine-BJ3P1mPN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/training-1zuZf7E1.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var KINDS = /* @__PURE__ */ new Set([
	"add",
	"sub",
	"mul",
	"div",
	"pow",
	"root",
	"combo",
	"time_add",
	"time_sub",
	"clock_future",
	"clock_past",
	"conv_24_12",
	"conv_12_24"
]);
function num(value) {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : 0;
}
function clampLevel(value) {
	const n = Math.round(num(value));
	if (n <= 1) return 1;
	if (n >= 4) return 4;
	return n;
}
function parseStart(data) {
	if (!data || typeof data !== "object") throw new Error("Datos inválidos.");
	const d = data;
	const mode = d.mode;
	if (mode === "daily" || mode === "diagnostic") return { mode };
	if (mode === "free") {
		const kinds = Array.isArray(d.kinds) ? d.kinds.filter((k) => typeof k === "string" && KINDS.has(k)) : [];
		if (!kinds.length) throw new Error("Elige al menos una operación.");
		const weights = {};
		if (d.weights && typeof d.weights === "object") for (const kind of kinds) weights[kind] = Math.max(0, Math.min(5, num(d.weights[kind] ?? 1)));
		const count = d.count == null || d.count === "continuous" ? null : Math.round(num(d.count));
		if (count != null && (count < 1 || count > 200)) throw new Error("La cantidad debe estar entre 1 y 200, o ser continua.");
		return {
			mode,
			kinds,
			level: clampLevel(d.level),
			count,
			weights
		};
	}
	if (mode === "clock") {
		const submode = d.submode === "clock12" || d.submode === "convert" ? d.submode : "arith";
		const count = d.count == null || d.count === "continuous" ? null : Math.round(num(d.count));
		if (count != null && (count < 1 || count > 200)) throw new Error("La cantidad debe estar entre 1 y 200, o ser continua.");
		return {
			mode,
			submode,
			level: clampLevel(d.level),
			count
		};
	}
	if (mode === "lab") {
		const lesson = getLesson(String(d.lessonId ?? ""));
		if (!lesson) throw new Error("Lección desconocida.");
		const quiz = Boolean(d.quiz);
		return {
			mode,
			lessonId: lesson.id,
			quiz,
			kinds: lesson.practice.kinds,
			level: lesson.practice.level,
			count: quiz ? 3 : 4
		};
	}
	throw new Error("Modo desconocido.");
}
var getBootstrap = createServerFn({ method: "POST" }).validator((data) => ({ timezone: safeTimeZone(data?.timezone) })).middleware([authMiddleware]).handler(createSsrRpc("6b5c591ba38e4721502fee7df2cffa933b975ed1ba9b727be4b27023021435a4"));
var updateSettings = createServerFn({ method: "POST" }).validator((data) => data ?? {}).middleware([authMiddleware]).handler(createSsrRpc("39eb7b92a3f86d39ac463c19e04b1b65c360a391e8297851d022809739c5a413"));
var declineDiagnostic = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("8cb4c14539c2a0d5075b0f9cff1e3e3ad7fb88bd9060c87f906d2c607d8b7cc8"));
var startSession = createServerFn({ method: "POST" }).validator((data) => parseStart(data)).middleware([authMiddleware]).handler(createSsrRpc("217e43f96295bab60290aa1c99496945d23a9c88c4038ba08b0bc12b37817d8a"));
var getSession = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.id || typeof data.id !== "string") throw new Error("Sesión inválida.");
	return { id: data.id };
}).middleware([authMiddleware]).handler(createSsrRpc("144206c01acafbaac51ead2f4bb338d990e8d651e7e099399fc7bfc4d08e5eb7"));
var finishSession = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.id) throw new Error("Sesión inválida.");
	return { id: data.id };
}).middleware([authMiddleware]).handler(createSsrRpc("a805b89625d79bd973d620e34e734fa7a2b2ff30a208f3284f9d37f9cf9bd4d4"));
var submitAnswer = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.sessionId || !data.token || data.token.length < 8 || data.token.length > 80) throw new Error("Envío inválido.");
	return {
		sessionId: data.sessionId,
		token: data.token,
		answer: String(data.answer ?? "").slice(0, 80)
	};
}).middleware([authMiddleware]).handler(createSsrRpc("f6712816f442ba1f5ebd2ba1a09ce5dedf161a9693df1439594a613392dab510"));
var skipExercise = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.sessionId || !data?.token || data.token.length < 8) throw new Error("Envío inválido.");
	return data;
}).middleware([authMiddleware]).handler(createSsrRpc("d16716bdc6196fd9f5707f219b4992a902014c934e929e66819cb7a081246e9f"));
var getReview = createServerFn({ method: "POST" }).validator((data) => ({ id: String(data?.id ?? "") })).middleware([authMiddleware]).handler(createSsrRpc("3ecbdba8b96bde998d45bb8b4aa0901159b1ff17bf96e082684dbac6b4218e4b"));
var getProgress = createServerFn({ method: "POST" }).validator((data) => data ?? {}).middleware([authMiddleware]).handler(createSsrRpc("8923fa6afd151d214875fd4dc019dcaee85504ceeb3ed1a539c4de4161cbe5e8"));
var getLab = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("cae066dbe26e416afa3ebd5b292dfe683907c9bd36cd4a3f4aaab49044527a48"));
var exportStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c894b3592f2291b5523a2408f853f29265faf4d7e4ebaadded7a8111d1d9919b"));
var deleteMyData = createServerFn({ method: "POST" }).validator((data) => {
	if (data?.confirm !== "BORRAR") throw new Error("Escribe BORRAR para confirmar.");
	return data;
}).middleware([authMiddleware]).handler(createSsrRpc("12651c08f57ac87cf45b347e712c6ddf5592f581a614ed79cb6a9c0bf30dab04"));
//#endregion
export { getBootstrap as a, getReview as c, startSession as d, submitAnswer as f, finishSession as i, getSession as l, deleteMyData as n, getLab as o, updateSettings as p, exportStats as r, getProgress as s, declineDiagnostic as t, skipExercise as u };
