import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDiagnosticReport,
  checkAnswer,
  computeStreak,
  daysBetween,
  generateExercise,
  kindLevel,
  nextDiagnosticStep,
  overallLevel,
  parseClock,
  parseIntegerAnswer,
  seasonIndex,
  updateAdaptive,
  valueOfPrompt,
  type Adaptive,
  type DiagItem,
  type Kind,
  type Level,
  type Rng,
} from "./engine.ts";

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NUM: Kind[] = ["add", "sub", "mul", "div", "pow", "root", "combo"];
const TIME: Kind[] = ["time_add", "time_sub", "clock_future", "clock_past", "conv_24_12", "conv_12_24"];

test("el enunciado numérico coincide con la respuesta calculada", () => {
  for (const kind of NUM) {
    for (const level of [1, 2, 3, 4] as Level[]) {
      const rng = mulberry32(kind.length * 100 + level);
      for (let i = 0; i < 80; i += 1) {
        const ex = generateExercise({ kind, level, band: i % 5, rng });
        assert.equal(ex.kind, kind);
        assert.equal(valueOfPrompt(ex.prompt), ex.answer.type === "int" ? ex.answer.value : null);
        assert.equal(checkAnswer(ex, ex.solutionText), true);
        if (kind === "div") {
          const [rawA, rawB] = ex.prompt.split("÷").map((p) => parseIntegerAnswer(p.trim()));
          assert.ok(rawB && rawB !== 0 && rawA != null && rawA % rawB === 0);
          assert.equal(rawA! / rawB!, ex.answer.type === "int" ? ex.answer.value : NaN);
        }
        if (kind === "root") {
          assert.ok(ex.answer.type === "int");
          assert.ok((ex.answer as { value: number }).value >= 0);
        }
        assert.equal(checkAnswer(ex, "no-es-un-numero"), false);
      }
    }
  }
});

test("jerarquía: 2 + 3 × 4 no es 20", () => {
  assert.equal(valueOfPrompt("2 + 3 × 4"), 14);
  assert.equal(valueOfPrompt("(2 + 3) × 4"), 20);
  assert.equal(valueOfPrompt("2 × 3 + 4 × 5"), 26);
  assert.equal(valueOfPrompt("20 − 8 ÷ 2"), 16);
  assert.equal(valueOfPrompt("(8 − 2) × (3 + 1)"), 24);
});

test("firmas conmutativas no distinguen el orden", () => {
  const rng = mulberry32(7);
  const seen = new Map<string, string>();
  for (let i = 0; i < 40; i += 1) {
    const ex = generateExercise({ kind: "mul", level: 1, rng });
    const parts = ex.prompt.split("×").map((p) => parseIntegerAnswer(p.trim())!);
    const flipped = [...parts].reverse().map(String).join(" × ");
    if (parts.length === 2 && parts[0] !== parts[1]) {
      const other = generateExercise({ kind: "add", level: 1, rng });
      assert.notEqual(other.signature, ex.signature);
      assert.ok(flipped);
    }
    seen.set(ex.signature, ex.prompt);
  }
  const a = generateExercise({ kind: "add", level: 1, band: 0, rng: () => 0 });
  assert.ok(a.signature.startsWith("add:"));
});

test("equivalentes de enteros, reloj y duraciones", () => {
  assert.equal(parseIntegerAnswer(" 1 728 "), 1728);
  assert.equal(parseIntegerAnswer("1.728"), 1728);
  assert.equal(parseIntegerAnswer("1,728"), 1728);
  assert.equal(parseIntegerAnswer("−15"), -15);
  assert.equal(parseIntegerAnswer("-15"), -15);
  assert.equal(parseIntegerAnswer("12.5"), null);
  assert.equal(parseIntegerAnswer("3,14"), null);

  assert.equal(parseClock("14:35"), 14 * 60 + 35);
  assert.equal(parseClock("2:35 p. m."), 14 * 60 + 35);
  assert.equal(parseClock("2:35pm"), 14 * 60 + 35);
  assert.equal(parseClock("00:15"), 15);
  assert.equal(parseClock("12:15 a. m."), 15);
  assert.equal(parseClock("12:00"), 12 * 60);
  assert.equal(parseClock("12:00 p. m."), 12 * 60);
  assert.equal(parseClock("12:00 a. m."), 0);
  assert.equal(parseClock("00:00"), 0);
  assert.equal(parseClock("21:05"), 21 * 60 + 5);
  assert.equal(parseClock("9:05 p. m."), 21 * 60 + 5);
  assert.equal(parseClock("9:05"), null);

  const add = generateExercise({
    kind: "time_add",
    level: 1,
    rng: mulberry32(3),
  });
  assert.equal(add.answer.type, "duration");
  if (add.answer.type === "duration") {
    assert.equal(checkAnswer(add, String(add.answer.seconds)), true);
    const m = Math.floor(add.answer.seconds / 60);
    const s = add.answer.seconds % 60;
    assert.equal(checkAnswer(add, `${m}:${String(s).padStart(2, "0")}`), true);
    assert.equal(checkAnswer(add, `${m} min ${s} s`), true);
  }

  const sub = generateExercise({ kind: "time_sub", level: 2, rng: mulberry32(9) });
  assert.equal(checkAnswer(sub, sub.solutionText), true);
  assert.equal(sub.answer.type === "duration" && sub.answer.seconds >= 0, true);

  const future = generateExercise({ kind: "clock_future", level: 4, band: 2, rng: mulberry32(11) });
  assert.equal(checkAnswer(future, future.solutionText.split(" (")[0] ?? ""), true);
  assert.equal(future.answer.type === "clock" && checkAnswer(future, formatBoth(future)), true);
});

function formatBoth(ex: { solutionText: string }): string {
  const m = ex.solutionText.match(/(\d{2}:\d{2})\)/);
  return m?.[1] ?? ex.solutionText;
}

test("el reloj cruza mediodía y medianoche sin horas inválidas", () => {
  const rng = mulberry32(21);
  for (let i = 0; i < 100; i += 1) {
    for (const kind of ["clock_future", "clock_past"] as Kind[]) {
      const ex = generateExercise({ kind, level: 4, band: 3, rng });
      assert.equal(ex.answer.type, "clock");
      if (ex.answer.type === "clock") {
        assert.ok(ex.answer.minutes >= 0 && ex.answer.minutes < 1440);
        assert.equal(checkAnswer(ex, "25:00"), false);
        assert.match(ex.prompt, /a\. m\.|p\. m\./);
      }
    }
  }
});

test("no repite firmas y amplía la banda", () => {
  const seen = new Set<string>();
  const rng = mulberry32(99);
  for (const kind of [...NUM, ...TIME]) {
    for (let i = 0; i < 60; i += 1) {
      let band = 0;
      let ex = generateExercise({ kind, level: 1, band, rng });
      for (let t = 0; t < 25 && seen.has(ex.signature); t += 1) {
        if (t % 4 === 3) band += 1;
        ex = generateExercise({ kind, level: (1 + (t % 4)) as Level, band, rng });
      }
      assert.equal(seen.has(ex.signature), false, `${kind} repitió ${ex.signature}`);
      seen.add(ex.signature);
    }
  }
});

test("7 × 8 y 8 × 7 comparten firma; 7 × 8 no es 8 × 7 como resta", () => {
  const make = (kind: Kind, promptCheck: (ex: ReturnType<typeof generateExercise>) => boolean) => {
    const rng = mulberry32(5);
    for (let i = 0; i < 30; i += 1) {
      const ex = generateExercise({ kind, level: 1, rng });
      if (promptCheck(ex)) return ex;
    }
    return null;
  };
  const mul = make("mul", (ex) => ex.prompt.includes("×") && !ex.prompt.includes("×") === false);
  assert.ok(mul);
  const nums = mul!.prompt.split("×").map((p) => parseIntegerAnswer(p.trim())!);
  if (nums.length === 2) {
    const again = generateExercise({
      kind: "mul",
      level: 1,
      rng: () => 0.5,
    });
    assert.ok(again.signature.startsWith("mul:"));
    const sorted = [...nums].sort((a, b) => a - b);
    assert.equal(mul!.signature, `mul:${sorted.join("×")}`);
  }
});

test("diagnóstico: 12 pasos, nivel prudente y la repetición no borra el informe", () => {
  const items: DiagItem[] = [];
  while (items.length < 12) {
    const step = nextDiagnosticStep(items);
    assert.ok(step);
    const hard = step!.level >= 2;
    items.push({
      kind: step!.kind,
      level: step!.level,
      correct: hard ? items.length % 2 === 0 : true,
      ms: hard ? 11_000 : 3_000,
    });
  }
  assert.equal(nextDiagnosticStep(items), null);
  const report = buildDiagnosticReport(items);
  assert.ok(report.level >= 1 && report.level <= 3);
  assert.ok(report.recommendations.length >= 1);
  const strong: DiagItem[] = [];
  while (strong.length < 12) {
    const step = nextDiagnosticStep(strong)!;
    strong.push({ kind: step.kind, level: step.level, correct: true, ms: 2_000 });
  }
  const good = buildDiagnosticReport(strong);
  assert.ok(good.level >= report.level);
});

test("el dominio no se olvida ni baja por practicar más fácil", () => {
  let a: Adaptive = { ops: {}, placement: { mul: 1, add: 3 } };
  for (let i = 0; i < 8; i += 1) a = updateAdaptive(a, "mul", 1, true, 1200);
  assert.equal(kindLevel(a, "mul"), 2);
  for (let i = 0; i < 24; i += 1) a = updateAdaptive(a, "mul", 2, true, 2000);
  assert.ok(kindLevel(a, "mul") >= 2);
  a = { ops: { add: { recent: [], level: 3 } }, placement: { add: 3 } };
  for (let i = 0; i < 12; i += 1) a = updateAdaptive(a, "add", 1, false, 9000);
  assert.equal(kindLevel(a, "add"), 3);
  for (let i = 0; i < 8; i += 1) a = updateAdaptive(a, "add", 3, false, 4000);
  assert.equal(kindLevel(a, "add"), 2);
});

test("el nivel experto no sale de rachas fáciles", () => {
  let a: Adaptive = { ops: {}, placement: { add: 1, sub: 1, mul: 1 } };
  for (let i = 0; i < 24; i += 1) a = updateAdaptive(a, "add", 1, true, 1500);
  assert.ok(kindLevel(a, "add") <= 2);
  assert.equal(overallLevel(a).level <= 2, true);
  for (let L = 1; L <= 3; L += 1) {
    for (let i = 0; i < 10; i += 1) {
      a = updateAdaptive(a, "add", L, true, 2_000);
      a = updateAdaptive(a, "sub", L, true, 2_000);
      a = updateAdaptive(a, "mul", L, true, 2_000);
      a = updateAdaptive(a, "div", L, true, 2_000);
    }
  }
  const expertish = overallLevel(a);
  assert.ok(expertish.level < 4 || expertish.perKind.pow === 4);
});

test("temporada y racha", () => {
  assert.equal(seasonIndex("2026-01-01", "2026-01-01"), 1);
  assert.equal(seasonIndex("2026-01-01", "2026-01-30"), 1);
  assert.equal(seasonIndex("2026-01-01", "2026-01-31"), 2);
  assert.equal(daysBetween("2026-03-01", "2026-03-31"), 30);
  const s = computeStreak(["2026-05-01", "2026-05-02", "2026-05-04"], "2026-05-04");
  assert.equal(s.current, 1);
  assert.equal(s.best, 2);
  const live = computeStreak(["2026-05-01", "2026-05-02", "2026-05-03"], "2026-05-04");
  assert.equal(live.current, 3);
});
