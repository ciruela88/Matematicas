import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { C as seasonIndex, E as updateAdaptive, S as safeTimeZone, T as toPublic, _ as localDateISO, b as pickTrainingKind, c as buildDiagnosticReport, d as computeStreak, f as emptyAdaptive, g as getLesson, h as generateExercise, l as checkAnswer, n as KIND_LABEL, o as asAdaptive, p as findWeaknesses, r as LESSONS, s as authMiddleware, t as DAILY_MS, u as clockKinds, v as nextDiagnosticStep, w as seasonInfo, x as recordLabel, y as overallLevel } from "./engine-BJ3P1mPN.mjs";
import { r as getSql } from "./db-Cjenhu53.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/training-3iYi4Ui2.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function toJson(value) {
	if (value == null) return null;
	if (typeof value === "string" || typeof value === "boolean") return value;
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value === "bigint") return Number(value);
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map((item) => toJson(item));
	if (typeof value === "object") {
		const out = {};
		for (const [key, item] of Object.entries(value)) out[key] = toJson(item);
		return out;
	}
	return String(value);
}
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
function asDate(value) {
	if (value instanceof Date) return value;
	return new Date(String(value));
}
function asJson(value, fallback) {
	if (value == null) return fallback;
	if (typeof value === "string") try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
	return value;
}
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
function configOf(row) {
	return asJson(row.config, {});
}
function exerciseOf(value) {
	const ex = asJson(value, null);
	if (!ex || typeof ex !== "object" || !("signature" in ex) || !("answer" in ex)) return null;
	return ex;
}
async function dbNow(sql) {
	return asDate((await sql`select now() as now`)[0]?.now ?? /* @__PURE__ */ new Date());
}
async function loadProfile(sql, userId) {
	return (await sql`select * from profiles where user_id = ${userId} limit 1`)[0] ?? null;
}
async function loadSession(sql, userId, id) {
	return (await sql`
    select * from sessions where id = ${id} and user_id = ${userId} limit 1
  `)[0] ?? null;
}
function isExpired(row, now) {
	if (row.duration_ms == null || row.status !== "active") return false;
	return now.getTime() - asDate(row.started_at).getTime() >= row.duration_ms;
}
function viewOf(row, now) {
	const current = row.status === "active" ? exerciseOf(row.current_payload) : null;
	return {
		id: row.id,
		mode: row.mode,
		status: row.status,
		startedAt: asDate(row.started_at).toISOString(),
		serverNow: now.toISOString(),
		durationMs: row.duration_ms,
		attempted: num(row.attempted),
		correct: num(row.correct),
		incorrect: num(row.incorrect),
		abandoned: num(row.abandoned),
		sumResponseMs: num(row.sum_response_ms),
		sumCorrectMs: num(row.sum_correct_ms),
		current: current ? toPublic(current) : null,
		finishedAt: row.finished_at ? asDate(row.finished_at).toISOString() : null,
		countsForStreak: Boolean(row.counts_for_streak),
		config: configOf(row),
		result: row.result == null ? null : toJson(row.result)
	};
}
async function chooseSpec(sql, profile, row) {
	const cfg = configOf(row);
	const adaptive = asAdaptive(profile.adaptive);
	const level = clampLevel(profile.level);
	if (row.mode === "diagnostic") {
		const items = await diagItems(sql, profile.user_id, row.id);
		const step = nextDiagnosticStep(items);
		if (!step) return {
			kind: "add",
			level: 1
		};
		return step;
	}
	if (row.mode === "daily") return pickTrainingKind(num(profile.season_number), level, adaptive, Math.random);
	if (row.mode === "clock") {
		const kinds = clockKinds(cfg.submode ?? "arith");
		return {
			kind: kinds[Math.floor(Math.random() * kinds.length)],
			level: clampLevel(cfg.level ?? 1)
		};
	}
	if (row.mode === "lab") {
		const lesson = getLesson(cfg.lessonId ?? "");
		const kinds = lesson?.practice.kinds ?? ["add"];
		return {
			kind: kinds[Math.floor(Math.random() * kinds.length)],
			level: lesson?.practice.level ?? 1
		};
	}
	const kinds = (cfg.kinds ?? []).filter((k) => KINDS.has(k));
	const pool = kinds.length ? kinds : ["add"];
	const weights = pool.map((k) => Math.max(0, num(cfg.weights?.[k] ?? 1)) || 0);
	const sum = weights.reduce((a, b) => a + b, 0) || pool.length;
	let ticket = Math.random() * (weights.some((w) => w > 0) ? sum : pool.length);
	if (!weights.some((w) => w > 0)) return {
		kind: pool[Math.floor(Math.random() * pool.length)],
		level: clampLevel(cfg.level ?? 1)
	};
	for (let i = 0; i < pool.length; i += 1) {
		ticket -= weights[i] || 0;
		if (ticket <= 0) return {
			kind: pool[i],
			level: clampLevel(cfg.level ?? level)
		};
	}
	return {
		kind: pool[pool.length - 1],
		level: clampLevel(cfg.level ?? level)
	};
}
async function issueNext(sql, profile, row) {
	const cfg = configOf(row);
	if (cfg.count != null && num(row.attempted) >= cfg.count) return null;
	if (row.mode === "diagnostic") {
		const items = await diagItems(sql, profile.user_id, row.id);
		if (!nextDiagnosticStep(items)) return null;
	}
	const seasonBoost = row.mode === "daily" ? Math.max(0, num(profile.season_number) - 4) : 0;
	let lastError = "";
	for (let i = 0; i < 72; i += 1) {
		const spec = await chooseSpec(sql, profile, row);
		const band = seasonBoost + Math.floor(i / 3);
		let ex;
		try {
			ex = generateExercise({
				kind: spec.kind,
				level: spec.level,
				band
			});
		} catch (error) {
			lastError = error instanceof Error ? error.message : "generador";
			continue;
		}
		if (!(await sql`
      insert into seen_exercises (user_id, signature, kind, level, mode, payload)
      values (
        ${profile.user_id},
        ${ex.signature},
        ${ex.kind},
        ${ex.level},
        ${row.mode},
        ${JSON.stringify(ex)}::jsonb
      )
      on conflict (user_id, signature) do nothing
      returning signature
    `).length) continue;
		if ((await sql`
      update sessions
      set current_signature = ${ex.signature},
          current_payload = ${JSON.stringify(ex)}::jsonb,
          current_presented_at = now()
      where id = ${row.id}
        and user_id = ${profile.user_id}
        and status = 'active'
        and current_signature is null
      returning id
    `).length) return ex;
		await sql`
      delete from seen_exercises
      where user_id = ${profile.user_id}
        and signature = ${ex.signature}
        and not exists (
          select 1 from sessions
          where user_id = ${profile.user_id}
            and status = 'active'
            and current_signature = ${ex.signature}
        )
    `;
		const fresh = await loadSession(sql, profile.user_id, row.id);
		if (!fresh || fresh.status !== "active") return null;
		const current = exerciseOf(fresh.current_payload);
		if (current) return current;
	}
	throw new Error(lastError || "No queda una operación nueva en este conjunto. Cambia de tipo o de nivel: no voy a repetir una ya mostrada.");
}
async function diagItems(sql, userId, sessionId) {
	return (await sql`
    select kind, level, correct, response_ms
    from attempts
    where user_id = ${userId} and session_id = ${sessionId} and skipped = false
    order by id
  `).map((row) => ({
		kind: row.kind,
		level: clampLevel(row.level),
		correct: Boolean(row.correct),
		ms: num(row.response_ms)
	}));
}
async function putRecord(sql, userId, key, value, sessionId, better, meta) {
	return {
		key,
		value,
		improved: (better === "max" ? await sql`
          insert into records (user_id, record_key, value, meta, session_id, achieved_at)
          values (${userId}, ${key}, ${value}, ${JSON.stringify({
			...meta,
			better
		})}::jsonb, ${sessionId}, now())
          on conflict (user_id, record_key)
          do update set value = excluded.value, meta = excluded.meta, session_id = excluded.session_id, achieved_at = now()
          where records.value < excluded.value
          returning record_key
        ` : await sql`
          insert into records (user_id, record_key, value, meta, session_id, achieved_at)
          values (${userId}, ${key}, ${value}, ${JSON.stringify({
			...meta,
			better
		})}::jsonb, ${sessionId}, now())
          on conflict (user_id, record_key)
          do update set value = excluded.value, meta = excluded.meta, session_id = excluded.session_id, achieved_at = now()
          where records.value > excluded.value
          returning record_key
        `).length > 0
	};
}
async function applyDailyRecords(sql, userId, session) {
	const attempted = num(session.attempted);
	const correct = num(session.correct);
	const improved = [];
	improved.push(await putRecord(sql, userId, "daily:correct", correct, session.id, "max", { attempted }));
	improved.push(await putRecord(sql, userId, "daily:attempted", attempted, session.id, "max", { correct }));
	if (attempted >= 15) {
		const accuracy = correct / attempted * 100;
		improved.push(await putRecord(sql, userId, "daily:accuracy", accuracy, session.id, "max", {
			attempted,
			correct,
			minimum: 15
		}));
	}
	if (correct >= 10) {
		const avg = num(session.sum_correct_ms) / correct;
		improved.push(await putRecord(sql, userId, "daily:avg_correct_ms", avg, session.id, "min", {
			correct,
			minimum: 10
		}));
	}
	const groups = await sql`
    select kind, level, count(*) filter (where correct)::int as correct
    from attempts
    where user_id = ${userId} and session_id = ${session.id} and skipped = false
    group by kind, level
  `;
	const byKind = /* @__PURE__ */ new Map();
	const byLevel = /* @__PURE__ */ new Map();
	for (const group of groups) {
		byKind.set(group.kind, (byKind.get(group.kind) ?? 0) + num(group.correct));
		byLevel.set(num(group.level), (byLevel.get(num(group.level)) ?? 0) + num(group.correct));
	}
	for (const [kind, correctCount] of byKind) improved.push(await putRecord(sql, userId, `daily:kind:${kind}:correct`, correctCount, session.id, "max", {}));
	for (const [level, correctCount] of byLevel) improved.push(await putRecord(sql, userId, `daily:level:${level}:correct`, correctCount, session.id, "max", {}));
	return improved.filter((item) => item.improved);
}
async function finalize(sql, profile, row, reason) {
	const elapsed = (await dbNow(sql)).getTime() - asDate(row.started_at).getTime();
	const full = row.mode === "daily" && row.duration_ms != null && (reason === "time" || elapsed >= row.duration_ms - 1500);
	const closed = await sql`
    update sessions
    set status = 'completed',
        finished_at = now(),
        counts_for_streak = ${full},
        time_accounted = true,
        current_signature = null,
        current_payload = null,
        current_presented_at = null
    where id = ${row.id} and user_id = ${profile.user_id} and status = 'active'
    returning *
  `;
	const session = closed[0] ?? await loadSession(sql, profile.user_id, row.id);
	if (!session) throw new Error("No encuentro la sesión.");
	if (!closed[0]) return session;
	let records = [];
	if (full) records = await applyDailyRecords(sql, profile.user_id, session);
	if (full) await sql`
      insert into day_stats (user_id, local_date, daily_completed, best_daily_correct)
      values (${profile.user_id}, ${session.local_date}, true, ${num(session.correct)})
      on conflict (user_id, local_date) do update set
        daily_completed = true,
        best_daily_correct = greatest(day_stats.best_daily_correct, ${num(session.correct)})
    `;
	let diagReport = null;
	let closeReason = full ? "time" : reason;
	if (session.mode === "diagnostic") {
		const items = await diagItems(sql, profile.user_id, session.id);
		if (!(items.length >= 12 && nextDiagnosticStep(items) == null)) {
			closeReason = "incomplete";
			diagReport = {
				incomplete: true,
				answered: items.length
			};
		} else {
			const report = buildDiagnosticReport(items);
			diagReport = report;
			const isBaseline = (await sql`
      select id from diagnostics where user_id = ${profile.user_id} and is_baseline limit 1
    `).length === 0;
			try {
				await sql`
        insert into diagnostics (user_id, is_baseline, report)
        values (${profile.user_id}, ${isBaseline}, ${JSON.stringify(report)}::jsonb)
      `;
			} catch {
				await sql`
        insert into diagnostics (user_id, is_baseline, report)
        values (${profile.user_id}, false, ${JSON.stringify(report)}::jsonb)
      `;
			}
			if (isBaseline) {
				const seeded = {
					ops: {},
					placement: report.perKind
				};
				for (const item of items) {
					const recent = seeded.ops[item.kind]?.recent ?? [];
					recent.push({
						ok: item.correct ? 1 : 0,
						level: item.level,
						ms: item.ms
					});
					seeded.ops[item.kind] = {
						recent,
						level: report.perKind[item.kind] ?? 1
					};
				}
				await sql`
        update profiles
        set diagnostic_done = true, level = ${report.level}, adaptive = ${JSON.stringify(seeded)}::jsonb
        where user_id = ${profile.user_id}
      `;
			} else await sql`
        update profiles set diagnostic_done = true
        where user_id = ${profile.user_id}
      `;
		}
	}
	if (session.mode === "lab" && configOf(session).quiz && configOf(session).lessonId) {
		const lessonId = configOf(session).lessonId;
		const score = num(session.correct);
		const total = num(session.attempted);
		await sql`
      insert into lab_progress (user_id, lesson_id, quiz_score, quiz_total, mastered)
      values (
        ${profile.user_id},
        ${lessonId},
        ${score},
        ${total},
        ${score >= 2 && total >= 3}
      )
      on conflict (user_id, lesson_id) do update set
        quiz_score = ${score},
        quiz_total = ${total},
        mastered = (lab_progress.practice_attempted >= 3 and ${score} >= 2 and ${total} >= 3),
        updated_at = now()
    `;
	}
	const accuracy = num(session.attempted) ? Math.round(num(session.correct) / num(session.attempted) * 1e3) / 10 : 0;
	const result = {
		reason: closeReason,
		full,
		accuracy,
		avgCorrectMs: num(session.correct) ? Math.round(num(session.sum_correct_ms) / num(session.correct)) : null,
		records: records.map((item) => ({
			...item,
			label: recordLabel(item.key)
		})),
		report: diagReport
	};
	await sql`
    update sessions set result = ${JSON.stringify(result)}::jsonb
    where id = ${session.id} and user_id = ${profile.user_id}
  `;
	return await loadSession(sql, profile.user_id, session.id) ?? session;
}
async function hydrate(sql, profile, row) {
	let current = await loadSession(sql, profile.user_id, row.id) ?? row;
	if (current.status !== "active") return current;
	const now = await dbNow(sql);
	if (isExpired(current, now)) return finalize(sql, profile, current, "time");
	if (!current.current_signature) {
		if (!await issueNext(sql, profile, current)) return finalize(sql, profile, current, "complete");
		current = await loadSession(sql, profile.user_id, row.id) ?? current;
	}
	return current;
}
async function touchAdaptive(sql, profile, kind, level, ok, ms) {
	const fresh = await loadProfile(sql, profile.user_id) ?? profile;
	const next = updateAdaptive(asAdaptive(fresh.adaptive), kind, level, ok, ms);
	const levelNow = overallLevel(next).level;
	await sql`
    update profiles
    set adaptive = ${JSON.stringify(next)}::jsonb, level = ${levelNow}
    where user_id = ${profile.user_id}
  `;
}
async function rollSeasons(sql, profile, today) {
	const target = seasonIndex(profile.anchor_date, today);
	let season = num(profile.season_number) || 1;
	if (target <= season) return profile;
	while (season < target) {
		const summaryRows = await sql`
      select
        count(*) filter (where not a.skipped)::int as attempted,
        count(*) filter (where a.correct and not a.skipped)::int as correct
      from attempts a
      join sessions s on s.id = a.session_id and s.user_id = a.user_id
      where a.user_id = ${profile.user_id} and s.season_number = ${season}
    `;
		const summary = {
			attempted: num(summaryRows[0]?.attempted),
			correct: num(summaryRows[0]?.correct),
			name: seasonInfo(season).name
		};
		await sql`
      insert into season_archive (user_id, season_number, ended_on, summary)
      values (${profile.user_id}, ${season}, ${today}, ${JSON.stringify(summary)}::jsonb)
      on conflict (user_id, season_number) do nothing
    `;
		season += 1;
	}
	await sql`
    update profiles set season_number = ${target}
    where user_id = ${profile.user_id}
  `;
	return await loadProfile(sql, profile.user_id) ?? {
		...profile,
		season_number: target
	};
}
async function ensure(sql, userId, timezone) {
	const tz = safeTimeZone(timezone);
	await sql`
    insert into profiles (user_id, timezone, anchor_date, adaptive)
    values (${userId}, ${tz}, ${localDateISO(tz)}, ${JSON.stringify(emptyAdaptive())}::jsonb)
    on conflict (user_id) do nothing
  `;
	const profile = await loadProfile(sql, userId);
	if (!profile) throw new Error("No pude crear el perfil.");
	return rollSeasons(sql, profile, localDateISO(profile.timezone || tz));
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
async function closeDangling(sql, profile, mode) {
	if (mode === "diagnostic") return;
	const rows = await sql`
    select * from sessions
    where user_id = ${profile.user_id} and mode = ${mode} and status = 'active'
  `;
	for (const row of rows) {
		const now = await dbNow(sql);
		if (row.mode === "daily") {
			if (isExpired(row, now)) await finalize(sql, profile, row, "time");
			continue;
		}
		await finalize(sql, profile, row, "user");
	}
}
async function buildBootstrap(sql, profile) {
	const today = localDateISO(profile.timezone);
	const days = await sql`
    select local_date, daily_completed from day_stats
    where user_id = ${profile.user_id} and daily_completed = true
  `;
	const streak = computeStreak(days.map((d) => d.local_date), today);
	if (streak.best > 0) await putRecord(sql, profile.user_id, "best_streak", streak.best, "streak", "max", {});
	const todayRows = await sql`
    select attempted, correct, daily_completed, free_practiced
    from day_stats where user_id = ${profile.user_id} and local_date = ${today} limit 1
  `;
	const active = await sql`
    select id, mode, config from sessions
    where user_id = ${profile.user_id} and status = 'active'
      and mode in ('daily', 'diagnostic', 'free', 'clock', 'lab')
    order by started_at desc
  `;
	let activeDailyId = null;
	let activeDiagnosticId = null;
	let activeFreeId = null;
	let activeClockId = null;
	let activeLab = null;
	for (const row of active) {
		const full = await loadSession(sql, profile.user_id, row.id);
		if (!full) continue;
		const now = await dbNow(sql);
		if (full.mode === "daily" && isExpired(full, now)) {
			await finalize(sql, profile, full, "time");
			continue;
		}
		if (full.mode === "daily" && !activeDailyId) activeDailyId = full.id;
		if (full.mode === "diagnostic" && !activeDiagnosticId) activeDiagnosticId = full.id;
		if (full.mode === "free" && !activeFreeId) activeFreeId = full.id;
		if (full.mode === "clock" && !activeClockId) activeClockId = full.id;
		if (full.mode === "lab" && !activeLab) activeLab = {
			id: full.id,
			lessonId: configOf(full).lessonId ?? null
		};
	}
	const baseline = await sql`
    select id from diagnostics where user_id = ${profile.user_id} and is_baseline limit 1
  `;
	const seen = await sql`
    select count(*)::int as n from seen_exercises where user_id = ${profile.user_id}
  `;
	const previous = await sql`
    select season_number, summary from season_archive
    where user_id = ${profile.user_id}
    order by season_number desc limit 1
  `;
	const adaptive = asAdaptive(profile.adaptive);
	const overall = overallLevel(adaptive);
	const todayRow = todayRows[0];
	return {
		timezone: profile.timezone,
		theme: profile.theme === "ink" ? "ink" : "paper",
		soundOn: Boolean(profile.sound_on),
		level: clampLevel(profile.level || overall.level),
		perKind: overall.perKind,
		season: seasonInfo(num(profile.season_number) || 1),
		seasonSeen: num(profile.season_seen),
		previousSeason: previous[0] ? {
			number: num(previous[0].season_number),
			summary: toJson(previous[0].summary)
		} : null,
		diagnosticDone: Boolean(profile.diagnostic_done),
		hasBaseline: baseline.length > 0,
		streak,
		today,
		todayStats: {
			attempted: num(todayRow?.attempted),
			correct: num(todayRow?.correct),
			dailyCompleted: Boolean(todayRow?.daily_completed),
			freePracticed: Boolean(todayRow?.free_practiced)
		},
		activeDailyId,
		activeDiagnosticId,
		activeFreeId,
		activeClockId,
		activeLab,
		seenCount: num(seen[0]?.n)
	};
}
var getBootstrap_createServerFn_handler = createServerRpc({
	id: "6b5c591ba38e4721502fee7df2cffa933b975ed1ba9b727be4b27023021435a4",
	name: "getBootstrap",
	filename: "src/lib/server/training.ts"
}, (opts) => getBootstrap.__executeServer(opts));
var getBootstrap = createServerFn({ method: "POST" }).validator((data) => ({ timezone: safeTimeZone(data?.timezone) })).middleware([authMiddleware]).handler(getBootstrap_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	return buildBootstrap(sql, await ensure(sql, context.userId, data.timezone));
});
var updateSettings_createServerFn_handler = createServerRpc({
	id: "39eb7b92a3f86d39ac463c19e04b1b65c360a391e8297851d022809739c5a413",
	name: "updateSettings",
	filename: "src/lib/server/training.ts"
}, (opts) => updateSettings.__executeServer(opts));
var updateSettings = createServerFn({ method: "POST" }).validator((data) => data ?? {}).middleware([authMiddleware]).handler(updateSettings_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await ensure(sql, context.userId, data.timezone ?? "UTC");
	const theme = data.theme === "ink" || data.theme === "paper" ? data.theme : profile.theme;
	await sql`
      update profiles
      set timezone = ${data.timezone ? safeTimeZone(data.timezone) : profile.timezone}, theme = ${theme}, sound_on = ${typeof data.soundOn === "boolean" ? data.soundOn : Boolean(profile.sound_on)}, season_seen = ${data.seenSeason ? num(profile.season_number) : num(profile.season_seen)}
      where user_id = ${context.userId}
    `;
	return buildBootstrap(sql, await loadProfile(sql, context.userId) ?? profile);
});
var declineDiagnostic_createServerFn_handler = createServerRpc({
	id: "8cb4c14539c2a0d5075b0f9cff1e3e3ad7fb88bd9060c87f906d2c607d8b7cc8",
	name: "declineDiagnostic",
	filename: "src/lib/server/training.ts"
}, (opts) => declineDiagnostic.__executeServer(opts));
var declineDiagnostic = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(declineDiagnostic_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await sql`
      update profiles set diagnostic_done = true, level = 1
      where user_id = ${context.userId}
    `;
	const profile = await loadProfile(sql, context.userId);
	if (!profile) throw new Error("Sin perfil.");
	return buildBootstrap(sql, profile);
});
var startSession_createServerFn_handler = createServerRpc({
	id: "217e43f96295bab60290aa1c99496945d23a9c88c4038ba08b0bc12b37817d8a",
	name: "startSession",
	filename: "src/lib/server/training.ts"
}, (opts) => startSession.__executeServer(opts));
var startSession = createServerFn({ method: "POST" }).validator((data) => parseStart(data)).middleware([authMiddleware]).handler(startSession_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await ensure(sql, context.userId, "UTC");
	if ((data.mode === "daily" || data.mode === "free") && !profile.diagnostic_done) throw new Error("Primero completa el diagnóstico o elige empezar desde el nivel 1.");
	await closeDangling(sql, profile, data.mode);
	if (data.mode === "daily" || data.mode === "diagnostic") {
		const existing = await sql`
        select * from sessions
        where user_id = ${context.userId} and mode = ${data.mode} and status = 'active'
        order by started_at desc limit 1
      `;
		if (existing[0]) return viewOf(await hydrate(sql, profile, existing[0]), await dbNow(sql));
	}
	const today = localDateISO(profile.timezone);
	const id = crypto.randomUUID();
	const duration = data.mode === "daily" ? DAILY_MS : null;
	await sql`
      insert into sessions (
        id, user_id, mode, local_date, status, duration_ms, config, season_number
      ) values (
        ${id},
        ${context.userId},
        ${data.mode},
        ${today},
        'active',
        ${duration},
        ${JSON.stringify(data)}::jsonb,
        ${num(profile.season_number) || 1}
      )
    `;
	const created = await loadSession(sql, context.userId, id);
	if (!created) throw new Error("No pude abrir la sesión.");
	return viewOf(await hydrate(sql, profile, created), await dbNow(sql));
});
var getSession_createServerFn_handler = createServerRpc({
	id: "144206c01acafbaac51ead2f4bb338d990e8d651e7e099399fc7bfc4d08e5eb7",
	name: "getSession",
	filename: "src/lib/server/training.ts"
}, (opts) => getSession.__executeServer(opts));
var getSession = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.id || typeof data.id !== "string") throw new Error("Sesión inválida.");
	return { id: data.id };
}).middleware([authMiddleware]).handler(getSession_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await ensure(sql, context.userId, "UTC");
	const row = await loadSession(sql, context.userId, data.id);
	if (!row) throw new Error("Sesión no encontrada.");
	return viewOf(await hydrate(sql, profile, row), await dbNow(sql));
});
var finishSession_createServerFn_handler = createServerRpc({
	id: "a805b89625d79bd973d620e34e734fa7a2b2ff30a208f3284f9d37f9cf9bd4d4",
	name: "finishSession",
	filename: "src/lib/server/training.ts"
}, (opts) => finishSession.__executeServer(opts));
var finishSession = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.id) throw new Error("Sesión inválida.");
	return { id: data.id };
}).middleware([authMiddleware]).handler(finishSession_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await ensure(sql, context.userId, "UTC");
	const row = await loadSession(sql, context.userId, data.id);
	if (!row) throw new Error("Sesión no encontrada.");
	const now = await dbNow(sql);
	const reason = isExpired(row, now) ? "time" : "user";
	return viewOf(row.status === "active" ? await finalize(sql, profile, row, reason) : row, now);
});
async function grade(sql, profile, row, token, raw, skip) {
	const replay = await sql`
    select correct, expected_text, response_ms, skipped
    from attempts
    where user_id = ${profile.user_id} and client_token = ${token}
    limit 1
  `;
	if (replay[0]) {
		const ready = await hydrate(sql, profile, row);
		return {
			duplicate: true,
			correct: replay[0].skipped ? null : Boolean(replay[0].correct),
			solutionText: replay[0].skipped ? null : replay[0].expected_text,
			explain: null,
			responseMs: num(replay[0].response_ms),
			session: viewOf(ready, await dbNow(sql))
		};
	}
	const now = await dbNow(sql);
	if (row.status !== "active") return {
		duplicate: false,
		correct: null,
		solutionText: null,
		explain: null,
		responseMs: null,
		session: viewOf(row, now)
	};
	if (isExpired(row, now) && row.duration_ms != null) {
		if (now.getTime() - asDate(row.started_at).getTime() > row.duration_ms + 5e3) return {
			duplicate: false,
			correct: null,
			solutionText: null,
			explain: "El tiempo terminó antes de esta respuesta.",
			responseMs: null,
			session: viewOf(await finalize(sql, profile, row, "time"), now)
		};
	}
	const exercise = exerciseOf(row.current_payload);
	if (!exercise || !row.current_signature) throw new Error("No hay un ejercicio activo.");
	const presented = row.current_presented_at ? asDate(row.current_presented_at).getTime() : now.getTime();
	const responseMs = Math.max(0, Math.min(DAILY_MS, now.getTime() - presented));
	const ok = skip ? false : checkAnswer(exercise, raw ?? "");
	const free = row.mode === "free";
	const clock = row.mode === "clock";
	const lab = row.mode === "lab";
	const inserted = num((await sql`
    with gate as (
      update sessions
      set attempted = attempted + ${skip ? 0 : 1},
          correct = correct + ${!skip && ok ? 1 : 0},
          incorrect = incorrect + ${!skip && !ok ? 1 : 0},
          abandoned = abandoned + ${skip ? 1 : 0},
          sum_response_ms = sum_response_ms + ${skip ? 0 : responseMs},
          sum_correct_ms = sum_correct_ms + ${!skip && ok ? responseMs : 0},
          current_signature = null,
          current_payload = null,
          current_presented_at = null
      where id = ${row.id}
        and user_id = ${profile.user_id}
        and status = 'active'
        and current_signature = ${exercise.signature}
      returning id
    ),
    ins as (
      insert into attempts (
        user_id, session_id, client_token, signature, kind, level, mode, family,
        correct, skipped, given, expected_text, response_ms
      )
      select
        ${profile.user_id}, ${row.id}, ${token}, ${exercise.signature}, ${exercise.kind},
        ${exercise.level}, ${row.mode}, ${exercise.family}, ${ok}, ${skip},
        ${(raw ?? "").slice(0, 80)}, ${exercise.solutionText}, ${responseMs}
      from gate
      on conflict (user_id, client_token) do nothing
      returning id
    ),
    day as (
      insert into day_stats (
        user_id, local_date, attempted, correct, practice_ms, free_practiced, clock_practiced, lab_practiced
      )
      select
        ${profile.user_id}, ${row.local_date}, ${skip ? 0 : 1}, ${!skip && ok ? 1 : 0},
        ${skip ? 0 : responseMs}, ${free}, ${clock}, ${lab}
      from ins
      where ${skip} = false
      on conflict (user_id, local_date) do update set
        attempted = day_stats.attempted + ${skip ? 0 : 1},
        correct = day_stats.correct + ${!skip && ok ? 1 : 0},
        practice_ms = day_stats.practice_ms + ${skip ? 0 : responseMs},
        free_practiced = day_stats.free_practiced or ${free},
        clock_practiced = day_stats.clock_practiced or ${clock},
        lab_practiced = day_stats.lab_practiced or ${lab}
      returning user_id
    )
    select
      (select count(*)::int from gate) as gated,
      (select count(*)::int from ins) as inserted,
      (select count(*)::int from day) as booked
  `)[0]?.inserted);
	if (inserted && row.mode !== "diagnostic") await touchAdaptive(sql, profile, exercise.kind, exercise.level, ok, responseMs);
	if (inserted && row.mode === "lab" && !configOf(row).quiz && configOf(row).lessonId && !skip) {
		const lessonId = configOf(row).lessonId;
		const add = ok ? 1 : 0;
		await sql`
      insert into lab_progress (user_id, lesson_id, practice_correct, practice_attempted, mastered)
      values (${profile.user_id}, ${lessonId}, ${add}, 1, false)
      on conflict (user_id, lesson_id) do update set
        practice_attempted = lab_progress.practice_attempted + 1,
        practice_correct = lab_progress.practice_correct + ${add},
        mastered = (
          lab_progress.practice_attempted + 1 >= 3
          and coalesce(lab_progress.quiz_score, 0) >= 2
          and coalesce(lab_progress.quiz_total, 0) >= 3
        ),
        updated_at = now()
    `;
	}
	let fresh = await loadSession(sql, profile.user_id, row.id) ?? row;
	const after = await dbNow(sql);
	const expired = fresh.status === "active" && isExpired(fresh, after);
	const reached = fresh.status === "active" && configOf(fresh).count != null && num(fresh.attempted) >= (configOf(fresh).count ?? 0);
	if (fresh.status === "active" && (expired || reached)) fresh = await finalize(sql, profile, fresh, expired ? "time" : "complete");
	else if (fresh.status === "active") fresh = await hydrate(sql, profile, fresh);
	const showExplain = inserted && !skip && !ok && row.mode !== "daily" && row.mode !== "diagnostic";
	const saved = inserted > 0;
	return {
		duplicate: false,
		correct: !saved || skip ? null : ok,
		solutionText: !saved || skip ? null : exercise.solutionText,
		explain: showExplain ? exercise.explain : null,
		responseMs: saved ? responseMs : null,
		session: viewOf(fresh, await dbNow(sql))
	};
}
var submitAnswer_createServerFn_handler = createServerRpc({
	id: "f6712816f442ba1f5ebd2ba1a09ce5dedf161a9693df1439594a613392dab510",
	name: "submitAnswer",
	filename: "src/lib/server/training.ts"
}, (opts) => submitAnswer.__executeServer(opts));
var submitAnswer = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.sessionId || !data.token || data.token.length < 8 || data.token.length > 80) throw new Error("Envío inválido.");
	return {
		sessionId: data.sessionId,
		token: data.token,
		answer: String(data.answer ?? "").slice(0, 80)
	};
}).middleware([authMiddleware]).handler(submitAnswer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await ensure(sql, context.userId, "UTC");
	const row = await loadSession(sql, context.userId, data.sessionId);
	if (!row) throw new Error("Sesión no encontrada.");
	return grade(sql, profile, row, data.token, data.answer, false);
});
var skipExercise_createServerFn_handler = createServerRpc({
	id: "d16716bdc6196fd9f5707f219b4992a902014c934e929e66819cb7a081246e9f",
	name: "skipExercise",
	filename: "src/lib/server/training.ts"
}, (opts) => skipExercise.__executeServer(opts));
var skipExercise = createServerFn({ method: "POST" }).validator((data) => {
	if (!data?.sessionId || !data?.token || data.token.length < 8) throw new Error("Envío inválido.");
	return data;
}).middleware([authMiddleware]).handler(skipExercise_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await ensure(sql, context.userId, "UTC");
	const row = await loadSession(sql, context.userId, data.sessionId);
	if (!row) throw new Error("Sesión no encontrada.");
	return grade(sql, profile, row, data.token, null, true);
});
var getReview_createServerFn_handler = createServerRpc({
	id: "3ecbdba8b96bde998d45bb8b4aa0901159b1ff17bf96e082684dbac6b4218e4b",
	name: "getReview",
	filename: "src/lib/server/training.ts"
}, (opts) => getReview.__executeServer(opts));
var getReview = createServerFn({ method: "POST" }).validator((data) => ({ id: String(data?.id ?? "") })).middleware([authMiddleware]).handler(getReview_createServerFn_handler, async ({ context, data }) => {
	return (await (await getSql())`
      select a.signature, a.kind, a.level, a.correct, a.given, a.expected_text, a.response_ms, s.payload
      from attempts a
      left join seen_exercises s on s.user_id = a.user_id and s.signature = a.signature
      where a.user_id = ${context.userId} and a.session_id = ${data.id} and a.skipped = false and a.correct = false
      order by a.id
    `).map((row) => {
		const ex = exerciseOf(row.payload);
		return {
			kind: row.kind,
			label: KIND_LABEL[row.kind] ?? row.kind,
			level: num(row.level),
			prompt: ex?.prompt ?? row.signature,
			given: row.given,
			expected: row.expected_text,
			explain: ex?.explain ?? "",
			responseMs: num(row.response_ms)
		};
	});
});
var getProgress_createServerFn_handler = createServerRpc({
	id: "8923fa6afd151d214875fd4dc019dcaee85504ceeb3ed1a539c4de4161cbe5e8",
	name: "getProgress",
	filename: "src/lib/server/training.ts"
}, (opts) => getProgress.__executeServer(opts));
var getProgress = createServerFn({ method: "POST" }).validator((data) => data ?? {}).middleware([authMiddleware]).handler(getProgress_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const boot = await buildBootstrap(sql, await ensure(sql, context.userId, "UTC"));
	const year = data.year && data.year > 2e3 ? Math.floor(data.year) : Number(boot.today.slice(0, 4));
	const month = data.month && data.month >= 1 && data.month <= 12 ? Math.floor(data.month) : Number(boot.today.slice(5, 7));
	const start = `${year}-${String(month).padStart(2, "0")}-01`;
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
	const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
	const calendar = await sql`
      select * from day_stats
      where user_id = ${context.userId} and local_date >= ${start} and local_date <= ${end}
      order by local_date
    `;
	const series = await sql`
      select local_date, attempted, correct, practice_ms
      from day_stats
      where user_id = ${context.userId}
      order by local_date desc
      limit 42
    `;
	const byKind = await sql`
      select kind, family,
        count(*) filter (where not skipped)::int as attempted,
        count(*) filter (where correct and not skipped)::int as correct,
        coalesce(avg(response_ms) filter (where not skipped), 0)::float8 as avg_ms
      from attempts
      where user_id = ${context.userId}
      group by kind, family
    `;
	const byLevel = await sql`
      select level,
        count(*) filter (where not skipped)::int as attempted,
        count(*) filter (where correct and not skipped)::int as correct
      from attempts
      where user_id = ${context.userId}
      group by level
      order by level
    `;
	const totals = await sql`
      select
        coalesce(sum(attempted), 0)::int as attempted,
        coalesce(sum(correct), 0)::int as correct,
        coalesce(sum(practice_ms), 0)::float8 as practice_ms,
        count(*) filter (where attempted > 0 or daily_completed or free_practiced or clock_practiced or lab_practiced)::int as days
      from day_stats
      where user_id = ${context.userId}
    `;
	const seasonRows = await sql`
      select s.season_number,
        count(*) filter (where not a.skipped)::int as attempted,
        count(*) filter (where a.correct and not a.skipped)::int as correct
      from attempts a
      join sessions s on s.id = a.session_id and s.user_id = a.user_id
      where a.user_id = ${context.userId}
      group by s.season_number
      order by s.season_number
    `;
	const records = await sql`
      select record_key, value, achieved_at, meta from records
      where user_id = ${context.userId}
      order by record_key
    `;
	const history = await sql`
      select id, mode, local_date, status, attempted, correct, incorrect, duration_ms,
             counts_for_streak, started_at, result
      from sessions
      where user_id = ${context.userId}
      order by started_at desc
      limit 24
    `;
	const diagnostics = await sql`
      select is_baseline, taken_at, report from diagnostics
      where user_id = ${context.userId}
      order by taken_at
    `;
	const weak = findWeaknesses(byKind.map((row) => ({
		kind: row.kind,
		family: row.family,
		attempted: num(row.attempted),
		correct: num(row.correct),
		avgMs: num(row.avg_ms)
	})));
	return {
		boot,
		calendar: calendar.map((d) => ({
			date: d.local_date,
			dailyCompleted: Boolean(d.daily_completed),
			freePracticed: Boolean(d.free_practiced),
			clockPracticed: Boolean(d.clock_practiced),
			labPracticed: Boolean(d.lab_practiced),
			attempted: num(d.attempted),
			correct: num(d.correct),
			practiceMs: num(d.practice_ms),
			bestDailyCorrect: num(d.best_daily_correct)
		})),
		year,
		month,
		series: series.map((d) => ({
			date: d.local_date.slice(5),
			full: d.local_date,
			attempted: num(d.attempted),
			correct: num(d.correct),
			accuracy: num(d.attempted) ? Math.round(num(d.correct) / num(d.attempted) * 100) : 0,
			practiceMin: Math.round(num(d.practice_ms) / 6e4)
		})).reverse(),
		byKind: byKind.map((row) => ({
			kind: row.kind,
			label: KIND_LABEL[row.kind] ?? row.kind,
			family: row.family,
			attempted: num(row.attempted),
			correct: num(row.correct),
			avgMs: Math.round(num(row.avg_ms))
		})),
		byLevel: byLevel.map((row) => ({
			level: num(row.level),
			attempted: num(row.attempted),
			correct: num(row.correct)
		})),
		totals: {
			attempted: num(totals[0]?.attempted),
			correct: num(totals[0]?.correct),
			practiceMs: num(totals[0]?.practice_ms),
			days: num(totals[0]?.days)
		},
		seasons: seasonRows.map((row) => ({
			number: num(row.season_number),
			name: seasonInfo(num(row.season_number)).name,
			attempted: num(row.attempted),
			correct: num(row.correct),
			current: num(row.season_number) === boot.season.number
		})),
		records: records.map((row) => ({
			key: row.record_key,
			label: recordLabel(row.record_key),
			value: num(row.value),
			at: asDate(row.achieved_at).toISOString(),
			meta: toJson(row.meta)
		})),
		history: history.map((row) => ({
			id: row.id,
			mode: row.mode,
			date: row.local_date,
			status: row.status,
			attempted: num(row.attempted),
			correct: num(row.correct),
			incorrect: num(row.incorrect),
			full: Boolean(row.counts_for_streak),
			startedAt: asDate(row.started_at).toISOString()
		})),
		diagnostics: diagnostics.map((row) => ({
			baseline: Boolean(row.is_baseline),
			at: asDate(row.taken_at).toISOString(),
			report: toJson(row.report)
		})),
		weaknesses: weak,
		lessons: LESSONS.map((lesson) => lesson.id)
	};
});
var getLab_createServerFn_handler = createServerRpc({
	id: "cae066dbe26e416afa3ebd5b292dfe683907c9bd36cd4a3f4aaab49044527a48",
	name: "getLab",
	filename: "src/lib/server/training.ts"
}, (opts) => getLab.__executeServer(opts));
var getLab = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getLab_createServerFn_handler, async ({ context }) => {
	const rows = await (await getSql())`
      select lesson_id, practice_correct, practice_attempted, quiz_score, quiz_total, mastered
      from lab_progress where user_id = ${context.userId}
    `;
	const map = new Map(rows.map((row) => [row.lesson_id, row]));
	return LESSONS.map((lesson) => {
		const row = map.get(lesson.id);
		return {
			id: lesson.id,
			practiceCorrect: num(row?.practice_correct),
			practiceAttempted: num(row?.practice_attempted),
			quizScore: row?.quiz_score == null ? null : num(row.quiz_score),
			quizTotal: row?.quiz_total == null ? null : num(row.quiz_total),
			mastered: Boolean(row?.mastered)
		};
	});
});
var exportStats_createServerFn_handler = createServerRpc({
	id: "c894b3592f2291b5523a2408f853f29265faf4d7e4ebaadded7a8111d1d9919b",
	name: "exportStats",
	filename: "src/lib/server/training.ts"
}, (opts) => exportStats.__executeServer(opts));
var exportStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(exportStats_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const profile = await loadProfile(sql, context.userId);
	const [days, records, sessions, diagnostics, attempts, seen] = await Promise.all([
		sql`select * from day_stats where user_id = ${context.userId} order by local_date`,
		sql`select record_key, value, achieved_at, meta from records where user_id = ${context.userId}`,
		sql`select id, mode, local_date, status, attempted, correct, incorrect, abandoned, counts_for_streak, started_at, finished_at, season_number, result from sessions where user_id = ${context.userId} order by started_at`,
		sql`select is_baseline, taken_at, report from diagnostics where user_id = ${context.userId} order by taken_at`,
		sql`select answered_at, kind, level, mode, correct, skipped, response_ms, signature from attempts where user_id = ${context.userId} order by id desc limit 1000`,
		sql`select count(*)::int as n from seen_exercises where user_id = ${context.userId}`
	]);
	return {
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		profile: profile ? {
			timezone: profile.timezone,
			level: num(profile.level),
			season: num(profile.season_number),
			diagnosticDone: Boolean(profile.diagnostic_done),
			anchorDate: profile.anchor_date
		} : null,
		seenExercises: num(seen[0]?.n),
		days: toJson(days),
		records: toJson(records),
		sessions: toJson(sessions),
		diagnostics: toJson(diagnostics),
		recentAttempts: toJson(attempts)
	};
});
var deleteMyData_createServerFn_handler = createServerRpc({
	id: "12651c08f57ac87cf45b347e712c6ddf5592f581a614ed79cb6a9c0bf30dab04",
	name: "deleteMyData",
	filename: "src/lib/server/training.ts"
}, (opts) => deleteMyData.__executeServer(opts));
var deleteMyData = createServerFn({ method: "POST" }).validator((data) => {
	if (data?.confirm !== "BORRAR") throw new Error("Escribe BORRAR para confirmar.");
	return data;
}).middleware([authMiddleware]).handler(deleteMyData_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const id = context.userId;
	await sql`delete from attempts where user_id = ${id}`;
	await sql`delete from seen_exercises where user_id = ${id}`;
	await sql`delete from sessions where user_id = ${id}`;
	await sql`delete from records where user_id = ${id}`;
	await sql`delete from day_stats where user_id = ${id}`;
	await sql`delete from diagnostics where user_id = ${id}`;
	await sql`delete from season_archive where user_id = ${id}`;
	await sql`delete from lab_progress where user_id = ${id}`;
	await sql`delete from profiles where user_id = ${id}`;
	return { deleted: true };
});
//#endregion
export { declineDiagnostic_createServerFn_handler, deleteMyData_createServerFn_handler, exportStats_createServerFn_handler, finishSession_createServerFn_handler, getBootstrap_createServerFn_handler, getLab_createServerFn_handler, getProgress_createServerFn_handler, getReview_createServerFn_handler, getSession_createServerFn_handler, skipExercise_createServerFn_handler, startSession_createServerFn_handler, submitAnswer_createServerFn_handler, updateSettings_createServerFn_handler };
