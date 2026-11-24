import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine-BJ3P1mPN.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-1vAx-gM_.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-FnyV0lrj.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var LESSONS = [
	{
		id: "descomposicion",
		title: "Descomposición numérica",
		summary: "Separa un número en unidades, decenas, centenas y millares para sumar o restar por partes.",
		steps: [
			"Escribe el número como suma de órdenes: 47 = 40 + 7.",
			"Opera primero las decenas y después las unidades.",
			"Recompón el resultado. Si las unidades pasan de 9, ajusta una decena."
		],
		examples: [{
			problem: "47 + 38",
			walkthrough: ["47 + 30 = 77", "77 + 8 = 85"],
			answer: "85"
		}, {
			problem: "256 − 40",
			walkthrough: [
				"200 + 56 − 40",
				"56 − 40 = 16",
				"200 + 16 = 216"
			],
			answer: "216"
		}],
		mistakes: ["Descomponer y olvidar una de las partes.", "Sumar las decenas como si fueran unidades: 40 + 30 no es 7."],
		practice: {
			kinds: ["add", "sub"],
			level: 2,
			note: "Descompón cada vez. No mires el resultado de un salto."
		}
	},
	{
		id: "complementos",
		title: "Complementos y números redondos",
		summary: "Si un número está cerca de 10, 100 o 1000, completa y compensa.",
		steps: [
			"Detecta la distancia al redondo: 198 está a 2 de 200.",
			"Suma o resta el redondo, que es fácil.",
			"Compensa en sentido contrario lo que añadiste o quitaste de más."
		],
		examples: [{
			problem: "198 + 47",
			walkthrough: [
				"198 = 200 − 2",
				"200 + 47 = 247",
				"247 − 2 = 245"
			],
			answer: "245"
		}, {
			problem: "1000 − 64",
			walkthrough: ["El complemento de 64 a 100 es 36", "1000 − 64 = 936"],
			answer: "936"
		}],
		mistakes: ["Compensar en la misma dirección y alejarse más del redondo.", "Calcular mal la distancia: 198 está a 2 de 200, no a 12."],
		practice: {
			kinds: ["add", "sub"],
			level: 2,
			note: "Elige el redondo antes de calcular."
		}
	},
	{
		id: "sumas-restas",
		title: "Sumas y restas eficientes",
		summary: "Compensación, agrupación y diferencia entre números cercanos.",
		steps: [
			"Si sumas y restas lo mismo, el resultado no cambia: 49 + 18 = 50 + 17.",
			"Agrupa términos que completen 10 o 100.",
			"Entre números cercanos, cuenta el salto, no restes cifra a cifra."
		],
		examples: [{
			problem: "49 + 18",
			walkthrough: ["Pasa 1 de 18 a 49", "50 + 17 = 67"],
			answer: "67"
		}, {
			problem: "403 − 398",
			walkthrough: [
				"De 398 a 400 van 2",
				"De 400 a 403 van 3",
				"2 + 3 = 5"
			],
			answer: "5"
		}],
		mistakes: ["Compensar solo un sumando.", "En la resta cercana, restar mal el préstamo de centenas cuando el salto es de unas pocas unidades."],
		practice: {
			kinds: ["add", "sub"],
			level: 3,
			note: "Antes de escribir, decide si conviene descomponer, compensar o contar el salto."
		}
	},
	{
		id: "multiplicacion",
		title: "Multiplicación mental",
		summary: "Distributiva, cercanía a un redondo, dobles y mitades.",
		steps: [
			"Parte un factor: 17 × 6 = (10 × 6) + (7 × 6).",
			"Si está cerca de una decena, multiplica el redondo y corrige.",
			"Multiplicar por 4 es doblar dos veces. Por 5, la mitad de multiplicar por 10."
		],
		examples: [{
			problem: "17 × 6",
			walkthrough: [
				"10 × 6 = 60",
				"7 × 6 = 42",
				"60 + 42 = 102"
			],
			answer: "102"
		}, {
			problem: "49 × 8",
			walkthrough: [
				"50 × 8 = 400",
				"Sobra 1 × 8",
				"400 − 8 = 392"
			],
			answer: "392"
		}],
		mistakes: ["Aplicar la corrección al revés: 49 × 8 no es 400 + 8.", "Olvidar una parte al distribuir."],
		practice: {
			kinds: ["mul"],
			level: 2,
			note: "Di en voz baja la descomposición antes de sumar los productos parciales."
		}
	},
	{
		id: "division",
		title: "División mental",
		summary: "La división exacta es una multiplicación al revés.",
		steps: [
			"Pregunta: ¿qué número por el divisor da el dividendo?",
			"Si el dividendo es grande, pártelo en trozos divisibles.",
			"Comprueba al final: cociente × divisor debe recuperar el dividendo."
		],
		examples: [{
			problem: "144 ÷ 12",
			walkthrough: [
				"12 × 10 = 120",
				"Faltan 24, que son 12 × 2",
				"10 + 2 = 12"
			],
			answer: "12"
		}, {
			problem: "936 ÷ 18",
			walkthrough: [
				"18 × 50 = 900",
				"Quedan 36 = 18 × 2",
				"50 + 2 = 52"
			],
			answer: "52"
		}],
		mistakes: ["Parar en el primer múltiplo cercano y no ajustar el resto.", "Confundir el cociente con el resto."],
		practice: {
			kinds: ["div"],
			level: 2,
			note: "Todas las divisiones de Cifra son exactas. Si no cae entero, revisa el producto."
		}
	},
	{
		id: "potencias",
		title: "Potencias y raíces",
		summary: "Cuadrados, cubos y la relación inversa con las raíces exactas.",
		steps: [
			"Memoriza cuadrados hasta 15 y cubos hasta 10. Son herramientas, no adorno.",
			"Cerca de una decena: (n + d)² = n² + 2nd + d².",
			"Una raíz exacta se comprueba elevando el resultado."
		],
		examples: [{
			problem: "23²",
			walkthrough: [
				"20² = 400",
				"2 × 20 × 3 = 120",
				"3² = 9",
				"400 + 120 + 9 = 529"
			],
			answer: "529"
		}, {
			problem: "√625",
			walkthrough: [
				"20² = 400, 30² = 900",
				"25² = 625",
				"La raíz es 25"
			],
			answer: "25"
		}],
		mistakes: ["Hacer (a + b)² = a² + b² y perder el doble producto.", "Aceptar una raíz aproximada. Aquí solo valen raíces enteras."],
		practice: {
			kinds: ["pow", "root"],
			level: 2,
			note: "Comprueba cada raíz elevando el candidato."
		}
	},
	{
		id: "jerarquia",
		title: "Jerarquía de operaciones",
		summary: "Paréntesis, potencias y raíces, productos y cocientes, sumas y restas.",
		steps: [
			"Resuelve primero lo que está entre paréntesis.",
			"Después potencias y raíces, de dentro hacia fuera.",
			"Luego multiplicaciones y divisiones, de izquierda a derecha.",
			"Al final sumas y restas, también de izquierda a derecha."
		],
		examples: [{
			problem: "2 + 3 × 4",
			walkthrough: [
				"No es (2 + 3) × 4",
				"3 × 4 = 12",
				"2 + 12 = 14"
			],
			answer: "14"
		}, {
			problem: "(8 − 2) × (3 + 1)",
			walkthrough: [
				"8 − 2 = 6",
				"3 + 1 = 4",
				"6 × 4 = 24"
			],
			answer: "24"
		}],
		mistakes: ["Operar de izquierda a derecha sin mirar la prioridad.", "Hacer la resta antes que el producto que está a su lado."],
		practice: {
			kinds: ["combo"],
			level: 2,
			note: "Subraya mentalmente el primer paso antes de calcular."
		}
	},
	{
		id: "patrones",
		title: "Reconocimiento de patrones",
		summary: "Diferencia de cuadrados, números consecutivos y simetrías.",
		steps: [
			"a² − b² = (a − b)(a + b). A veces evita multiplicar los cuadrados.",
			"n × (n + 1) es el producto de consecutivos: termina en cifras predecibles y es par.",
			"Si ves un redondo disfrazado, nómbralo antes de operar."
		],
		examples: [{
			problem: "15² − 5²",
			walkthrough: ["(15 − 5) × (15 + 5)", "10 × 20 = 200"],
			answer: "200"
		}, {
			problem: "25 × 25",
			walkthrough: ["(20 + 5)² = 400 + 200 + 25", "625"],
			answer: "625"
		}],
		mistakes: ["Forzar un patrón que no está: 15² − 5 no es diferencia de cuadrados.", "Cambiar el signo al factorizar."],
		practice: {
			kinds: ["combo", "pow"],
			level: 3,
			note: "Si no ves un patrón en tres segundos, calcula por la jerarquía normal. El patrón es un atajo, no una obligación."
		}
	},
	{
		id: "rapidez",
		title: "Estrategias de rapidez",
		summary: "Elegir el camino, no hacer más rápido un camino malo.",
		steps: [
			"Mira la operación un instante y elige: descomponer, compensar, agrupar o invertir.",
			"No cambies de método a mitad del cálculo.",
			"La rapidez útil es la que mantiene la precisión por encima del 90 %."
		],
		examples: [{
			problem: "99 × 7",
			walkthrough: ["100 × 7 − 7", "700 − 7 = 693"],
			answer: "693"
		}, {
			problem: "64 ÷ 8",
			walkthrough: ["Es la tabla inversa de 8 × 8", "No hace falta partir 64"],
			answer: "8"
		}],
		mistakes: ["Empezar a calcular antes de elegir el método y luego rehacerlo.", "Perseguir velocidad con operaciones que aún fallas: primero precisión, después ritmo."],
		practice: {
			kinds: [
				"add",
				"sub",
				"mul",
				"div"
			],
			level: 2,
			note: "En cada ejercicio, nombra el método en una palabra y luego calcula."
		}
	},
	{
		id: "errores",
		title: "Diagnóstico y corrección de errores",
		summary: "El error repetido es un método defectuoso, no una falta de talento.",
		steps: [
			"Clasifica el fallo: llevada, préstamo, prioridad, tabla o compensación al revés.",
			"Vuelve al nivel en el que ese fallo casi desaparece.",
			"Repite una serie corta del mismo tipo. Sube solo cuando la precisión se sostenga."
		],
		examples: [{
			problem: "70 − 28, préstamo mal resuelto",
			walkthrough: [
				"0 − 8 no se puede",
				"La decena presta 10",
				"10 − 8 = 2, y 6 − 2 = 4",
				"42"
			],
			answer: "42"
		}, {
			problem: "6 + 4 × 5, prioridad",
			walkthrough: ["El producto va primero: 20", "6 + 20 = 26, no 50"],
			answer: "26"
		}],
		mistakes: ["Subir de nivel para «compensar» un error de base.", "Mirar la solución y seguir sin rehacer el ejercicio con el método correcto."],
		practice: {
			kinds: [
				"add",
				"sub",
				"mul",
				"div",
				"combo"
			],
			level: 1,
			note: "Después de un fallo, reescribe el primer paso correcto antes de pasar al siguiente."
		}
	}
];
function getLesson(id) {
	return LESSONS.find((lesson) => lesson.id === id);
}
var LEVEL_NAME = {
	1: "Básico",
	2: "Intermedio",
	3: "Avanzado",
	4: "Experto"
};
var LEVEL_HINT = {
	1: "Números pequeños, tablas, divisiones exactas cortas y cuadrados perfectos.",
	2: "Dos y tres cifras, cocientes más largos y potencias que conviene reconocer.",
	3: "Varias cifras, operaciones combinadas, cubos y raíces exactas.",
	4: "Rangos amplios, varios pasos y varios resultados intermedios en la memoria."
};
var KIND_LABEL = {
	add: "Suma",
	sub: "Resta",
	mul: "Multiplicación",
	div: "División exacta",
	pow: "Potencia",
	root: "Raíz exacta",
	combo: "Operación combinada",
	time_add: "Suma de tiempo",
	time_sub: "Resta de tiempo",
	clock_future: "Hora futura",
	clock_past: "Hora anterior",
	conv_24_12: "De 24 h a 12 h",
	conv_12_24: "De 12 h a 24 h"
};
function cryptoRng() {
	return () => {
		const buf = /* @__PURE__ */ new Uint32Array(1);
		crypto.getRandomValues(buf);
		return buf[0] / 4294967296;
	};
}
function ri(rng, min, max) {
	const lo = Math.min(min, max);
	const hi = Math.max(min, max);
	return lo + Math.floor(rng() * (hi - lo + 1));
}
function pick(rng, items) {
	return items[Math.floor(rng() * items.length)];
}
function formatInt(n) {
	const neg = n < 0;
	const grouped = String(Math.abs(Math.trunc(n))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	return neg ? `−${grouped}` : grouped;
}
var SUP_DIGITS = [
	"⁰",
	"¹",
	"²",
	"³",
	"⁴",
	"⁵",
	"⁶",
	"⁷",
	"⁸",
	"⁹"
];
function sup(n) {
	return String(Math.abs(Math.trunc(n))).split("").map((d) => SUP_DIGITS[Number(d)] ?? d).join("");
}
function ipow(base, exp) {
	if (!Number.isInteger(base) || !Number.isInteger(exp) || exp < 0 || exp > 12) return null;
	let r = 1;
	for (let i = 0; i < exp; i += 1) {
		r *= base;
		if (!Number.isSafeInteger(r) || Math.abs(r) > 2e5) return null;
	}
	return r;
}
function integerRoot(index, radicand) {
	if (!Number.isInteger(radicand) || radicand < 0 || index < 2 || index > 4) return null;
	if (radicand === 0) return 0;
	const guess = Math.round(Math.pow(radicand, 1 / index));
	for (const c of [
		guess - 1,
		guess,
		guess + 1
	]) if (c >= 0 && ipow(c, index) === radicand) return c;
	return null;
}
function evalNode(n) {
	if (n.t === "n") return Number.isInteger(n.v) ? n.v : null;
	if (n.t === "root") {
		const inner = evalNode(n.a);
		if (inner == null) return null;
		return integerRoot(n.i, inner);
	}
	const x = evalNode(n.a);
	const y = evalNode(n.b);
	if (x == null || y == null) return null;
	if (n.t === "add") return x + y;
	if (n.t === "sub") return x - y;
	if (n.t === "mul") return x * y;
	if (n.t === "div") {
		if (y === 0 || x % y !== 0) return null;
		return x / y;
	}
	return ipow(x, y);
}
function sigNode(n) {
	if (n.t === "n") return `#${n.v}`;
	if (n.t === "root") return `r${n.i}(${sigNode(n.a)})`;
	if (n.t === "add" || n.t === "mul") {
		const parts = [sigNode(n.a), sigNode(n.b)].sort();
		return `${n.t}(${parts[0]},${parts[1]})`;
	}
	return `${n.t}(${sigNode(n.a)},${sigNode(n.b)})`;
}
function fmtNum(n) {
	return formatInt(n);
}
function dispAt(n, parentPrec, side, parentOp) {
	if (n.t === "n") return fmtNum(n.v);
	if (n.t === "root") return maybeParen((n.i === 2 ? "√" : n.i === 3 ? "∛" : "∜") + (n.a.t === "n" && n.a.v >= 0 ? fmtNum(n.a.v) : `(${dispAt(n.a, 0, "l", "")})`), 4, parentPrec, side, parentOp);
	if (n.t === "pow" && n.b.t === "n" && n.b.v >= 0 && n.b.v < 20) return maybeParen((n.a.t === "n" && n.a.v >= 0 ? fmtNum(n.a.v) : `(${dispAt(n.a, 0, "l", "")})`) + sup(n.b.v), 4, parentPrec, side, parentOp);
	if (n.t === "pow") return maybeParen(`${dispAt(n.a, 3, "l", "pow")} ^ ${dispAt(n.b, 3, "r", "pow")}`, 3, parentPrec, side, parentOp);
	const p = n.t === "mul" || n.t === "div" ? 2 : 1;
	const op = n.t === "add" ? " + " : n.t === "sub" ? " − " : n.t === "mul" ? " × " : " ÷ ";
	return maybeParen(`${dispAt(n.a, p, "l", n.t)}${op}${dispAt(n.b, p, "r", n.t)}`, p, parentPrec, side, parentOp);
}
function maybeParen(body, prec, parentPrec, side, parentOp) {
	if (prec < parentPrec) return `(${body})`;
	if (prec === parentPrec && side === "r" && (parentOp === "sub" || parentOp === "div")) return `(${body})`;
	return body;
}
function displayNode(n) {
	return dispAt(n, 0, "l", "");
}
var SUP_INDEX = "⁰¹²³⁴⁵⁶⁷⁸⁹";
/** Interpreta el texto que ve el usuario. Sirve para verificar el enunciado. */
function parsePrompt(src) {
	let i = 0;
	const s = src.trim();
	function skip() {
		while (s[i] === " ") i += 1;
	}
	function parseExpr() {
		let left = parseTerm();
		for (;;) {
			skip();
			if (s[i] === "+") {
				i += 1;
				left = {
					t: "add",
					a: left,
					b: parseTerm()
				};
			} else if (s[i] === "−" || s[i] === "-") {
				i += 1;
				left = {
					t: "sub",
					a: left,
					b: parseTerm()
				};
			} else break;
		}
		return left;
	}
	function parseTerm() {
		let left = parseFactor();
		for (;;) {
			skip();
			if (s[i] === "×") {
				i += 1;
				left = {
					t: "mul",
					a: left,
					b: parseFactor()
				};
			} else if (s[i] === "÷") {
				i += 1;
				left = {
					t: "div",
					a: left,
					b: parseFactor()
				};
			} else break;
		}
		return left;
	}
	function parseFactor() {
		skip();
		if (s[i] === "−" || s[i] === "-") {
			const prev = s[i - 1];
			const unary = i === 0 || prev === "(" || prev === " " || "+−-×÷".includes(prev ?? "");
			const next = s[i + 1] ?? "";
			if (unary && next !== " " && next !== "") {
				i += 1;
				return {
					t: "sub",
					a: {
						t: "n",
						v: 0
					},
					b: parseFactor()
				};
			}
		}
		return parsePow();
	}
	function parsePow() {
		const base = parseAtom();
		const exp = readSup();
		if (exp == null) return base;
		return {
			t: "pow",
			a: base,
			b: {
				t: "n",
				v: exp
			}
		};
	}
	function readSup() {
		if (!s[i] || !SUP_INDEX.includes(s[i])) return null;
		let num = "";
		while (s[i] && SUP_INDEX.includes(s[i])) {
			num += String(SUP_INDEX.indexOf(s[i]));
			i += 1;
		}
		return Number(num);
	}
	function parseAtom() {
		skip();
		const ch = s[i];
		if (ch === "(") {
			i += 1;
			const e = parseExpr();
			skip();
			if (s[i] !== ")") throw new Error("falta paréntesis");
			i += 1;
			return e;
		}
		if (ch === "√" || ch === "∛" || ch === "∜") {
			i += 1;
			return {
				t: "root",
				i: ch === "√" ? 2 : ch === "∛" ? 3 : 4,
				a: parseAtom()
			};
		}
		const m = /^[\d\u202f]+/.exec(s.slice(i));
		if (!m) throw new Error(`no entiendo «${s.slice(i, i + 12)}»`);
		i += m[0].length;
		return {
			t: "n",
			v: Number(m[0].replace(/\u202f/g, ""))
		};
	}
	const node = parseExpr();
	skip();
	if (i !== s.length) throw new Error(`sobra «${s.slice(i)}»`);
	return node;
}
function valueOfPrompt(prompt) {
	return evalNode(parsePrompt(prompt));
}
function parseIntegerAnswer(raw) {
	let s = raw.trim().replace(/\u2212/g, "-").replace(/\u2013/g, "-").replace(/\s+/g, "");
	s = s.replace(/\u202f/g, "");
	if (s.startsWith("+")) s = s.slice(1);
	if (/^\d+$/.test(s)) return Number(s);
	if (/^-\d+$/.test(s)) return Number(s);
	const neg = s.startsWith("-");
	const body = neg ? s.slice(1) : s;
	if (/^\d{1,3}(\.\d{3})+$/.test(body)) {
		const n = Number(body.replace(/\./g, ""));
		return neg ? -n : n;
	}
	if (/^\d{1,3}(,\d{3})+$/.test(body)) {
		const n = Number(body.replace(/,/g, ""));
		return neg ? -n : n;
	}
	return null;
}
function parseDuration(raw, colon) {
	let s = raw.trim().toLowerCase().replace(/\u2212/g, "-").replace(/\./g, "").replace(/segundos|segundo/g, "s").replace(/minutos|minuto/g, "min").replace(/horas|hora/g, "h").replace(/segs\b|seg\b/g, "s").replace(/\s+/g, " ").trim();
	if (!s || s.includes("-")) return null;
	if (/^\d+$/.test(s)) {
		const n = Number(s);
		if (colon === "hm") return n * 60;
		return n;
	}
	const hms = s.match(/^(\d+):(\d+):(\d+)$/);
	if (hms) return Number(hms[1]) * 3600 + Number(hms[2]) * 60 + Number(hms[3]);
	const hm = s.match(/^(\d+):(\d+)$/);
	if (hm) {
		const a = Number(hm[1]);
		const b = Number(hm[2]);
		if (colon === "hm") return a * 3600 + b * 60;
		return a * 60 + b;
	}
	let h = 0;
	let m = 0;
	let sec = 0;
	let any = false;
	const consumed = s.replace(/(\d+)\s*(h|min|m|s)\b/g, (full, num, unit) => {
		any = true;
		const n = Number(num);
		if (unit === "h") h += n;
		else if (unit === "min" || unit === "m") m += n;
		else sec += n;
		return "";
	});
	if (any && consumed.trim() === "") return h * 3600 + m * 60 + sec;
	return null;
}
/** Minutos desde medianoche, o null si el texto no es una hora inequívoca. */
function parseClock(raw) {
	let s = raw.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
	if (s === "mediodia" || s === "mediodía") return 720;
	if (s === "medianoche") return 0;
	let period = null;
	if (/p\s*m\b/.test(s) || /tarde|noche/.test(s)) period = "pm";
	else if (/a\s*m\b/.test(s) || /mañana/.test(s)) period = "am";
	s = s.replace(/de la mañana|mañana|de la tarde|de la noche|tarde|noche|mediod[ií]a|medianoche/g, " ").replace(/[ap]\s*m\b/g, " ").replace(/\s+/g, " ").trim();
	const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
	if (!m) return null;
	const hourPart = m[1] ?? "";
	const h = Number(hourPart);
	const min = Number(m[2]);
	const sec = m[3] ? Number(m[3]) : 0;
	if (min > 59 || sec !== 0) return null;
	if (period) {
		if (h < 1 || h > 12) return null;
		let hh = h % 12;
		if (period === "pm") hh += 12;
		return hh * 60 + min;
	}
	if (hourPart.length === 2 && h <= 23) return h * 60 + min;
	return null;
}
function formatClock(minutes, style) {
	const m = (minutes % 1440 + 1440) % 1440;
	const h = Math.floor(m / 60);
	const min = m % 60;
	const mm = String(min).padStart(2, "0");
	if (style === "24") return `${String(h).padStart(2, "0")}:${mm}`;
	const period = h >= 12 ? "p. m." : "a. m.";
	return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${period}`;
}
function formatDuration(seconds, colon) {
	const s = Math.max(0, Math.trunc(seconds));
	if (colon === "hm") {
		const h = Math.floor(s / 3600);
		const m = Math.floor(s % 3600 / 60);
		return `${h}:${String(m).padStart(2, "0")}`;
	}
	if (colon === "ms") {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${String(sec).padStart(2, "0")}`;
	}
	const h = Math.floor(s / 3600);
	const m = Math.floor(s % 3600 / 60);
	const sec = s % 60;
	return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
var INT_LABEL = "Número entero. Acepta espacios o puntos de millar (1 728 o 1.728).";
function checkAnswer(ex, raw) {
	if (ex.answer.type === "int") {
		const n = parseIntegerAnswer(raw);
		return n !== null && n === ex.answer.value;
	}
	if (ex.answer.type === "duration") {
		const n = parseDuration(raw, ex.answer.colon);
		return n !== null && n === ex.answer.seconds;
	}
	const mins = parseClock(raw);
	return mins !== null && mins === (ex.answer.minutes % 1440 + 1440) % 1440;
}
function toPublic(ex) {
	return {
		signature: ex.signature,
		kind: ex.kind,
		level: ex.level,
		family: ex.family,
		prompt: ex.prompt,
		answerLabel: ex.answerLabel,
		input: ex.input
	};
}
function finishInt(signature, kind, level, family, prompt, value, explain) {
	return {
		signature,
		kind,
		level,
		family,
		prompt,
		answerLabel: INT_LABEL,
		input: "int",
		answer: {
			type: "int",
			value
		},
		explain,
		solutionText: formatInt(value)
	};
}
function genAdd(level, band, rng) {
	const widen = band;
	let nums = [];
	let family = "add_plain";
	if (level === 1) {
		const hi = 20 + widen * 8;
		const count = widen >= 2 && rng() < .45 ? 3 : 2;
		nums = Array.from({ length: count }, () => ri(rng, 1, Math.max(2, hi)));
		family = "add_small";
	} else if (level === 2) {
		const hi = 99 + widen * 40;
		if (rng() < .35) {
			nums = [ri(rng, 2, 9 + Math.min(widen, 4)) * (rng() < .5 ? 10 : 100) - ri(rng, 1, 4 + widen), ri(rng, 10, hi)];
			family = "add_round";
		} else {
			nums = [ri(rng, 10, hi), ri(rng, 10, hi)];
			if (rng() < .3) nums.push(ri(rng, 2, 30));
			family = "add_carry";
		}
	} else if (level === 3) {
		const hi = 999 + widen * 200;
		const count = rng() < .4 ? 3 : 2;
		nums = Array.from({ length: count }, () => ri(rng, 40, hi));
		family = "add_carry";
	} else {
		const hi = 9999 + widen * 2e3;
		const count = rng() < .5 ? 3 : 2;
		if (rng() < .4) {
			const pow10 = pick(rng, [
				100,
				1e3,
				1e4
			]);
			nums = [pow10 - ri(rng, 2, 30), ri(rng, 15, Math.min(hi, pow10))];
			family = "add_round";
		} else {
			nums = Array.from({ length: count }, () => ri(rng, 100, hi));
			family = "add_large";
		}
	}
	if (nums.reduce((sum, n) => sum + n, 0) === 0 && nums.length > 0) nums = [1, ...nums.slice(1)];
	const sorted = [...nums].sort((a, b) => a - b);
	const value = nums.reduce((s, n) => s + n, 0);
	const prompt = nums.map(formatInt).join(" + ");
	const explain = family === "add_round" ? "Completa al número redondo y compensa lo que sumaste de más." : "Suma por órdenes: unidades con unidades, decenas con decenas, y arrastra la llevada.";
	return finishInt(`add:${sorted.join("+")}`, "add", level, family, prompt, value, explain);
}
function genSub(level, band, rng) {
	const widen = band;
	let a = 0;
	let b = 0;
	let family = "sub_plain";
	if (level === 1) {
		a = ri(rng, 6, 30 + widen * 10);
		b = ri(rng, 1, Math.max(1, a - 1));
		family = b > 10 && a % 10 < b % 10 ? "sub_borrow" : "sub_small";
	} else if (level === 2) {
		a = ri(rng, 30, 250 + widen * 80);
		b = ri(rng, 8, a);
		family = "sub_borrow";
	} else if (level === 3) {
		a = ri(rng, 200, 8e3 + widen * 1e3);
		b = ri(rng, 40, a);
		if (rng() < .45) {
			b = a - ri(rng, 2, 25);
			family = "sub_close";
		} else family = "sub_borrow";
	} else {
		a = ri(rng, 500, 5e4 + widen * 5e3);
		if (rng() < .35) {
			b = a + ri(rng, 5, 400);
			family = "sub_negative";
		} else if (rng() < .5) {
			b = Math.max(0, a - ri(rng, 2, 40));
			family = "sub_close";
		} else {
			b = ri(rng, 100, a);
			family = "sub_borrow";
		}
	}
	const value = a - b;
	const prompt = `${formatInt(a)} − ${formatInt(b)}`;
	const explain = family === "sub_negative" ? "Si el sustraendo es mayor, el resultado es negativo: calcula la diferencia y cambia el signo." : family === "sub_close" ? "Cuando los números están cerca, cuenta lo que falta de uno al otro." : family === "sub_small" ? "Resta por órdenes. Si no hay que pedir prestado, las unidades se restan directo." : "Si una cifra es menor, pide prestado a la orden siguiente.";
	return finishInt(`sub:${a}-${b}`, "sub", level, family, prompt, value, explain);
}
function genMul(level, band, rng) {
	const widen = Math.min(band, 8);
	let factors = [];
	let family = "mul_table";
	const byTens = () => {
		const scale = level >= 3 && rng() < .5 ? pick(rng, [
			10,
			100,
			1e3
		]) : pick(rng, [10, 100]);
		const hi = scale === 1e3 ? 12 + widen * 4 : 40 + widen * 8;
		factors = [ri(rng, 3, Math.max(3, hi)), scale];
		family = "mul_tens";
	};
	if (level === 1) {
		const hi = Math.min(12 + widen * 2, 20);
		if (widen >= 3 && rng() < .4) {
			factors = [
				ri(rng, 2, 9),
				ri(rng, 2, 6),
				ri(rng, 2, 5)
			];
			family = "mul_three";
		} else {
			factors = [ri(rng, 2, hi), ri(rng, 2, hi)];
			family = "mul_table";
		}
	} else if (rng() < (level === 2 ? .28 : .22)) byTens();
	else if (level === 2) {
		if (rng() < .35) {
			factors = [ri(rng, 2, 9) * 10 + ri(rng, -2, 2), ri(rng, 3, 12)];
			family = "mul_near";
		} else {
			factors = [ri(rng, 12, 40 + widen * 8), ri(rng, 3, 12)];
			family = "mul_2digit";
		}
	} else if (level === 3) {
		if (rng() < .45) {
			factors = [ri(rng, 15, 80), ri(rng, 11, 30)];
			family = "mul_2digit";
		} else {
			factors = [pick(rng, [
				20,
				50,
				100
			]) + ri(rng, -3, 3), ri(rng, 4, 18)];
			family = "mul_near";
		}
	} else {
		const cap = 2e4 + widen * 5e3;
		for (let t = 0; t < 12; t += 1) {
			if (rng() < .45) {
				factors = [ri(rng, 20, 120 + widen * 10), ri(rng, 12, 40)];
				family = "mul_large";
			} else {
				factors = [pick(rng, [
					98,
					99,
					101,
					102,
					198,
					199
				]), ri(rng, 3, 25)];
				family = "mul_near";
			}
			const prod = factors.reduce((s, n) => s * n, 1);
			if (prod <= cap && prod > 0) break;
		}
	}
	factors = factors.map((n) => Math.max(2, n));
	const sorted = [...factors].sort((a, b) => a - b);
	const value = factors.reduce((s, n) => s * n, 1);
	if (!Number.isSafeInteger(value) || Math.abs(value) > 5e5) return genMul(level, 0, rng);
	const prompt = factors.map(formatInt).join(" × ");
	const explain = family === "mul_near" ? "Multiplica por el número redondo cercano y ajusta sumando o restando el producto de la diferencia." : family === "mul_tens" ? "Multiplicar por 10, 100 o 1000 desplaza las cifras; no hace falta calcular cifra a cifra." : "Descompón un factor: a × (b + c) = a×b + a×c.";
	return finishInt(`mul:${sorted.join("×")}`, "mul", level, family, prompt, value, explain);
}
function genDiv(level, band, rng) {
	const widen = Math.min(band, 10);
	let divisor = 2;
	let quot = 2;
	if (level === 1) {
		divisor = ri(rng, 2, Math.min(12 + widen, 18));
		quot = ri(rng, 2, Math.min(12 + widen, 18));
	} else if (level === 2) {
		divisor = ri(rng, 3, 18 + widen * 2);
		quot = ri(rng, 6, 40 + widen * 4);
	} else if (level === 3) {
		divisor = ri(rng, 6, 36 + widen * 2);
		quot = ri(rng, 12, 80 + widen * 5);
	} else {
		divisor = ri(rng, 8, 60 + widen * 4);
		quot = ri(rng, 15, 90 + widen * 6);
	}
	if (divisor === 0) divisor = 2;
	const dividend = divisor * quot;
	if (dividend > 12e4) return genDiv(level, Math.max(0, band - 1), rng);
	const prompt = `${formatInt(dividend)} ÷ ${formatInt(divisor)}`;
	return finishInt(`div:${dividend}÷${divisor}`, "div", level, "div_exact", prompt, quot, "Busca qué número, multiplicado por el divisor, devuelve el dividendo. Puedes descomponer el dividendo en partes exactas.");
}
function genPow(level, band, rng) {
	const widen = Math.min(band, 6);
	let base = 2;
	let exp = 2;
	let family = "pow_square";
	if (level === 1) {
		if (rng() < .75) {
			base = ri(rng, 2, 12 + widen);
			exp = 2;
			family = "pow_square";
		} else {
			base = ri(rng, 2, 5 + Math.floor(widen / 2));
			exp = 3;
			family = "pow_cube";
		}
	} else if (level === 2) {
		const roll = rng();
		if (roll < .55) {
			base = ri(rng, 8, 25 + widen * 2);
			exp = 2;
			family = "pow_square";
		} else if (roll < .85) {
			base = ri(rng, 4, 10 + widen);
			exp = 3;
			family = "pow_cube";
		} else {
			base = pick(rng, [
				2,
				3,
				4,
				5
			]);
			exp = ri(rng, 3, base === 2 ? 10 : base === 3 ? 6 : 4);
			family = "pow_other";
		}
	} else if (level === 3) {
		const roll = rng();
		if (roll < .5) {
			base = ri(rng, 15, 50 + widen * 3);
			exp = 2;
		} else if (roll < .8) {
			base = ri(rng, 6, 18 + widen);
			exp = 3;
			family = "pow_cube";
		} else {
			base = ri(rng, 2, 9);
			exp = ri(rng, 3, 5);
			family = "pow_other";
		}
	} else {
		const roll = rng();
		if (roll < .45) {
			base = ri(rng, 25, 90 + widen * 4);
			exp = 2;
		} else if (roll < .75) {
			base = ri(rng, 8, 25);
			exp = 3;
			family = "pow_cube";
		} else {
			base = ri(rng, 2, 12);
			exp = ri(rng, 4, base <= 4 ? 7 : 4);
			family = "pow_other";
		}
	}
	const value = ipow(base, exp);
	if (value == null || exp === 0 && base === 0) return genPow(1, 0, rng);
	const prompt = `${formatInt(base)}${sup(exp)}`;
	const explain = exp === 2 ? "El cuadrado es el número por sí mismo. Si está cerca de una decena, usa (n + d)² = n² + 2nd + d²." : exp === 3 ? "El cubo es el número multiplicado tres veces. Memorizar los cubos pequeños acelera el resto." : "Reduce la potencia: agrupa factores iguales y reutiliza un cuadrado que ya conozcas.";
	return finishInt(`pow:${base}^${exp}`, "pow", level, family, prompt, value, explain);
}
function genRoot(level, band, rng) {
	const widen = Math.min(band, 8);
	let index = 2;
	let result = 2;
	if (level === 1) {
		index = 2;
		result = ri(rng, 2, 12 + widen * 2);
	} else if (level === 2) {
		if (rng() < .7) {
			index = 2;
			result = ri(rng, 8, 30 + widen * 2);
		} else {
			index = 3;
			result = ri(rng, 2, 8 + widen);
		}
	} else if (level === 3) {
		const roll = rng();
		if (roll < .55) {
			index = 2;
			result = ri(rng, 12, 55 + widen * 3);
		} else if (roll < .9) {
			index = 3;
			result = ri(rng, 4, 15 + widen);
		} else {
			index = 4;
			result = ri(rng, 2, 6 + Math.floor(widen / 2));
		}
	} else {
		const roll = rng();
		if (roll < .5) {
			index = 2;
			result = ri(rng, 20, 100 + widen * 5);
		} else if (roll < .85) {
			index = 3;
			result = ri(rng, 6, 25 + widen);
		} else {
			index = 4;
			result = ri(rng, 2, 10);
		}
	}
	const radicand = ipow(result, index);
	if (radicand == null) return genRoot(1, 0, rng);
	const prompt = `${index === 2 ? "√" : index === 3 ? "∛" : "∜"}${formatInt(radicand)}`;
	if (integerRoot(index, radicand) !== result) throw new Error("raíz inexacta");
	const explain = index === 2 ? "Busca qué entero, multiplicado por sí mismo, da el radicando. Acota entre decenas: 20² = 400, 30² = 900." : "Prueba cubos o potencias conocidas. La raíz y la potencia son operaciones inversas.";
	return finishInt(`root:${index}:${radicand}`, "root", level, index === 2 ? "root_square" : "root_higher", prompt, result, explain);
}
function n(v) {
	return {
		t: "n",
		v
	};
}
function genCombo(level, band, rng) {
	const widen = Math.min(band, 6);
	const extra = widen * (level === 1 ? 2 : 4);
	for (let attempt = 0; attempt < 24; attempt += 1) {
		let ast;
		let family = "combo_prec";
		let explain = "Multiplicaciones y divisiones van antes que sumas y restas. Los paréntesis se resuelven primero.";
		const a = ri(rng, 2, 9 + extra);
		const b = ri(rng, 2, 9 + extra);
		const c = ri(rng, 2, 6 + Math.floor(extra / 2));
		const roll = rng();
		if (level === 1) {
			if (roll < .34) {
				ast = {
					t: "mul",
					a: {
						t: "add",
						a: n(a),
						b: n(b)
					},
					b: n(c)
				};
				family = "combo_paren";
			} else if (roll < .67) {
				ast = {
					t: "add",
					a: {
						t: "mul",
						a: n(a),
						b: n(b)
					},
					b: n(c)
				};
				family = "combo_prec";
			} else {
				const prod = a * b;
				const d = ri(rng, 1, Math.max(1, prod - 1));
				ast = {
					t: "sub",
					a: {
						t: "mul",
						a: n(a),
						b: n(b)
					},
					b: n(d)
				};
				family = "combo_prec";
			}
		} else if (level === 2) {
			if (roll < .4) {
				const prod = a * b;
				const facs = [];
				for (let f = 2; f <= Math.min(prod, 24); f += 1) if (prod % f === 0) facs.push(f);
				const f = facs.length ? pick(rng, facs) : prod;
				ast = {
					t: "div",
					a: {
						t: "mul",
						a: n(a),
						b: n(b)
					},
					b: n(f)
				};
				family = "combo_div";
				explain = "Primero el producto del paréntesis, después la división exacta.";
			} else if (roll < .7) {
				ast = {
					t: "sub",
					a: {
						t: "mul",
						a: {
							t: "add",
							a: n(a),
							b: n(b)
						},
						b: n(c)
					},
					b: n(ri(rng, 1, 9))
				};
				family = "combo_paren";
			} else {
				ast = {
					t: "add",
					a: {
						t: "mul",
						a: n(ri(rng, 4, 18 + extra)),
						b: n(ri(rng, 3, 9))
					},
					b: {
						t: "mul",
						a: n(ri(rng, 2, 8)),
						b: n(ri(rng, 2, 8))
					}
				};
				family = "combo_prec";
			}
		} else if (level === 3) {
			if (roll < .35) {
				ast = {
					t: "add",
					a: {
						t: "pow",
						a: n(ri(rng, 4, 16 + widen)),
						b: n(2)
					},
					b: n(ri(rng, 2, 40))
				};
				family = "combo_pow";
				explain = "Calcula primero la potencia y después suma o resta.";
			} else if (roll < .6) {
				const r = ri(rng, 4, 18);
				ast = {
					t: "add",
					a: {
						t: "root",
						i: 2,
						a: n(r * r)
					},
					b: n(ri(rng, 2, 30))
				};
				family = "combo_root";
				explain = "La raíz se resuelve antes que la suma. Identifica el cuadrado perfecto.";
			} else if (roll < .8) {
				const x = ri(rng, 6, 18);
				const y = ri(rng, 1, x - 1);
				ast = {
					t: "div",
					a: {
						t: "sub",
						a: {
							t: "pow",
							a: n(x),
							b: n(2)
						},
						b: {
							t: "pow",
							a: n(y),
							b: n(2)
						}
					},
					b: {
						t: "sub",
						a: n(x),
						b: n(y)
					}
				};
				family = "combo_pattern";
				explain = "Diferencia de cuadrados: a² − b² = (a − b)(a + b). Aquí el cociente es a + b.";
			} else {
				ast = {
					t: "mul",
					a: {
						t: "add",
						a: n(ri(rng, 8, 30)),
						b: n(ri(rng, 3, 12))
					},
					b: n(ri(rng, 3, 9))
				};
				family = "combo_paren";
			}
		} else if (roll < .33) {
			const x = ri(rng, 8, 24);
			const y = ri(rng, 2, x - 2);
			ast = {
				t: "div",
				a: {
					t: "sub",
					a: {
						t: "pow",
						a: n(x),
						b: n(2)
					},
					b: {
						t: "pow",
						a: n(y),
						b: n(2)
					}
				},
				b: {
					t: "add",
					a: n(x),
					b: n(y)
				}
			};
			family = "combo_pattern";
			explain = "a² − b² = (a − b)(a + b). Dividir entre (a + b) deja a − b.";
		} else if (roll < .66) {
			ast = {
				t: "sub",
				a: {
					t: "mul",
					a: {
						t: "root",
						i: 3,
						a: n(ipow(ri(rng, 4, 12 + widen), 3) ?? 8)
					},
					b: n(ri(rng, 2, 8))
				},
				b: n(ri(rng, 1, 15))
			};
			family = "combo_root";
			explain = "Resuelve la raíz cúbica, multiplica y al final resta.";
		} else {
			const p = ri(rng, 6, 15);
			ast = {
				t: "add",
				a: {
					t: "mul",
					a: n(ri(rng, 12, 40 + extra)),
					b: {
						t: "add",
						a: n(ri(rng, 3, 9)),
						b: n(ri(rng, 2, 7))
					}
				},
				b: {
					t: "pow",
					a: n(p > 12 ? 8 : p),
					b: n(2)
				}
			};
			family = "combo_prec";
			explain = "Paréntesis, luego potencia, luego producto y al final la suma. Guarda los resultados intermedios.";
		}
		const value = evalNode(ast);
		if (value == null || !Number.isSafeInteger(value)) continue;
		if (level < 4 && value < 0) continue;
		if (Math.abs(value) > 5e4) continue;
		let prompt = "";
		try {
			prompt = displayNode(ast);
			if (valueOfPrompt(prompt) !== value) continue;
		} catch {
			continue;
		}
		return finishInt(`combo:${sigNode(ast)}`, "combo", level, family, prompt, value, explain);
	}
	const ast = {
		t: "add",
		a: {
			t: "mul",
			a: n(ri(rng, 2, 9)),
			b: n(ri(rng, 2, 9))
		},
		b: n(ri(rng, 2, 40))
	};
	const value = evalNode(ast);
	const prompt = displayNode(ast);
	return finishInt(`combo:${sigNode(ast)}`, "combo", level, "combo_prec", prompt, value, "Primero el producto, después la suma.");
}
function fmtHms(total, parts) {
	const h = Math.floor(total / 3600);
	const m = Math.floor(total % 3600 / 60);
	const s = total % 60;
	const bits = [];
	if (parts.includes("h") && h) bits.push(`${h} h`);
	if (parts.includes("m") && m) bits.push(`${m} min`);
	if (parts.includes("s") && (s || bits.length === 0)) bits.push(`${s} s`);
	if (!bits.length) {
		if (parts.includes("h")) return "0 h";
		if (parts.includes("m")) return "0 min";
		return "0 s";
	}
	return bits.join(" ");
}
function genTime(kind, level, band, rng) {
	const widen = Math.min(band, 6);
	let x = 0;
	let y = 0;
	let parts = ["s"];
	let colon = "ms";
	if (level === 1) {
		x = ri(rng, 5, 50 + widen * 8);
		y = ri(rng, 5, 50 + widen * 8);
		parts = ["s"];
		colon = "ms";
	} else if (level === 2) {
		x = ri(rng, 15, 180 + widen * 20);
		y = ri(rng, 10, 90 + widen * 15);
		parts = ["m", "s"];
		colon = "ms";
	} else if (level === 3) {
		x = ri(rng, 20, 150 + widen * 20) * 60;
		y = ri(rng, 5, 70 + widen * 10) * 60;
		parts = ["h", "m"];
		colon = "hm";
	} else {
		x = ri(rng, 30, 240 + widen * 30) * 60 + ri(rng, 0, 59);
		y = ri(rng, 10, 90 + widen * 10) * 60 + ri(rng, 0, 59);
		parts = [
			"h",
			"m",
			"s"
		];
		colon = "hms";
	}
	if (kind === "time_sub" && y > x) {
		const t = x;
		x = y;
		y = t;
	}
	if (kind === "time_sub" && x === y) x += 5;
	const result = kind === "time_add" ? x + y : x - y;
	const left = fmtHms(x, parts);
	const right = fmtHms(y, parts);
	const op = kind === "time_add" ? "+" : "−";
	const sig = kind === "time_add" ? `tadd:${[x, y].sort((p, q) => p - q).join("+")}` : `tsub:${x}-${y}`;
	const answerLabel = colon === "hm" ? "Duración en h:mm. También vale «2 h 5 min» o el total de minutos." : colon === "hms" ? "Duración en h:mm:ss. También vale con palabras o el total de segundos." : "Duración en mm:ss. También vale el total de segundos o «1 min 25 s».";
	const explain = kind === "time_add" ? "Suma cada unidad. Si los segundos llegan a 60, conviértelos en un minuto; igual con los minutos y la hora." : "Si no alcanzan los segundos o los minutos, pide prestada una unidad a la columna de la izquierda (1 min = 60 s, 1 h = 60 min).";
	return {
		signature: sig,
		kind,
		level,
		family: kind === "time_add" ? "time_carry" : "time_borrow",
		prompt: `${left} ${op} ${right}`,
		answerLabel,
		input: "time",
		answer: {
			type: "duration",
			seconds: result,
			colon
		},
		explain,
		solutionText: formatDuration(result, colon)
	};
}
function clockLabel(mins) {
	return `${formatClock(mins, "12")} (${formatClock(mins, "24")})`;
}
function genClock(kind, level, band, rng) {
	const widen = Math.min(band, 5);
	let start = ri(rng, 0, 1439);
	if (level >= 2 && rng() < .4) start = (pick(rng, [
		0,
		720,
		708,
		725,
		1420,
		1435
	]) + ri(rng, 0, 12)) % 1440;
	let delta = 10;
	if (level === 1) delta = ri(rng, 5, 25 + widen * 3);
	else if (level === 2) delta = ri(rng, 20, 90 + widen * 10);
	else if (level === 3) delta = ri(rng, 40, 180 + widen * 15);
	else delta = ri(rng, 50, 400 + widen * 30) + (rng() < .3 ? 720 : 0);
	const signed = kind === "clock_future" ? delta : -delta;
	const end = ((start + signed) % 1440 + 1440) % 1440;
	const startLabel = formatClock(start, "12");
	const when = kind === "clock_future" ? "dentro de" : "hace";
	const deltaText = delta % 60 === 0 ? `${delta / 60} h` : delta >= 60 ? `${Math.floor(delta / 60)} h ${delta % 60} min` : `${delta} min`;
	const prompt = `Son las ${startLabel}. ${kind === "clock_future" ? "¿Qué hora será" : "¿Qué hora era"} ${when} ${deltaText}?`;
	const explain = end < start && kind === "clock_future" ? "El intervalo cruza medianoche: al pasar de 23 h vuelve a las 00:00, y el periodo a. m./p. m. cambia." : start < 720 && end >= 720 ? "Cruza el mediodía: después de las 12:00 el periodo pasa de a. m. a p. m." : "Suma o resta los minutos. Si pasas de 60, avanza una hora. 12:00 es mediodía y 00:00 es medianoche.";
	return {
		signature: `${kind === "clock_future" ? "cf" : "cp"}:${start}${kind === "clock_future" ? "+" : "-"}${delta}`,
		kind,
		level,
		family: "clock_wrap",
		prompt,
		answerLabel: "Hora exacta. Vale 14:35 o 2:35 p. m. Incluye a. m./p. m. si usas formato de 12 h. 00:00 es medianoche y 12:00 es mediodía.",
		input: "time",
		answer: {
			type: "clock",
			minutes: end
		},
		explain,
		solutionText: clockLabel(end)
	};
}
function genConv(kind, level, band, rng) {
	const widen = Math.min(band, 8);
	let minutes = ri(rng, 0, 1439);
	if (level === 1 && widen < 3) {
		const span = 6 + widen * 3;
		const start = 780;
		minutes = ri(rng, start, Math.min(1439, start + span * 60));
	} else if (level === 2 && widen < 2 && rng() < .55) minutes = pick(rng, [
		0,
		720,
		15,
		760,
		1385,
		1,
		719
	]);
	else if ((level === 2 || level >= 3) && rng() < .2) minutes = pick(rng, [
		0,
		720,
		721,
		1439
	]);
	const from24 = kind === "conv_24_12";
	const shown = from24 ? formatClock(minutes, "24") : formatClock(minutes, "12");
	const prompt = from24 ? `Convierte ${shown} al formato de 12 horas.` : `Convierte ${shown} al formato de 24 horas.`;
	return {
		signature: `${from24 ? "c24" : "c12"}:${minutes}`,
		kind,
		level,
		family: "convert",
		prompt,
		answerLabel: from24 ? "Formato de 12 h con a. m. o p. m. También se acepta la hora equivalente en 24 h. 00:00 es medianoche (12:00 a. m.) y 12:00 es mediodía (12:00 p. m.)." : "Formato de 24 h, de 00:00 a 23:59. También se acepta la misma hora en 12 h con a. m. o p. m.",
		input: "time",
		answer: {
			type: "clock",
			minutes
		},
		explain: from24 ? "De 13:00 a 23:59 resta 12 y marca p. m. 00:00 es 12:00 a. m. 12:00 sigue siendo 12:00 p. m." : "De 1:00 p. m. a 11:59 p. m. suma 12. 12:00 a. m. es 00:00. 12:00 p. m. es 12:00.",
		solutionText: clockLabel(minutes)
	};
}
var GENERATORS = {
	add: genAdd,
	sub: genSub,
	mul: genMul,
	div: genDiv,
	pow: genPow,
	root: genRoot,
	combo: genCombo,
	time_add: (l, b, r) => genTime("time_add", l, b, r),
	time_sub: (l, b, r) => genTime("time_sub", l, b, r),
	clock_future: (l, b, r) => genClock("clock_future", l, b, r),
	clock_past: (l, b, r) => genClock("clock_past", l, b, r),
	conv_24_12: (l, b, r) => genConv("conv_24_12", l, b, r),
	conv_12_24: (l, b, r) => genConv("conv_12_24", l, b, r)
};
function generateExercise(opts) {
	const rng = opts.rng ?? cryptoRng();
	const band = Math.max(0, opts.band ?? 0);
	const level = Math.min(4, Math.max(1, opts.level)) || 1;
	const ex = GENERATORS[opts.kind](level, band, rng);
	if (ex.answer.type === "int") {
		const back = valueOfPrompt(ex.prompt);
		if (back !== ex.answer.value) throw new Error(`enunciado incoherente en ${opts.kind}: ${ex.prompt} → ${back} ≠ ${ex.answer.value}`);
	}
	if (ex.kind === "div") {
		const [dividend, divisor] = ex.prompt.split("÷").map((p) => parseIntegerAnswer(p.trim()));
		if (!divisor || dividend == null || dividend % divisor !== 0) throw new Error("división no exacta");
	}
	return ex;
}
/** Cota inferior honesta del espacio de un nivel, sin contar la ampliación por agotamiento. */
function varietyLowerBound(kind, level) {
	return {
		add: [
			200,
			4e3,
			4e5,
			2e7
		],
		sub: [
			200,
			8e3,
			1e6,
			4e7
		],
		mul: [
			60,
			800,
			6e3,
			8e4
		],
		div: [
			100,
			2e3,
			12e3,
			4e4
		],
		pow: [
			16,
			40,
			80,
			150
		],
		root: [
			12,
			30,
			70,
			140
		],
		combo: [
			400,
			8e3,
			4e4,
			2e5
		],
		time_add: [
			2e3,
			2e4,
			8e4,
			2e6
		],
		time_sub: [
			1e3,
			15e3,
			6e4,
			1e6
		],
		clock_future: [
			2e4,
			8e4,
			15e4,
			3e5
		],
		clock_past: [
			2e4,
			8e4,
			15e4,
			3e5
		],
		conv_24_12: [
			300,
			1440,
			1440,
			1440
		],
		conv_12_24: [
			300,
			1440,
			1440,
			1440
		]
	}[kind][level - 1] ?? 100;
}
function formatVariety(n) {
	if (n >= 1e6) return `más de ${formatInt(Math.round(n / 1e6))} millones`;
	if (n >= 1e3) return `más de ${formatInt(n)}`;
	return `alrededor de ${formatInt(n)}`;
}
function emptyAdaptive() {
	return { ops: {} };
}
function clampKindLevel(value) {
	if (!Number.isFinite(value)) return 1;
	return Math.min(4, Math.max(1, Math.round(value)));
}
function asAdaptive(value) {
	if (!value || typeof value !== "object") return emptyAdaptive();
	const v = value;
	if (!v.ops || typeof v.ops !== "object") return emptyAdaptive();
	const ops = {};
	for (const [key, raw] of Object.entries(v.ops)) {
		if (!raw || typeof raw !== "object") continue;
		const row = raw;
		const recent = Array.isArray(row.recent) ? row.recent.filter((point) => point && typeof point === "object").map((point) => {
			const item = point;
			return {
				ok: item.ok ? 1 : 0,
				level: clampKindLevel(Number(item.level) || 1),
				ms: Math.max(0, Number(item.ms) || 0)
			};
		}).slice(-24) : [];
		const stored = Number(row.level);
		ops[key] = {
			recent,
			level: Number.isFinite(stored) ? clampKindLevel(stored) : void 0
		};
	}
	const placement = {};
	if (v.placement && typeof v.placement === "object") for (const [key, raw] of Object.entries(v.placement)) {
		const n = Number(raw);
		if (Number.isFinite(n)) placement[key] = clampKindLevel(n);
	}
	return {
		ops,
		placement
	};
}
var SPEED_LIMIT = [
	0,
	8e3,
	12e3,
	18e3,
	28e3
];
function accuracyOf(rows) {
	return {
		acc: rows.reduce((sum, row) => sum + (row.ok ? 1 : 0), 0) / rows.length,
		avg: rows.reduce((sum, row) => sum + row.ms, 0) / rows.length
	};
}
/** El nivel guardado solo se mueve con 8 intentos en ese mismo nivel. Practicar más fácil no lo borra. */
function recomputeKindLevel(recent, current) {
	const base = clampKindLevel(current);
	const atCurrent = recent.filter((row) => row.level === base).slice(-8);
	if (atCurrent.length >= 8) {
		const { acc, avg } = accuracyOf(atCurrent);
		if (acc >= .85 && avg <= (SPEED_LIMIT[base] ?? 2e4)) return Math.min(4, base + 1);
		if (acc < .6) return Math.max(1, base - 1);
	}
	for (let level = 4; level > base; level -= 1) {
		const rows = recent.filter((row) => row.level === level).slice(-8);
		if (rows.length < 8) continue;
		const { acc, avg } = accuracyOf(rows);
		if (acc >= .85 && avg <= (SPEED_LIMIT[level] ?? 3e4)) return level;
	}
	return base;
}
function updateAdaptive(prev, kind, level, ok, ms) {
	const next = {
		ops: { ...prev.ops },
		placement: prev.placement ? { ...prev.placement } : void 0
	};
	const prevLevel = prev.ops[kind]?.level ?? prev.placement?.[kind] ?? 1;
	const cur = next.ops[kind]?.recent ? [...next.ops[kind].recent] : [];
	cur.push({
		ok: ok ? 1 : 0,
		level: clampKindLevel(level),
		ms: Math.max(0, Math.round(ms))
	});
	const recent = cur.slice(-24);
	next.ops[kind] = {
		recent,
		level: recomputeKindLevel(recent, prevLevel)
	};
	return next;
}
function kindLevel(a, kind) {
	const stored = a.ops[kind]?.level;
	if (typeof stored === "number" && Number.isFinite(stored)) return clampKindLevel(stored);
	const placed = a.placement?.[kind] ?? 1;
	const recent = a.ops[kind]?.recent ?? [];
	if (recent.length < 8) return clampKindLevel(placed);
	let level = clampKindLevel(placed);
	let buffer = [];
	for (const point of recent) {
		buffer.push(point);
		if (buffer.length > 24) buffer = buffer.slice(-24);
		level = recomputeKindLevel(buffer, level);
	}
	return level;
}
var ALL_KINDS = [
	"add",
	"sub",
	"mul",
	"div",
	"pow",
	"root",
	"combo"
];
function overallLevel(a) {
	const perKind = {};
	for (const k of ALL_KINDS) perKind[k] = kindLevel(a, k);
	let level = Math.min(perKind.add ?? 1, perKind.sub ?? 1, perKind.mul ?? 1);
	const experts = ALL_KINDS.filter((k) => (perKind[k] ?? 1) >= 4).length;
	const nonBasic = [
		"pow",
		"root",
		"combo"
	].filter((k) => (perKind[k] ?? 1) >= 4).length;
	if (level >= 4) level = experts >= 4 && nonBasic >= 1 ? 4 : 3;
	return {
		level,
		perKind
	};
}
function nextDiagnosticStep(items) {
	const n = items.length;
	if (n >= 12) return null;
	const stageA = [
		{
			kind: "add",
			level: 1
		},
		{
			kind: "sub",
			level: 1
		},
		{
			kind: "mul",
			level: 1
		},
		{
			kind: "div",
			level: 1
		}
	];
	if (n < 4) return stageA[n];
	const earlyAcc = items.slice(0, 4).filter((i) => i.correct).length / 4;
	const stageB = earlyAcc < .5 ? [
		{
			kind: "add",
			level: 1
		},
		{
			kind: "sub",
			level: 1
		},
		{
			kind: "mul",
			level: 1
		},
		{
			kind: "div",
			level: 1
		}
	] : [
		{
			kind: "add",
			level: 2
		},
		{
			kind: "sub",
			level: 2
		},
		{
			kind: "mul",
			level: 2
		},
		{
			kind: "div",
			level: 2
		}
	];
	if (n < 8) return stageB[n - 4];
	return (earlyAcc >= .75 && items.slice(4, 8).filter((i) => i.correct).length >= 3 ? [
		{
			kind: "combo",
			level: 2
		},
		{
			kind: "pow",
			level: 2
		},
		{
			kind: "root",
			level: 2
		},
		{
			kind: "combo",
			level: 3
		}
	] : [
		{
			kind: "combo",
			level: 1
		},
		{
			kind: "pow",
			level: 1
		},
		{
			kind: "root",
			level: 1
		},
		{
			kind: "mul",
			level: earlyAcc < .5 ? 1 : 2
		}
	])[n - 8];
}
function buildDiagnosticReport(items) {
	const placement = {};
	const groups = /* @__PURE__ */ new Map();
	for (const item of items) {
		const list = groups.get(item.kind) ?? [];
		list.push(item);
		groups.set(item.kind, list);
	}
	const mastered = [];
	const weak = [];
	const frequentErrors = [];
	for (const [kind, list] of groups) {
		const correct = list.filter((i) => i.correct);
		const acc = correct.length / list.length;
		const highest = correct.reduce((m, i) => Math.max(m, i.level), 0);
		const fast = correct.filter((i) => i.ms <= 6e3 && i.level >= 2).length > 0;
		let lvl = 1;
		if (acc === 0) lvl = 1;
		else if (highest >= 2 && fast) lvl = 3;
		else if (highest >= 2) lvl = 2;
		else lvl = 1;
		if (kind === "pow" || kind === "root" || kind === "combo") lvl = Math.min(lvl, highest >= 2 ? 2 : 1);
		placement[kind] = lvl;
		const label = KIND_LABEL[kind] ?? kind;
		if (acc >= .99 && highest >= 1) mastered.push(label);
		if (acc < .67) {
			weak.push(label);
			frequentErrors.push(label);
		}
	}
	for (const k of [
		"add",
		"sub",
		"mul",
		"div"
	]) if (!placement[k]) placement[k] = 1;
	const adaptive = {
		ops: {},
		placement
	};
	for (const item of items) {
		const cur = adaptive.ops[item.kind]?.recent ?? [];
		cur.push({
			ok: item.correct ? 1 : 0,
			level: item.level,
			ms: item.ms
		});
		adaptive.ops[item.kind] = { recent: cur };
	}
	const overall = overallLevel(adaptive);
	let level = Math.min(3, overall.level);
	if ((placement.add ?? 1) === 1 && (placement.mul ?? 1) === 1 && items.filter((i) => i.correct).length <= 4) level = 1;
	const times = items.map((i) => i.ms).sort((a, b) => a - b);
	const medianMs = times.length ? times[Math.floor(times.length / 2)] : 0;
	const speedLabel = medianMs < 4e3 ? "rápida" : medianMs < 9e3 ? "moderada" : "pausada";
	const recommendations = [];
	if (weak.includes("Multiplicación") || weak.includes("División exacta")) recommendations.push("Dedica sesiones cortas del modo libre a las tablas y a divisiones exactas de nivel 1.");
	if (weak.includes("Suma") || weak.includes("Resta")) recommendations.push("Trabaja descomposición y compensación en el laboratorio antes de subir de nivel.");
	if (!weak.length) recommendations.push("La base es estable. Entra al reto diario y sube una operación cada vez en el modo libre.");
	if (speedLabel === "pausada") recommendations.push("Prioriza la precisión. La velocidad llegará al repetir el mismo tipo de operación, no al saltar de nivel.");
	recommendations.push("El nivel experto no se concede por volumen: hay que demostrarlo en varias operaciones.");
	return {
		level,
		perKind: {
			...overall.perKind,
			...placement
		},
		mastered,
		weak,
		frequentErrors,
		medianMs,
		speedLabel,
		recommended: level,
		recommendations,
		items
	};
}
function seasonIndex(anchorDate, today) {
	const days = daysBetween(anchorDate, today);
	return Math.floor(Math.max(0, days) / 30) + 1;
}
function daysBetween(a, b) {
	const [ay, am, ad] = a.split("-").map(Number);
	const [by, bm, bd] = b.split("-").map(Number);
	const ua = Date.UTC(ay, (am ?? 1) - 1, ad ?? 1);
	const ub = Date.UTC(by, (bm ?? 1) - 1, bd ?? 1);
	return Math.round((ub - ua) / 864e5);
}
function addDays(date, days) {
	const [y, m, d] = date.split("-").map(Number);
	const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
	dt.setUTCDate(dt.getUTCDate() + days);
	return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
function localDateISO(timeZone, date = /* @__PURE__ */ new Date()) {
	try {
		return new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).format(date);
	} catch {
		return new Intl.DateTimeFormat("en-CA", {
			timeZone: "UTC",
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).format(date);
	}
}
function safeTimeZone(tz) {
	if (!tz) return "UTC";
	try {
		Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(/* @__PURE__ */ new Date());
		return tz;
	} catch {
		return "UTC";
	}
}
function seasonInfo(n) {
	const number = Math.max(1, n);
	if (number === 1) return {
		number,
		name: "Fundamentos",
		blurb: "Precisión en sumas, restas y tablas. La velocidad no compensa un error de base.",
		changes: ["El reto mezcla sobre todo sumas, restas, tablas y divisiones exactas sencillas.", "Tu nivel personal manda: la temporada no te sube de golpe."]
	};
	if (number === 2) return {
		number,
		name: "Factores",
		blurb: "Más peso en multiplicaciones y divisiones con números mayores.",
		changes: ["Aparecen productos de dos cifras y cocientes más largos, dentro de tu nivel.", "Si la precisión básica baja del 70 %, el reto vuelve a reforzar lo elemental."]
	};
	if (number === 3) return {
		number,
		name: "Potencias",
		blurb: "Entran con más frecuencia potencias, raíces exactas y combinadas.",
		changes: ["Cuadrados, cubos y raíces enteras se mezclan con las operaciones anteriores.", "Los récords históricos de temporadas pasadas se conservan."]
	};
	if (number === 4) return {
		number,
		name: "Combinación",
		blurb: "Expresiones de varios pasos y más presión de ritmo, sin saltar tu nivel real.",
		changes: ["El reto incluye más operaciones combinadas.", "La medición sigue siendo de 10 minutos reales de reloj."]
	};
	return {
		number,
		name: `Amplitud ${number}`,
		blurb: "Los rangos se amplían dentro de cada nivel. No se inventa una dificultad nueva vacía.",
		changes: [`Banda de ampliación +${number - 4} cuando el generador necesita variedad.`, "El nivel experto sigue exigiendo dominio demostrado en varias operaciones."]
	};
}
function recentAccuracy(a, kind) {
	const rows = a.ops[kind]?.recent ?? [];
	if (rows.length < 4) return null;
	return rows.reduce((s, r) => s + r.ok, 0) / rows.length;
}
function pickTrainingKind(season, level, adaptive, rng) {
	const remedial = [];
	for (const k of [
		"add",
		"sub",
		"mul",
		"div"
	]) {
		const acc = recentAccuracy(adaptive, k);
		if (acc != null && acc < .6) remedial.push(k);
	}
	if (remedial.length && rng() < .55) {
		const kind = pick(rng, remedial);
		return {
			kind,
			level: Math.max(1, Math.min(level, kindLevel(adaptive, kind)))
		};
	}
	const bag = [
		"add",
		"sub",
		"mul",
		"div"
	];
	if (season >= 2) bag.push("mul", "div", "mul");
	if (season >= 3 || level >= 3) bag.push("pow", "root", "combo");
	if (season >= 4) bag.push("combo", "combo", "pow");
	const kind = pick(rng, bag);
	const kindLv = Math.min(4, Math.max(1, kindLevel(adaptive, kind)));
	const practiced = adaptive.ops[kind]?.recent?.length ?? 0;
	let lv = practiced < 8 ? Math.min(kindLv, level) : kindLv;
	if (season >= 5 && lv < 4 && practiced >= 8 && rng() < .15) lv = Math.min(4, lv + 1);
	return {
		kind,
		level: lv
	};
}
function clockKinds(submode) {
	if (submode === "arith") return ["time_add", "time_sub"];
	if (submode === "clock12") return ["clock_future", "clock_past"];
	return ["conv_24_12", "conv_12_24"];
}
function findWeaknesses(rows) {
	const out = [];
	for (const row of rows) {
		if (row.attempted < 5) continue;
		const accuracy = row.correct / row.attempted;
		const slow = row.avgMs > 12e3;
		if (accuracy >= .82 && !slow) continue;
		const label = KIND_LABEL[row.kind] ?? row.kind;
		const familyNote = row.family ? ` (${row.family.replaceAll("_", " ")})` : "";
		let suggestion = `Practica ${label.toLowerCase()} en modo libre, en el nivel donde aparecen los errores.`;
		if (row.kind === "combo") suggestion = "Repasa la jerarquía en el laboratorio y practica combinadas de nivel 1 y 2.";
		if (row.kind === "div") suggestion = "Vuelve a la relación inversa: cada división exacta es una multiplicación escondida.";
		if (row.family === "sub_borrow") suggestion = "Haz restas con préstamo en nivel 2 hasta que el error baje del 15 %.";
		if (slow && accuracy >= .82) suggestion = `La precisión en ${label.toLowerCase()} es buena; entrena series cortas para bajar el tiempo.`;
		out.push({
			key: `${row.kind}:${row.family}`,
			label: `${label}${familyNote}`,
			accuracy,
			avgMs: row.avgMs,
			attempted: row.attempted,
			suggestion
		});
	}
	return out.sort((a, b) => a.accuracy - b.accuracy || b.avgMs - a.avgMs).slice(0, 6);
}
function computeStreak(dates, today) {
	const set = new Set(dates);
	let cursor = set.has(today) ? today : addDays(today, -1);
	let current = 0;
	if (set.has(cursor) || set.has(today)) {
		if (!set.has(cursor)) cursor = today;
		while (set.has(cursor)) {
			current += 1;
			cursor = addDays(cursor, -1);
		}
	} else current = 0;
	const sorted = [...set].sort();
	let best = 0;
	let run = 0;
	let prev = "";
	for (const d of sorted) {
		run = prev && addDays(prev, 1) === d ? run + 1 : 1;
		prev = d;
		if (run > best) best = run;
	}
	return {
		current,
		best
	};
}
var DAILY_MS = 6e5;
function recordLabel(key) {
	const map = {
		"daily:correct": "Más aciertos en 10 minutos",
		"daily:attempted": "Más ejercicios respondidos en 10 minutos",
		"daily:accuracy": "Mayor precisión en una sesión completa",
		"daily:avg_correct_ms": "Menor tiempo medio por acierto",
		best_streak: "Mejor racha de días"
	};
	if (map[key]) return map[key];
	if (key.startsWith("daily:kind:")) {
		const kind = key.split(":")[2] ?? "";
		return `Aciertos en 10 min · ${KIND_LABEL[kind] ?? kind}`;
	}
	if (key.startsWith("daily:level:")) return `Aciertos en 10 min · nivel ${key.split(":")[2]}`;
	return key;
}
//#endregion
export { seasonIndex as C, varietyLowerBound as D, updateAdaptive as E, safeTimeZone as S, toPublic as T, localDateISO as _, LEVEL_NAME as a, pickTrainingKind as b, buildDiagnosticReport as c, computeStreak as d, emptyAdaptive as f, getLesson as g, generateExercise as h, LEVEL_HINT as i, checkAnswer as l, formatVariety as m, KIND_LABEL as n, asAdaptive as o, findWeaknesses as p, LESSONS as r, authMiddleware as s, DAILY_MS as t, clockKinds as u, nextDiagnosticStep as v, seasonInfo as w, recordLabel as x, overallLevel as y };
