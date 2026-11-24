/**
 * Motor de cálculo mental: generación procedural, firmas canónicas,
 * evaluación exacta y corrección de respuestas escritas.
 * No usa listas de preguntas. Toda respuesta se calcula antes de mostrarse.
 */

export type Level = 1 | 2 | 3 | 4;

export type Kind =
  | "add"
  | "sub"
  | "mul"
  | "div"
  | "pow"
  | "root"
  | "combo"
  | "time_add"
  | "time_sub"
  | "clock_future"
  | "clock_past"
  | "conv_24_12"
  | "conv_12_24";

export type Rng = () => number;

export type Answer =
  | { type: "int"; value: number }
  | { type: "duration"; seconds: number; colon: "ms" | "hm" | "hms" }
  | { type: "clock"; minutes: number };

export type Exercise = {
  signature: string;
  kind: Kind;
  level: Level;
  family: string;
  prompt: string;
  answerLabel: string;
  input: "int" | "time";
  answer: Answer;
  explain: string;
  solutionText: string;
};

export type PublicExercise = {
  signature: string;
  kind: Kind;
  level: Level;
  family: string;
  prompt: string;
  answerLabel: string;
  input: "int" | "time";
};

export const LEVEL_NAME: Record<Level, string> = {
  1: "Básico",
  2: "Intermedio",
  3: "Avanzado",
  4: "Experto",
};

export const LEVEL_HINT: Record<Level, string> = {
  1: "Números pequeños, tablas, divisiones exactas cortas y cuadrados perfectos.",
  2: "Dos y tres cifras, cocientes más largos y potencias que conviene reconocer.",
  3: "Varias cifras, operaciones combinadas, cubos y raíces exactas.",
  4: "Rangos amplios, varios pasos y varios resultados intermedios en la memoria.",
};

export const KIND_LABEL: Record<Kind, string> = {
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
  conv_12_24: "De 12 h a 24 h",
};

const NUMERIC: Kind[] = ["add", "sub", "mul", "div", "pow", "root", "combo"];

export function isNumericKind(kind: string): kind is Kind {
  return (NUMERIC as string[]).includes(kind);
}

export function cryptoRng(): Rng {
  return () => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0x1_0000_0000;
  };
}

function ri(rng: Rng, min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

export function formatInt(n: number): string {
  const neg = n < 0;
  const digits = String(Math.abs(Math.trunc(n)));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  return neg ? `−${grouped}` : grouped;
}

const SUP_DIGITS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

export function sup(n: number): string {
  return String(Math.abs(Math.trunc(n)))
    .split("")
    .map((d) => SUP_DIGITS[Number(d)] ?? d)
    .join("");
}

function ipow(base: number, exp: number): number | null {
  if (!Number.isInteger(base) || !Number.isInteger(exp) || exp < 0 || exp > 12) return null;
  let r = 1;
  for (let i = 0; i < exp; i += 1) {
    r *= base;
    if (!Number.isSafeInteger(r) || Math.abs(r) > 200_000) return null;
  }
  return r;
}

function integerRoot(index: number, radicand: number): number | null {
  if (!Number.isInteger(radicand) || radicand < 0 || index < 2 || index > 4) return null;
  if (radicand === 0) return 0;
  const guess = Math.round(Math.pow(radicand, 1 / index));
  for (const c of [guess - 1, guess, guess + 1]) {
    if (c >= 0 && ipow(c, index) === radicand) return c;
  }
  return null;
}

// ─── Árbol de expresiones ────────────────────────────────────────────────────

type Node =
  | { t: "n"; v: number }
  | { t: "add" | "sub" | "mul" | "div" | "pow"; a: Node; b: Node }
  | { t: "root"; i: number; a: Node };

export function evalNode(n: Node): number | null {
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

function sigNode(n: Node): string {
  if (n.t === "n") return `#${n.v}`;
  if (n.t === "root") return `r${n.i}(${sigNode(n.a)})`;
  if (n.t === "add" || n.t === "mul") {
    const parts = [sigNode(n.a), sigNode(n.b)].sort();
    return `${n.t}(${parts[0]},${parts[1]})`;
  }
  return `${n.t}(${sigNode(n.a)},${sigNode(n.b)})`;
}

function fmtNum(n: number): string {
  return formatInt(n);
}

function dispAt(n: Node, parentPrec: number, side: "l" | "r", parentOp: string): string {
  if (n.t === "n") return fmtNum(n.v);
  if (n.t === "root") {
    const sym = n.i === 2 ? "√" : n.i === 3 ? "∛" : "∜";
    const inner =
      n.a.t === "n" && n.a.v >= 0 ? fmtNum(n.a.v) : `(${dispAt(n.a, 0, "l", "")})`;
    return maybeParen(sym + inner, 4, parentPrec, side, parentOp);
  }
  if (n.t === "pow" && n.b.t === "n" && n.b.v >= 0 && n.b.v < 20) {
    const base =
      n.a.t === "n" && n.a.v >= 0 ? fmtNum(n.a.v) : `(${dispAt(n.a, 0, "l", "")})`;
    return maybeParen(base + sup(n.b.v), 4, parentPrec, side, parentOp);
  }
  if (n.t === "pow") {
    const body = `${dispAt(n.a, 3, "l", "pow")} ^ ${dispAt(n.b, 3, "r", "pow")}`;
    return maybeParen(body, 3, parentPrec, side, parentOp);
  }
  const p = n.t === "mul" || n.t === "div" ? 2 : 1;
  const op =
    n.t === "add" ? " + " : n.t === "sub" ? " − " : n.t === "mul" ? " × " : " ÷ ";
  const left = dispAt(n.a, p, "l", n.t);
  const right = dispAt(n.b, p, "r", n.t);
  return maybeParen(`${left}${op}${right}`, p, parentPrec, side, parentOp);
}

function maybeParen(
  body: string,
  prec: number,
  parentPrec: number,
  side: "l" | "r",
  parentOp: string,
): string {
  if (prec < parentPrec) return `(${body})`;
  if (prec === parentPrec && side === "r" && (parentOp === "sub" || parentOp === "div")) {
    return `(${body})`;
  }
  return body;
}

export function displayNode(n: Node): string {
  return dispAt(n, 0, "l", "");
}

const SUP_INDEX = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/** Interpreta el texto que ve el usuario. Sirve para verificar el enunciado. */
export function parsePrompt(src: string): Node {
  let i = 0;
  const s = src.trim();

  function skip() {
    while (s[i] === " ") i += 1;
  }
  function parseExpr(): Node {
    let left = parseTerm();
    for (;;) {
      skip();
      if (s[i] === "+") {
        i += 1;
        left = { t: "add", a: left, b: parseTerm() };
      } else if (s[i] === "−" || s[i] === "-") {
        i += 1;
        left = { t: "sub", a: left, b: parseTerm() };
      } else break;
    }
    return left;
  }
  function parseTerm(): Node {
    let left = parseFactor();
    for (;;) {
      skip();
      if (s[i] === "×") {
        i += 1;
        left = { t: "mul", a: left, b: parseFactor() };
      } else if (s[i] === "÷") {
        i += 1;
        left = { t: "div", a: left, b: parseFactor() };
      } else break;
    }
    return left;
  }
  function parseFactor(): Node {
    skip();
    if (s[i] === "−" || s[i] === "-") {
      const prev = s[i - 1];
      const unary = i === 0 || prev === "(" || prev === " " || "+−-×÷".includes(prev ?? "");
        const next = s[i + 1] ?? "";
        if (unary && next !== " " && next !== "") {
          i += 1;
          const v = parseFactor();
          return { t: "sub", a: { t: "n", v: 0 }, b: v };
        }
    }
    return parsePow();
  }
  function parsePow(): Node {
    const base = parseAtom();
    const exp = readSup();
    if (exp == null) return base;
    return { t: "pow", a: base, b: { t: "n", v: exp } };
  }
  function readSup(): number | null {
    if (!s[i] || !SUP_INDEX.includes(s[i])) return null;
    let num = "";
    while (s[i] && SUP_INDEX.includes(s[i])) {
      num += String(SUP_INDEX.indexOf(s[i]!));
      i += 1;
    }
    return Number(num);
  }
  function parseAtom(): Node {
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
      const index = ch === "√" ? 2 : ch === "∛" ? 3 : 4;
      return { t: "root", i: index, a: parseAtom() };
    }
    const m = /^[\d\u202f]+/.exec(s.slice(i));
    if (!m) throw new Error(`no entiendo «${s.slice(i, i + 12)}»`);
    i += m[0].length;
    return { t: "n", v: Number(m[0].replace(/\u202f/g, "")) };
  }

  const node = parseExpr();
  skip();
  if (i !== s.length) throw new Error(`sobra «${s.slice(i)}»`);
  return node;
}

export function valueOfPrompt(prompt: string): number | null {
  return evalNode(parsePrompt(prompt));
}

// ─── Respuestas escritas ─────────────────────────────────────────────────────

export function parseIntegerAnswer(raw: string): number | null {
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

function parseDuration(raw: string, colon: "ms" | "hm" | "hms"): number | null {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/\u2212/g, "-")
    .replace(/\./g, "")
    .replace(/segundos|segundo/g, "s")
    .replace(/minutos|minuto/g, "min")
    .replace(/horas|hora/g, "h")
    .replace(/segs\b|seg\b/g, "s")
    .replace(/\s+/g, " ")
    .trim();
  if (!s || s.includes("-")) return null;

  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (colon === "hm") return n * 60;
    return n;
  }

  const hms = s.match(/^(\d+):(\d+):(\d+)$/);
  if (hms) {
    return Number(hms[1]) * 3600 + Number(hms[2]) * 60 + Number(hms[3]);
  }
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
  const re = /(\d+)\s*(h|min|m|s)\b/g;
  let match: RegExpExecArray | null;
  const consumed = s.replace(re, (full, num: string, unit: string) => {
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
export function parseClock(raw: string): number | null {
  let s = raw.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  if (s === "mediodia" || s === "mediodía") return 12 * 60;
  if (s === "medianoche") return 0;

  let period: "am" | "pm" | null = null;
  if (/p\s*m\b/.test(s) || /tarde|noche/.test(s)) period = "pm";
  else if (/a\s*m\b/.test(s) || /mañana/.test(s)) period = "am";

  s = s
    .replace(/de la mañana|mañana|de la tarde|de la noche|tarde|noche|mediod[ií]a|medianoche/g, " ")
    .replace(/[ap]\s*m\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
  // Dos cifras: 24 h. 12:00 es mediodía; la medianoche se escribe 00:00.
  if (hourPart.length === 2 && h <= 23) return h * 60 + min;
  return null;
}

export function formatClock(minutes: number, style: "24" | "12"): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  const mm = String(min).padStart(2, "0");
  if (style === "24") return `${String(h).padStart(2, "0")}:${mm}`;
  const period = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${period}`;
}

function formatDuration(seconds: number, colon: "ms" | "hm" | "hms"): string {
  const s = Math.max(0, Math.trunc(seconds));
  if (colon === "hm") {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}:${String(m).padStart(2, "0")}`;
  }
  if (colon === "ms") {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const INT_LABEL =
  "Número entero. Acepta espacios o puntos de millar (1 728 o 1.728).";

export function checkAnswer(ex: Exercise, raw: string): boolean {
  if (ex.answer.type === "int") {
    const n = parseIntegerAnswer(raw);
    return n !== null && n === ex.answer.value;
  }
  if (ex.answer.type === "duration") {
    const n = parseDuration(raw, ex.answer.colon);
    return n !== null && n === ex.answer.seconds;
  }
  const mins = parseClock(raw);
  return mins !== null && mins === ((ex.answer.minutes % 1440) + 1440) % 1440;
}

export function toPublic(ex: Exercise): PublicExercise {
  return {
    signature: ex.signature,
    kind: ex.kind,
    level: ex.level,
    family: ex.family,
    prompt: ex.prompt,
    answerLabel: ex.answerLabel,
    input: ex.input,
  };
}

function finishInt(
  signature: string,
  kind: Kind,
  level: Level,
  family: string,
  prompt: string,
  value: number,
  explain: string,
): Exercise {
  return {
    signature,
    kind,
    level,
    family,
    prompt,
    answerLabel: INT_LABEL,
    input: "int",
    answer: { type: "int", value },
    explain,
    solutionText: formatInt(value),
  };
}

// ─── Generadores ─────────────────────────────────────────────────────────────

function genAdd(level: Level, band: number, rng: Rng): Exercise {
  const widen = band;
  let nums: number[] = [];
  let family = "add_plain";
  if (level === 1) {
    const hi = 20 + widen * 8;
    const count = widen >= 2 && rng() < 0.45 ? 3 : 2;
    nums = Array.from({ length: count }, () => ri(rng, 1, Math.max(2, hi)));
    family = "add_small";
  } else if (level === 2) {
    const hi = 99 + widen * 40;
    if (rng() < 0.35) {
      const base = ri(rng, 2, 9 + Math.min(widen, 4)) * (rng() < 0.5 ? 10 : 100);
      const delta = ri(rng, 1, 4 + widen);
      nums = [base - delta, ri(rng, 10, hi)];
      family = "add_round";
    } else {
      nums = [ri(rng, 10, hi), ri(rng, 10, hi)];
      if (rng() < 0.3) nums.push(ri(rng, 2, 30));
      family = "add_carry";
    }
  } else if (level === 3) {
    const hi = 999 + widen * 200;
    const count = rng() < 0.4 ? 3 : 2;
    nums = Array.from({ length: count }, () => ri(rng, 40, hi));
    family = "add_carry";
  } else {
    const hi = 9999 + widen * 2000;
    const count = rng() < 0.5 ? 3 : 2;
    if (rng() < 0.4) {
      const pow10 = pick(rng, [100, 1000, 10000]);
      nums = [pow10 - ri(rng, 2, 30), ri(rng, 15, Math.min(hi, pow10))];
      family = "add_round";
    } else {
      nums = Array.from({ length: count }, () => ri(rng, 100, hi));
      family = "add_large";
    }
  }
  if (nums.reduce((sum, n) => sum + n, 0) === 0 && nums.length > 0) {
    nums = [1, ...nums.slice(1)];
  }
  const sorted = [...nums].sort((a, b) => a - b);
  const value = nums.reduce((s, n) => s + n, 0);
  const prompt = nums.map(formatInt).join(" + ");
  const explain =
    family === "add_round"
      ? "Completa al número redondo y compensa lo que sumaste de más."
      : "Suma por órdenes: unidades con unidades, decenas con decenas, y arrastra la llevada.";
  return finishInt(`add:${sorted.join("+")}`, "add", level, family, prompt, value, explain);
}

function genSub(level: Level, band: number, rng: Rng): Exercise {
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
    a = ri(rng, 200, 8000 + widen * 1000);
    b = ri(rng, 40, a);
    if (rng() < 0.45) {
      b = a - ri(rng, 2, 25);
      family = "sub_close";
    } else family = "sub_borrow";
  } else {
    a = ri(rng, 500, 50000 + widen * 5000);
    if (rng() < 0.35) {
      b = a + ri(rng, 5, 400);
      family = "sub_negative";
    } else if (rng() < 0.5) {
      b = Math.max(0, a - ri(rng, 2, 40));
      family = "sub_close";
    } else {
      b = ri(rng, 100, a);
      family = "sub_borrow";
    }
  }
  const value = a - b;
  const prompt = `${formatInt(a)} − ${formatInt(b)}`;
  const explain =
    family === "sub_negative"
      ? "Si el sustraendo es mayor, el resultado es negativo: calcula la diferencia y cambia el signo."
      : family === "sub_close"
        ? "Cuando los números están cerca, cuenta lo que falta de uno al otro."
        : family === "sub_small"
          ? "Resta por órdenes. Si no hay que pedir prestado, las unidades se restan directo."
          : "Si una cifra es menor, pide prestado a la orden siguiente.";
  return finishInt(`sub:${a}-${b}`, "sub", level, family, prompt, value, explain);
}

function genMul(level: Level, band: number, rng: Rng): Exercise {
  const widen = Math.min(band, 8);
  let factors: number[] = [];
  let family = "mul_table";
  const byTens = () => {
    const scale = level >= 3 && rng() < 0.5 ? pick(rng, [10, 100, 1000]) : pick(rng, [10, 100]);
    const hi = scale === 1000 ? 12 + widen * 4 : 40 + widen * 8;
    factors = [ri(rng, 3, Math.max(3, hi)), scale];
    family = "mul_tens";
  };
  if (level === 1) {
    const hi = Math.min(12 + widen * 2, 20);
    if (widen >= 3 && rng() < 0.4) {
      factors = [ri(rng, 2, 9), ri(rng, 2, 6), ri(rng, 2, 5)];
      family = "mul_three";
    } else {
      factors = [ri(rng, 2, hi), ri(rng, 2, hi)];
      family = "mul_table";
    }
  } else if (rng() < (level === 2 ? 0.28 : 0.22)) {
    byTens();
  } else if (level === 2) {
    if (rng() < 0.35) {
      const round = ri(rng, 2, 9) * 10;
      factors = [round + ri(rng, -2, 2), ri(rng, 3, 12)];
      family = "mul_near";
    } else {
      factors = [ri(rng, 12, 40 + widen * 8), ri(rng, 3, 12)];
      family = "mul_2digit";
    }
  } else if (level === 3) {
    if (rng() < 0.45) {
      factors = [ri(rng, 15, 80), ri(rng, 11, 30)];
      family = "mul_2digit";
    } else {
      const round = pick(rng, [20, 50, 100]);
      factors = [round + ri(rng, -3, 3), ri(rng, 4, 18)];
      family = "mul_near";
    }
  } else {
    const cap = 20000 + widen * 5000;
    for (let t = 0; t < 12; t += 1) {
      if (rng() < 0.45) {
        factors = [ri(rng, 20, 120 + widen * 10), ri(rng, 12, 40)];
        family = "mul_large";
      } else {
        factors = [pick(rng, [98, 99, 101, 102, 198, 199]), ri(rng, 3, 25)];
        family = "mul_near";
      }
      const prod = factors.reduce((s, n) => s * n, 1);
      if (prod <= cap && prod > 0) break;
    }
  }
  factors = factors.map((n) => Math.max(2, n));
  const sorted = [...factors].sort((a, b) => a - b);
  const value = factors.reduce((s, n) => s * n, 1);
  if (!Number.isSafeInteger(value) || Math.abs(value) > 500_000) {
    return genMul(level, 0, rng);
  }
  const prompt = factors.map(formatInt).join(" × ");
  const explain =
    family === "mul_near"
      ? "Multiplica por el número redondo cercano y ajusta sumando o restando el producto de la diferencia."
      : family === "mul_tens"
        ? "Multiplicar por 10, 100 o 1000 desplaza las cifras; no hace falta calcular cifra a cifra."
        : "Descompón un factor: a × (b + c) = a×b + a×c.";
  return finishInt(`mul:${sorted.join("×")}`, "mul", level, family, prompt, value, explain);
}

function genDiv(level: Level, band: number, rng: Rng): Exercise {
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
  if (dividend > 120_000) return genDiv(level, Math.max(0, band - 1), rng);
  const prompt = `${formatInt(dividend)} ÷ ${formatInt(divisor)}`;
  const explain =
    "Busca qué número, multiplicado por el divisor, devuelve el dividendo. Puedes descomponer el dividendo en partes exactas.";
  return finishInt(
    `div:${dividend}÷${divisor}`,
    "div",
    level,
    "div_exact",
    prompt,
    quot,
    explain,
  );
}

function genPow(level: Level, band: number, rng: Rng): Exercise {
  const widen = Math.min(band, 6);
  let base = 2;
  let exp = 2;
  let family = "pow_square";
  if (level === 1) {
    if (rng() < 0.75) {
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
    if (roll < 0.55) {
      base = ri(rng, 8, 25 + widen * 2);
      exp = 2;
      family = "pow_square";
    } else if (roll < 0.85) {
      base = ri(rng, 4, 10 + widen);
      exp = 3;
      family = "pow_cube";
    } else {
      base = pick(rng, [2, 3, 4, 5]);
      exp = ri(rng, 3, base === 2 ? 10 : base === 3 ? 6 : 4);
      family = "pow_other";
    }
  } else if (level === 3) {
    const roll = rng();
    if (roll < 0.5) {
      base = ri(rng, 15, 50 + widen * 3);
      exp = 2;
    } else if (roll < 0.8) {
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
    if (roll < 0.45) {
      base = ri(rng, 25, 90 + widen * 4);
      exp = 2;
    } else if (roll < 0.75) {
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
  if (value == null || (exp === 0 && base === 0)) return genPow(1, 0, rng);
  const prompt = `${formatInt(base)}${sup(exp)}`;
  const explain =
    exp === 2
      ? "El cuadrado es el número por sí mismo. Si está cerca de una decena, usa (n + d)² = n² + 2nd + d²."
      : exp === 3
        ? "El cubo es el número multiplicado tres veces. Memorizar los cubos pequeños acelera el resto."
        : "Reduce la potencia: agrupa factores iguales y reutiliza un cuadrado que ya conozcas.";
  return finishInt(`pow:${base}^${exp}`, "pow", level, family, prompt, value, explain);
}

function genRoot(level: Level, band: number, rng: Rng): Exercise {
  const widen = Math.min(band, 8);
  let index = 2;
  let result = 2;
  if (level === 1) {
    index = 2;
    result = ri(rng, 2, 12 + widen * 2);
  } else if (level === 2) {
    if (rng() < 0.7) {
      index = 2;
      result = ri(rng, 8, 30 + widen * 2);
    } else {
      index = 3;
      result = ri(rng, 2, 8 + widen);
    }
  } else if (level === 3) {
    const roll = rng();
    if (roll < 0.55) {
      index = 2;
      result = ri(rng, 12, 55 + widen * 3);
    } else if (roll < 0.9) {
      index = 3;
      result = ri(rng, 4, 15 + widen);
    } else {
      index = 4;
      result = ri(rng, 2, 6 + Math.floor(widen / 2));
    }
  } else {
    const roll = rng();
    if (roll < 0.5) {
      index = 2;
      result = ri(rng, 20, 100 + widen * 5);
    } else if (roll < 0.85) {
      index = 3;
      result = ri(rng, 6, 25 + widen);
    } else {
      index = 4;
      result = ri(rng, 2, 10);
    }
  }
  const radicand = ipow(result, index);
  if (radicand == null) return genRoot(1, 0, rng);
  const sym = index === 2 ? "√" : index === 3 ? "∛" : "∜";
  const prompt = `${sym}${formatInt(radicand)}`;
  const check = integerRoot(index, radicand);
  if (check !== result) throw new Error("raíz inexacta");
  const explain =
    index === 2
      ? "Busca qué entero, multiplicado por sí mismo, da el radicando. Acota entre decenas: 20² = 400, 30² = 900."
      : "Prueba cubos o potencias conocidas. La raíz y la potencia son operaciones inversas.";
  return finishInt(
    `root:${index}:${radicand}`,
    "root",
    level,
    index === 2 ? "root_square" : "root_higher",
    prompt,
    result,
    explain,
  );
}

function n(v: number): Node {
  return { t: "n", v };
}

function genCombo(level: Level, band: number, rng: Rng): Exercise {
  const widen = Math.min(band, 6);
  const extra = widen * (level === 1 ? 2 : 4);
  for (let attempt = 0; attempt < 24; attempt += 1) {
    let ast: Node;
    let family = "combo_prec";
    let explain = "Multiplicaciones y divisiones van antes que sumas y restas. Los paréntesis se resuelven primero.";
    const a = ri(rng, 2, 9 + extra);
    const b = ri(rng, 2, 9 + extra);
    const c = ri(rng, 2, 6 + Math.floor(extra / 2));
    const roll = rng();
    if (level === 1) {
      if (roll < 0.34) {
        ast = { t: "mul", a: { t: "add", a: n(a), b: n(b) }, b: n(c) };
        family = "combo_paren";
      } else if (roll < 0.67) {
        ast = { t: "add", a: { t: "mul", a: n(a), b: n(b) }, b: n(c) };
        family = "combo_prec";
      } else {
        const prod = a * b;
        const d = ri(rng, 1, Math.max(1, prod - 1));
        ast = { t: "sub", a: { t: "mul", a: n(a), b: n(b) }, b: n(d) };
        family = "combo_prec";
      }
    } else if (level === 2) {
      if (roll < 0.4) {
        const prod = a * b;
        const facs: number[] = [];
        for (let f = 2; f <= Math.min(prod, 24); f += 1) if (prod % f === 0) facs.push(f);
        const f = facs.length ? pick(rng, facs) : prod;
        ast = { t: "div", a: { t: "mul", a: n(a), b: n(b) }, b: n(f) };
        family = "combo_div";
        explain = "Primero el producto del paréntesis, después la división exacta.";
      } else if (roll < 0.7) {
        ast = {
          t: "sub",
          a: { t: "mul", a: { t: "add", a: n(a), b: n(b) }, b: n(c) },
          b: n(ri(rng, 1, 9)),
        };
        family = "combo_paren";
      } else {
        ast = {
          t: "add",
          a: { t: "mul", a: n(ri(rng, 4, 18 + extra)), b: n(ri(rng, 3, 9)) },
          b: { t: "mul", a: n(ri(rng, 2, 8)), b: n(ri(rng, 2, 8)) },
        };
        family = "combo_prec";
      }
    } else if (level === 3) {
      if (roll < 0.35) {
        const base = ri(rng, 4, 16 + widen);
        ast = { t: "add", a: { t: "pow", a: n(base), b: n(2) }, b: n(ri(rng, 2, 40)) };
        family = "combo_pow";
        explain = "Calcula primero la potencia y después suma o resta.";
      } else if (roll < 0.6) {
        const r = ri(rng, 4, 18);
        ast = {
          t: "add",
          a: { t: "root", i: 2, a: n(r * r) },
          b: n(ri(rng, 2, 30)),
        };
        family = "combo_root";
        explain = "La raíz se resuelve antes que la suma. Identifica el cuadrado perfecto.";
      } else if (roll < 0.8) {
        const x = ri(rng, 6, 18);
        const y = ri(rng, 1, x - 1);
        ast = {
          t: "div",
          a: { t: "sub", a: { t: "pow", a: n(x), b: n(2) }, b: { t: "pow", a: n(y), b: n(2) } },
          b: { t: "sub", a: n(x), b: n(y) },
        };
        family = "combo_pattern";
        explain = "Diferencia de cuadrados: a² − b² = (a − b)(a + b). Aquí el cociente es a + b.";
      } else {
        ast = {
          t: "mul",
          a: { t: "add", a: n(ri(rng, 8, 30)), b: n(ri(rng, 3, 12)) },
          b: n(ri(rng, 3, 9)),
        };
        family = "combo_paren";
      }
    } else {
      if (roll < 0.33) {
        const x = ri(rng, 8, 24);
        const y = ri(rng, 2, x - 2);
        ast = {
          t: "div",
          a: { t: "sub", a: { t: "pow", a: n(x), b: n(2) }, b: { t: "pow", a: n(y), b: n(2) } },
          b: { t: "add", a: n(x), b: n(y) },
        };
        family = "combo_pattern";
        explain = "a² − b² = (a − b)(a + b). Dividir entre (a + b) deja a − b.";
      } else if (roll < 0.66) {
        const r = ri(rng, 4, 12 + widen);
        ast = {
          t: "sub",
          a: { t: "mul", a: { t: "root", i: 3, a: n(ipow(r, 3) ?? 8) }, b: n(ri(rng, 2, 8)) },
          b: n(ri(rng, 1, 15)),
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
            b: { t: "add", a: n(ri(rng, 3, 9)), b: n(ri(rng, 2, 7)) },
          },
          b: { t: "pow", a: n(p > 12 ? 8 : p), b: n(2) },
        };
        family = "combo_prec";
        explain = "Paréntesis, luego potencia, luego producto y al final la suma. Guarda los resultados intermedios.";
      }
    }
    const value = evalNode(ast);
    if (value == null || !Number.isSafeInteger(value)) continue;
    if (level < 4 && value < 0) continue;
    if (Math.abs(value) > 50_000) continue;
    let prompt = "";
    try {
      prompt = displayNode(ast);
      const back = valueOfPrompt(prompt);
      if (back !== value) continue;
    } catch {
      continue;
    }
    const signature = `combo:${sigNode(ast)}`;
    return finishInt(signature, "combo", level, family, prompt, value, explain);
  }
  const ast: Node = { t: "add", a: { t: "mul", a: n(ri(rng, 2, 9)), b: n(ri(rng, 2, 9)) }, b: n(ri(rng, 2, 40)) };
  const value = evalNode(ast)!;
  const prompt = displayNode(ast);
  return finishInt(`combo:${sigNode(ast)}`, "combo", level, "combo_prec", prompt, value, "Primero el producto, después la suma.");
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtHms(total: number, parts: Array<"h" | "m" | "s">): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const bits: string[] = [];
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

function genTime(kind: "time_add" | "time_sub", level: Level, band: number, rng: Rng): Exercise {
  const widen = Math.min(band, 6);
  let x = 0;
  let y = 0;
  let parts: Array<"h" | "m" | "s"> = ["s"];
  let colon: "ms" | "hm" | "hms" = "ms";
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
    parts = ["h", "m", "s"];
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
  const sig =
    kind === "time_add" ? `tadd:${[x, y].sort((p, q) => p - q).join("+")}` : `tsub:${x}-${y}`;
  const answerLabel =
    colon === "hm"
      ? "Duración en h:mm. También vale «2 h 5 min» o el total de minutos."
      : colon === "hms"
        ? "Duración en h:mm:ss. También vale con palabras o el total de segundos."
        : "Duración en mm:ss. También vale el total de segundos o «1 min 25 s».";
  const explain =
    kind === "time_add"
      ? "Suma cada unidad. Si los segundos llegan a 60, conviértelos en un minuto; igual con los minutos y la hora."
      : "Si no alcanzan los segundos o los minutos, pide prestada una unidad a la columna de la izquierda (1 min = 60 s, 1 h = 60 min).";
  return {
    signature: sig,
    kind,
    level,
    family: kind === "time_add" ? "time_carry" : "time_borrow",
    prompt: `${left} ${op} ${right}`,
    answerLabel,
    input: "time",
    answer: { type: "duration", seconds: result, colon },
    explain,
    solutionText: formatDuration(result, colon),
  };
}

function clockLabel(mins: number): string {
  return `${formatClock(mins, "12")} (${formatClock(mins, "24")})`;
}

function genClock(kind: "clock_future" | "clock_past", level: Level, band: number, rng: Rng): Exercise {
  const widen = Math.min(band, 5);
  let start = ri(rng, 0, 1439);
  if (level >= 2 && rng() < 0.4) {
    const edge = pick(rng, [0, 12 * 60, 11 * 60 + 48, 12 * 60 + 5, 23 * 60 + 40, 23 * 60 + 55]);
    start = (edge + ri(rng, 0, 12)) % 1440;
  }
  let delta = 10;
  if (level === 1) delta = ri(rng, 5, 25 + widen * 3);
  else if (level === 2) delta = ri(rng, 20, 90 + widen * 10);
  else if (level === 3) delta = ri(rng, 40, 180 + widen * 15);
  else delta = ri(rng, 50, 400 + widen * 30) + (rng() < 0.3 ? 12 * 60 : 0);
  const signed = kind === "clock_future" ? delta : -delta;
  const end = ((start + signed) % 1440 + 1440) % 1440;
  const startLabel = formatClock(start, "12");
  const when = kind === "clock_future" ? "dentro de" : "hace";
  const deltaText =
    delta % 60 === 0
      ? `${delta / 60} h`
      : delta >= 60
        ? `${Math.floor(delta / 60)} h ${delta % 60} min`
        : `${delta} min`;
  const verb = kind === "clock_future" ? "¿Qué hora será" : "¿Qué hora era";
  const prompt = `Son las ${startLabel}. ${verb} ${when} ${deltaText}?`;
  const explain =
    end < start && kind === "clock_future"
      ? "El intervalo cruza medianoche: al pasar de 23 h vuelve a las 00:00, y el periodo a. m./p. m. cambia."
      : start < 12 * 60 && end >= 12 * 60
        ? "Cruza el mediodía: después de las 12:00 el periodo pasa de a. m. a p. m."
        : "Suma o resta los minutos. Si pasas de 60, avanza una hora. 12:00 es mediodía y 00:00 es medianoche.";
  return {
    signature: `${kind === "clock_future" ? "cf" : "cp"}:${start}${kind === "clock_future" ? "+" : "-"}${delta}`,
    kind,
    level,
    family: "clock_wrap",
    prompt,
    answerLabel:
      "Hora exacta. Vale 14:35 o 2:35 p. m. Incluye a. m./p. m. si usas formato de 12 h. 00:00 es medianoche y 12:00 es mediodía.",
    input: "time",
    answer: { type: "clock", minutes: end },
    explain,
    solutionText: clockLabel(end),
  };
}

function genConv(kind: "conv_24_12" | "conv_12_24", level: Level, band: number, rng: Rng): Exercise {
  const widen = Math.min(band, 8);
  let minutes = ri(rng, 0, 1439);
  if (level === 1 && widen < 3) {
    const span = 6 + widen * 3;
    const start = 13 * 60;
    minutes = ri(rng, start, Math.min(23 * 60 + 59, start + span * 60));
  } else if (level === 2 && widen < 2 && rng() < 0.55) {
    minutes = pick(rng, [0, 12 * 60, 15, 12 * 60 + 40, 23 * 60 + 5, 1, 11 * 60 + 59]);
  } else if ((level === 2 || level >= 3) && rng() < 0.2) {
    minutes = pick(rng, [0, 12 * 60, 12 * 60 + 1, 23 * 60 + 59]);
  }
  const from24 = kind === "conv_24_12";
  const shown = from24 ? formatClock(minutes, "24") : formatClock(minutes, "12");
  const prompt = from24
    ? `Convierte ${shown} al formato de 12 horas.`
    : `Convierte ${shown} al formato de 24 horas.`;
  return {
    signature: `${from24 ? "c24" : "c12"}:${minutes}`,
    kind,
    level,
    family: "convert",
    prompt,
    answerLabel: from24
      ? "Formato de 12 h con a. m. o p. m. También se acepta la hora equivalente en 24 h. 00:00 es medianoche (12:00 a. m.) y 12:00 es mediodía (12:00 p. m.)."
      : "Formato de 24 h, de 00:00 a 23:59. También se acepta la misma hora en 12 h con a. m. o p. m.",
    input: "time",
    answer: { type: "clock", minutes },
    explain: from24
      ? "De 13:00 a 23:59 resta 12 y marca p. m. 00:00 es 12:00 a. m. 12:00 sigue siendo 12:00 p. m."
      : "De 1:00 p. m. a 11:59 p. m. suma 12. 12:00 a. m. es 00:00. 12:00 p. m. es 12:00.",
    solutionText: clockLabel(minutes),
  };
}

const GENERATORS: Record<Kind, (level: Level, band: number, rng: Rng) => Exercise> = {
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
  conv_12_24: (l, b, r) => genConv("conv_12_24", l, b, r),
};

export function generateExercise(opts: {
  kind: Kind;
  level: Level;
  band?: number;
  rng?: Rng;
}): Exercise {
  const rng = opts.rng ?? cryptoRng();
  const band = Math.max(0, opts.band ?? 0);
  const level = (Math.min(4, Math.max(1, opts.level)) || 1) as Level;
  const ex = GENERATORS[opts.kind](level, band, rng);
  if (ex.answer.type === "int") {
    const back = valueOfPrompt(ex.prompt);
    if (back !== ex.answer.value) {
      throw new Error(`enunciado incoherente en ${opts.kind}: ${ex.prompt} → ${back} ≠ ${ex.answer.value}`);
    }
  }
  if (ex.kind === "div") {
    const [dividend, divisor] = ex.prompt.split("÷").map((p) => parseIntegerAnswer(p.trim()));
    if (!divisor || dividend == null || dividend % divisor !== 0) {
      throw new Error("división no exacta");
    }
  }
  return ex;
}

/** Cota inferior honesta del espacio de un nivel, sin contar la ampliación por agotamiento. */
export function varietyLowerBound(kind: Kind, level: Level): number {
  const table: Record<Kind, number[]> = {
    add: [200, 4_000, 400_000, 20_000_000],
    sub: [200, 8_000, 1_000_000, 40_000_000],
    mul: [60, 800, 6_000, 80_000],
    div: [100, 2_000, 12_000, 40_000],
    pow: [16, 40, 80, 150],
    root: [12, 30, 70, 140],
    combo: [400, 8_000, 40_000, 200_000],
    time_add: [2_000, 20_000, 80_000, 2_000_000],
    time_sub: [1_000, 15_000, 60_000, 1_000_000],
    clock_future: [20_000, 80_000, 150_000, 300_000],
    clock_past: [20_000, 80_000, 150_000, 300_000],
    conv_24_12: [300, 1_440, 1_440, 1_440],
    conv_12_24: [300, 1_440, 1_440, 1_440],
  };
  return table[kind][level - 1] ?? 100;
}

export function formatVariety(n: number): string {
  if (n >= 1_000_000) return `más de ${formatInt(Math.round(n / 1_000_000))} millones`;
  if (n >= 1_000) return `más de ${formatInt(n)}`;
  return `alrededor de ${formatInt(n)}`;
}

// ─── Perfil adaptativo, temporada, diagnóstico ──────────────────────────────

export type AttemptPoint = { ok: number; level: number; ms: number };

export type Adaptive = {
  ops: Record<string, { recent: AttemptPoint[]; level?: number }>;
  placement?: Record<string, number>;
};

export function emptyAdaptive(): Adaptive {
  return { ops: {} };
}

function clampKindLevel(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(4, Math.max(1, Math.round(value)));
}

export function asAdaptive(value: unknown): Adaptive {
  if (!value || typeof value !== "object") return emptyAdaptive();
  const v = value as { ops?: unknown; placement?: unknown };
  if (!v.ops || typeof v.ops !== "object") return emptyAdaptive();
  const ops: Adaptive["ops"] = {};
  for (const [key, raw] of Object.entries(v.ops as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as { recent?: unknown; level?: unknown };
    const recent = Array.isArray(row.recent)
      ? row.recent
          .filter((point) => point && typeof point === "object")
          .map((point) => {
            const item = point as AttemptPoint;
            return {
              ok: item.ok ? 1 : 0,
              level: clampKindLevel(Number(item.level) || 1),
              ms: Math.max(0, Number(item.ms) || 0),
            };
          })
          .slice(-24)
      : [];
    const stored = Number(row.level);
    ops[key] = {
      recent,
      level: Number.isFinite(stored) ? clampKindLevel(stored) : undefined,
    };
  }
  const placement: Record<string, number> = {};
  if (v.placement && typeof v.placement === "object") {
    for (const [key, raw] of Object.entries(v.placement as Record<string, unknown>)) {
      const n = Number(raw);
      if (Number.isFinite(n)) placement[key] = clampKindLevel(n);
    }
  }
  return { ops, placement };
}

const SPEED_LIMIT = [0, 8_000, 12_000, 18_000, 28_000];

function accuracyOf(rows: AttemptPoint[]): { acc: number; avg: number } {
  const acc = rows.reduce((sum, row) => sum + (row.ok ? 1 : 0), 0) / rows.length;
  const avg = rows.reduce((sum, row) => sum + row.ms, 0) / rows.length;
  return { acc, avg };
}

/** El nivel guardado solo se mueve con 8 intentos en ese mismo nivel. Practicar más fácil no lo borra. */
export function recomputeKindLevel(recent: AttemptPoint[], current: number): number {
  const base = clampKindLevel(current);
  const atCurrent = recent.filter((row) => row.level === base).slice(-8);
  if (atCurrent.length >= 8) {
    const { acc, avg } = accuracyOf(atCurrent);
    if (acc >= 0.85 && avg <= (SPEED_LIMIT[base] ?? 20_000)) return Math.min(4, base + 1);
    if (acc < 0.6) return Math.max(1, base - 1);
  }
  for (let level = 4; level > base; level -= 1) {
    const rows = recent.filter((row) => row.level === level).slice(-8);
    if (rows.length < 8) continue;
    const { acc, avg } = accuracyOf(rows);
    if (acc >= 0.85 && avg <= (SPEED_LIMIT[level] ?? 30_000)) return level;
  }
  return base;
}

export function updateAdaptive(
  prev: Adaptive,
  kind: string,
  level: number,
  ok: boolean,
  ms: number,
): Adaptive {
  const next: Adaptive = {
    ops: { ...prev.ops },
    placement: prev.placement ? { ...prev.placement } : undefined,
  };
  const prevLevel = prev.ops[kind]?.level ?? prev.placement?.[kind] ?? 1;
  const cur = next.ops[kind]?.recent ? [...next.ops[kind].recent] : [];
  cur.push({ ok: ok ? 1 : 0, level: clampKindLevel(level), ms: Math.max(0, Math.round(ms)) });
  const recent = cur.slice(-24);
  next.ops[kind] = { recent, level: recomputeKindLevel(recent, prevLevel) };
  return next;
}

export function kindLevel(a: Adaptive, kind: string): number {
  const stored = a.ops[kind]?.level;
  if (typeof stored === "number" && Number.isFinite(stored)) return clampKindLevel(stored);
  const placed = a.placement?.[kind] ?? 1;
  const recent = a.ops[kind]?.recent ?? [];
  if (recent.length < 8) return clampKindLevel(placed);
  let level = clampKindLevel(placed);
  let buffer: AttemptPoint[] = [];
  for (const point of recent) {
    buffer.push(point);
    if (buffer.length > 24) buffer = buffer.slice(-24);
    level = recomputeKindLevel(buffer, level);
  }
  return level;
}

const ALL_KINDS: Kind[] = ["add", "sub", "mul", "div", "pow", "root", "combo"];

export function overallLevel(a: Adaptive): { level: Level; perKind: Record<string, number> } {
  const perKind: Record<string, number> = {};
  for (const k of ALL_KINDS) perKind[k] = kindLevel(a, k);
  let level = Math.min(perKind.add ?? 1, perKind.sub ?? 1, perKind.mul ?? 1);
  const experts = ALL_KINDS.filter((k) => (perKind[k] ?? 1) >= 4).length;
  const nonBasic = ["pow", "root", "combo"].filter((k) => (perKind[k] ?? 1) >= 4).length;
  // El 4 no sale de sumas fáciles ni de solo aritmética: hace falta una operación no básica.
  if (level >= 4) level = experts >= 4 && nonBasic >= 1 ? 4 : 3;
  return { level: level as Level, perKind };
}

export type DiagItem = { kind: Kind; level: Level; correct: boolean; ms: number };

export function nextDiagnosticStep(items: DiagItem[]): { kind: Kind; level: Level } | null {
  const n = items.length;
  if (n >= 12) return null;
  const stageA: Array<{ kind: Kind; level: Level }> = [
    { kind: "add", level: 1 },
    { kind: "sub", level: 1 },
    { kind: "mul", level: 1 },
    { kind: "div", level: 1 },
  ];
  if (n < 4) return stageA[n]!;
  const early = items.slice(0, 4);
  const earlyAcc = early.filter((i) => i.correct).length / 4;
  const stageB: Array<{ kind: Kind; level: Level }> =
    earlyAcc < 0.5
      ? [
          { kind: "add", level: 1 },
          { kind: "sub", level: 1 },
          { kind: "mul", level: 1 },
          { kind: "div", level: 1 },
        ]
      : [
          { kind: "add", level: 2 },
          { kind: "sub", level: 2 },
          { kind: "mul", level: 2 },
          { kind: "div", level: 2 },
        ];
  if (n < 8) return stageB[n - 4]!;
  const strong = earlyAcc >= 0.75 && items.slice(4, 8).filter((i) => i.correct).length >= 3;
  const stageC: Array<{ kind: Kind; level: Level }> = strong
    ? [
        { kind: "combo", level: 2 },
        { kind: "pow", level: 2 },
        { kind: "root", level: 2 },
        { kind: "combo", level: 3 },
      ]
    : [
        { kind: "combo", level: 1 },
        { kind: "pow", level: 1 },
        { kind: "root", level: 1 },
        { kind: "mul", level: earlyAcc < 0.5 ? 1 : 2 },
      ];
  return stageC[n - 8]!;
}

export type DiagReport = {
  level: Level;
  perKind: Record<string, number>;
  mastered: string[];
  weak: string[];
  frequentErrors: string[];
  medianMs: number;
  speedLabel: string;
  recommended: Level;
  recommendations: string[];
  items: DiagItem[];
};

export function buildDiagnosticReport(items: DiagItem[]): DiagReport {
  const placement: Record<string, number> = {};
  const groups = new Map<string, DiagItem[]>();
  for (const item of items) {
    const list = groups.get(item.kind) ?? [];
    list.push(item);
    groups.set(item.kind, list);
  }
  const mastered: string[] = [];
  const weak: string[] = [];
  const frequentErrors: string[] = [];
  for (const [kind, list] of groups) {
    const correct = list.filter((i) => i.correct);
    const acc = correct.length / list.length;
    const highest = correct.reduce((m, i) => Math.max(m, i.level), 0);
    const fast = correct.filter((i) => i.ms <= 6_000 && i.level >= 2).length > 0;
    let lvl = 1;
    if (acc === 0) lvl = 1;
    else if (highest >= 2 && fast) lvl = 3;
    else if (highest >= 2) lvl = 2;
    else lvl = 1;
    if (kind === "pow" || kind === "root" || kind === "combo") lvl = Math.min(lvl, highest >= 2 ? 2 : 1);
    placement[kind] = lvl;
    const label = KIND_LABEL[kind as Kind] ?? kind;
    if (acc >= 0.99 && highest >= 1) mastered.push(label);
    if (acc < 0.67) {
      weak.push(label);
      frequentErrors.push(label);
    }
  }
  for (const k of ["add", "sub", "mul", "div"] as Kind[]) {
    if (!placement[k]) placement[k] = 1;
  }
  const adaptive: Adaptive = { ops: {}, placement };
  for (const item of items) {
    const cur = adaptive.ops[item.kind]?.recent ?? [];
    cur.push({ ok: item.correct ? 1 : 0, level: item.level, ms: item.ms });
    adaptive.ops[item.kind] = { recent: cur };
  }
  const overall = overallLevel(adaptive);
  let level = Math.min(3, overall.level) as Level;
  if ((placement.add ?? 1) === 1 && (placement.mul ?? 1) === 1 && items.filter((i) => i.correct).length <= 4) {
    level = 1;
  }
  const times = items.map((i) => i.ms).sort((a, b) => a - b);
  const medianMs = times.length ? times[Math.floor(times.length / 2)]! : 0;
  const speedLabel =
    medianMs < 4_000 ? "rápida" : medianMs < 9_000 ? "moderada" : "pausada";
  const recommendations: string[] = [];
  if (weak.includes("Multiplicación") || weak.includes("División exacta")) {
    recommendations.push("Dedica sesiones cortas del modo libre a las tablas y a divisiones exactas de nivel 1.");
  }
  if (weak.includes("Suma") || weak.includes("Resta")) {
    recommendations.push("Trabaja descomposición y compensación en el laboratorio antes de subir de nivel.");
  }
  if (!weak.length) {
    recommendations.push("La base es estable. Entra al reto diario y sube una operación cada vez en el modo libre.");
  }
  if (speedLabel === "pausada") {
    recommendations.push("Prioriza la precisión. La velocidad llegará al repetir el mismo tipo de operación, no al saltar de nivel.");
  }
  recommendations.push("El nivel experto no se concede por volumen: hay que demostrarlo en varias operaciones.");
  return {
    level,
    perKind: { ...overall.perKind, ...placement },
    mastered,
    weak,
    frequentErrors,
    medianMs,
    speedLabel,
    recommended: level,
    recommendations,
    items,
  };
}

export function seasonIndex(anchorDate: string, today: string): number {
  const days = daysBetween(anchorDate, today);
  return Math.floor(Math.max(0, days) / 30) + 1;
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ua = Date.UTC(ay!, (am ?? 1) - 1, ad ?? 1);
  const ub = Date.UTC(by!, (bm ?? 1) - 1, bd ?? 1);
  return Math.round((ub - ua) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function localDateISO(timeZone: string, date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

export function safeTimeZone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    return tz;
  } catch {
    return "UTC";
  }
}

export type SeasonInfo = {
  number: number;
  name: string;
  blurb: string;
  changes: string[];
};

export function seasonInfo(n: number): SeasonInfo {
  const number = Math.max(1, n);
  if (number === 1) {
    return {
      number,
      name: "Fundamentos",
      blurb: "Precisión en sumas, restas y tablas. La velocidad no compensa un error de base.",
      changes: [
        "El reto mezcla sobre todo sumas, restas, tablas y divisiones exactas sencillas.",
        "Tu nivel personal manda: la temporada no te sube de golpe.",
      ],
    };
  }
  if (number === 2) {
    return {
      number,
      name: "Factores",
      blurb: "Más peso en multiplicaciones y divisiones con números mayores.",
      changes: [
        "Aparecen productos de dos cifras y cocientes más largos, dentro de tu nivel.",
        "Si la precisión básica baja del 70 %, el reto vuelve a reforzar lo elemental.",
      ],
    };
  }
  if (number === 3) {
    return {
      number,
      name: "Potencias",
      blurb: "Entran con más frecuencia potencias, raíces exactas y combinadas.",
      changes: [
        "Cuadrados, cubos y raíces enteras se mezclan con las operaciones anteriores.",
        "Los récords históricos de temporadas pasadas se conservan.",
      ],
    };
  }
  if (number === 4) {
    return {
      number,
      name: "Combinación",
      blurb: "Expresiones de varios pasos y más presión de ritmo, sin saltar tu nivel real.",
      changes: [
        "El reto incluye más operaciones combinadas.",
        "La medición sigue siendo de 10 minutos reales de reloj.",
      ],
    };
  }
  return {
    number,
    name: `Amplitud ${number}`,
    blurb: "Los rangos se amplían dentro de cada nivel. No se inventa una dificultad nueva vacía.",
    changes: [
      `Banda de ampliación +${number - 4} cuando el generador necesita variedad.`,
      "El nivel experto sigue exigiendo dominio demostrado en varias operaciones.",
    ],
  };
}

export function recentAccuracy(a: Adaptive, kind: string): number | null {
  const rows = a.ops[kind]?.recent ?? [];
  if (rows.length < 4) return null;
  return rows.reduce((s, r) => s + r.ok, 0) / rows.length;
}

export function pickTrainingKind(
  season: number,
  level: Level,
  adaptive: Adaptive,
  rng: Rng,
): { kind: Kind; level: Level } {
  const remedial: Kind[] = [];
  for (const k of ["add", "sub", "mul", "div"] as Kind[]) {
    const acc = recentAccuracy(adaptive, k);
    if (acc != null && acc < 0.6) remedial.push(k);
  }
  if (remedial.length && rng() < 0.55) {
    const kind = pick(rng, remedial);
    const lv = Math.max(1, Math.min(level, kindLevel(adaptive, kind))) as Level;
    return { kind, level: lv };
  }
  const bag: Kind[] = ["add", "sub", "mul", "div"];
  if (season >= 2) bag.push("mul", "div", "mul");
  if (season >= 3 || level >= 3) bag.push("pow", "root", "combo");
  if (season >= 4) bag.push("combo", "combo", "pow");
  const kind = pick(rng, bag);
  const kindLv = Math.min(4, Math.max(1, kindLevel(adaptive, kind))) as Level;
  const practiced = adaptive.ops[kind]?.recent?.length ?? 0;
  let lv = practiced < 8 ? (Math.min(kindLv, level) as Level) : kindLv;
  if (season >= 5 && lv < 4 && practiced >= 8 && rng() < 0.15) {
    lv = Math.min(4, lv + 1) as Level;
  }
  return { kind, level: lv };
}

export function clockKinds(submode: "arith" | "clock12" | "convert"): Kind[] {
  if (submode === "arith") return ["time_add", "time_sub"];
  if (submode === "clock12") return ["clock_future", "clock_past"];
  return ["conv_24_12", "conv_12_24"];
}

export type Weakness = {
  key: string;
  label: string;
  accuracy: number;
  avgMs: number;
  attempted: number;
  suggestion: string;
};

export function findWeaknesses(
  rows: Array<{ kind: string; family: string; attempted: number; correct: number; avgMs: number }>,
): Weakness[] {
  const out: Weakness[] = [];
  for (const row of rows) {
    if (row.attempted < 5) continue;
    const accuracy = row.correct / row.attempted;
    const slow = row.avgMs > 12_000;
    if (accuracy >= 0.82 && !slow) continue;
    const label = KIND_LABEL[row.kind as Kind] ?? row.kind;
    const familyNote = row.family ? ` (${row.family.replaceAll("_", " ")})` : "";
    let suggestion = `Practica ${label.toLowerCase()} en modo libre, en el nivel donde aparecen los errores.`;
    if (row.kind === "combo") suggestion = "Repasa la jerarquía en el laboratorio y practica combinadas de nivel 1 y 2.";
    if (row.kind === "div") suggestion = "Vuelve a la relación inversa: cada división exacta es una multiplicación escondida.";
    if (row.family === "sub_borrow") suggestion = "Haz restas con préstamo en nivel 2 hasta que el error baje del 15 %.";
    if (slow && accuracy >= 0.82) suggestion = `La precisión en ${label.toLowerCase()} es buena; entrena series cortas para bajar el tiempo.`;
    out.push({
      key: `${row.kind}:${row.family}`,
      label: `${label}${familyNote}`,
      accuracy,
      avgMs: row.avgMs,
      attempted: row.attempted,
      suggestion,
    });
  }
  return out.sort((a, b) => a.accuracy - b.accuracy || b.avgMs - a.avgMs).slice(0, 6);
}

export function computeStreak(dates: string[], today: string): { current: number; best: number } {
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
  return { current, best };
}

export const DAILY_MS = 10 * 60 * 1000;

export function recordLabel(key: string): string {
  const map: Record<string, string> = {
    "daily:correct": "Más aciertos en 10 minutos",
    "daily:attempted": "Más ejercicios respondidos en 10 minutos",
    "daily:accuracy": "Mayor precisión en una sesión completa",
    "daily:avg_correct_ms": "Menor tiempo medio por acierto",
    best_streak: "Mejor racha de días",
  };
  if (map[key]) return map[key];
  if (key.startsWith("daily:kind:")) {
    const kind = key.split(":")[2] ?? "";
    return `Aciertos en 10 min · ${KIND_LABEL[kind as Kind] ?? kind}`;
  }
  if (key.startsWith("daily:level:")) {
    return `Aciertos en 10 min · nivel ${key.split(":")[2]}`;
  }
  return key;
}
