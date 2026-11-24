import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as LEVEL_NAME, n as KIND_LABEL } from "./engine-BJ3P1mPN.mjs";
import { c as getReview, f as submitAnswer, i as finishSession, l as getSession, u as skipExercise } from "./training-1zuZf7E1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-BBvS2jZC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatClock(ms) {
	const total = Math.max(0, Math.ceil(ms / 1e3));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}
function countLabel(n, one, many) {
	return `${n} ${n === 1 ? one : many}`;
}
function formatSeconds(ms) {
	return `${(ms / 1e3).toFixed(1).replace(".", ",")} s`;
}
function beep(ok) {
	const Ctx = window.AudioContext || window.webkitAudioContext;
	if (!Ctx) return;
	const ctx = new Ctx();
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.frequency.value = ok ? 660 : 196;
	gain.gain.value = .03;
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start();
	osc.stop(ctx.currentTime + .07);
	window.setTimeout(() => void ctx.close(), 300);
}
function Player({ sessionId, sound, onLeave, onChange, onSession }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [grade, setGrade] = (0, import_react.useState)(null);
	const [review, setReview] = (0, import_react.useState)(null);
	const [confirmEnd, setConfirmEnd] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const inputRef = (0, import_react.useRef)(null);
	const offsetRef = (0, import_react.useRef)(0);
	const serverNowSeen = (0, import_react.useRef)("");
	function publish(next) {
		setSession(next);
		onSession?.(next);
		return next;
	}
	async function refresh() {
		const next = await getSession({ data: { id: sessionId } });
		publish(next);
		return next;
	}
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		refresh().catch((err) => {
			if (!cancelled) setError(err instanceof Error ? err.message : "No pude abrir la sesión.");
		});
		return () => {
			cancelled = true;
		};
	}, [sessionId]);
	(0, import_react.useEffect)(() => {
		if (!session || session.status !== "active") return;
		const id = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(id);
	}, [session?.status, session?.id]);
	const offset = (() => {
		if (!session) return 0;
		if (session.serverNow !== serverNowSeen.current) {
			serverNowSeen.current = session.serverNow;
			offsetRef.current = new Date(session.serverNow).getTime() - Date.now();
		}
		return offsetRef.current;
	})();
	const elapsedMs = session ? Math.max(0, now + offset - new Date(session.startedAt).getTime()) : 0;
	const remaining = session?.durationMs != null ? Math.max(0, session.durationMs - elapsedMs) : null;
	(0, import_react.useEffect)(() => {
		if (!session || session.status !== "active" || session.durationMs == null || remaining == null || remaining > 0) return;
		const id = window.setInterval(() => {
			refresh().then((next) => {
				if (next.status !== "active") onChange?.();
			}).catch((err) => setError(err instanceof Error ? err.message : "Error al cerrar el tiempo."));
		}, 1e3);
		return () => window.clearInterval(id);
	}, [
		session?.id,
		session?.status,
		remaining === 0
	]);
	(0, import_react.useEffect)(() => {
		if (session?.status === "active") inputRef.current?.focus();
	}, [session?.current?.signature, session?.status]);
	(0, import_react.useEffect)(() => {
		if (session?.status !== "completed") return;
		getReview({ data: { id: sessionId } }).then(setReview).catch(() => setReview([]));
		onChange?.();
	}, [session?.status, sessionId]);
	async function send(skip) {
		if (!session || session.status !== "active" || busy) return;
		if (!skip && !answer.trim()) return;
		setBusy(true);
		setError(null);
		setConfirmEnd(false);
		const token = crypto.randomUUID();
		const prompt = session.current?.prompt ?? "";
		try {
			const result = skip ? await skipExercise({ data: {
				sessionId,
				token
			} }) : await submitAnswer({ data: {
				sessionId,
				token,
				answer
			} });
			setSession(result.session);
			onSession?.(result.session);
			if (!result.duplicate && result.correct !== null) {
				setGrade({
					...result,
					prompt
				});
				if (sound) beep(result.correct);
			} else if (skip) setGrade(null);
			setAnswer("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo guardar la respuesta.");
		} finally {
			setBusy(false);
			inputRef.current?.focus();
		}
	}
	if (error && !session) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-card p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mt-4 rounded-xl bg-accent px-4 py-3 text-paper",
			onClick: () => void refresh(),
			children: "Reintentar"
		})]
	});
	if (!session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-48 animate-pulse rounded-2xl bg-paper-2",
		"aria-busy": "true"
	});
	if (session.status === "completed") {
		const result = session.result ?? {};
		const accuracy = session.attempted ? Math.round(session.correct / session.attempted * 1e3) / 10 : 0;
		const avgMs = session.attempted ? Math.round(session.sumResponseMs / session.attempted) : null;
		const elapsedDone = session.finishedAt ? new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime() : 0;
		const rate = session.mode === "daily" && elapsedDone > 0 ? session.correct / elapsedDone * 6e4 : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm uppercase tracking-widest text-muted",
						children: "Sesión cerrada"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-1 text-3xl font-semibold",
						children: [
							countLabel(session.correct, "acierto", "aciertos"),
							" de ",
							session.attempted
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-muted",
						children: [
							"Precisión ",
							String(accuracy).replace(".", ","),
							" %.",
							avgMs != null ? ` Media ${formatSeconds(avgMs)}.` : "",
							rate != null ? ` Ritmo ${rate.toFixed(1).replace(".", ",")} aciertos/min.` : "",
							session.incorrect > 0 ? ` ${countLabel(session.incorrect, "error", "errores")}.` : " Sin errores respondidos.",
							session.abandoned > 0 ? ` ${countLabel(session.abandoned, "pasada", "pasadas")}, fuera de la precisión.` : ""
						]
					}),
					session.mode === "daily" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: result.full || session.countsForStreak ? "Sesión completa de 10 minutos. Opta a récords." : "Sesión terminada antes de tiempo. Queda en el historial, pero no opta a récords de 10 minutos ni a la racha."
					}),
					session.mode === "diagnostic" && result.reason === "incomplete" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: "Saliste antes de las 12 respuestas. Este intento no crea ni sustituye el diagnóstico original."
					})
				] }),
				result.records && result.records.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2 sm:grid-cols-2",
					children: result.records.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-line bg-accent-2 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Nuevo récord"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: record.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-lg",
								children: formatRecord(record.key, record.value)
							})
						]
					}, record.key))
				}),
				review && review.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Errores para revisar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-3",
					children: review.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-line bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: item.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "expr mt-1 text-2xl",
								children: item.prompt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2",
								children: [
									"Escribiste ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: item.given || "—"
									}),
									". Correcto:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: item.expected
									}),
									"."
								]
							}),
							item.explain && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: item.explain
							})
						]
					}, `${item.prompt}-${item.given}`))
				})] }),
				review && review.length === 0 && session.incorrect === 0 && session.attempted > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No hay errores que revisar en esta sesión."
				}),
				onLeave && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-xl border border-line px-4 py-3",
					onClick: onLeave,
					children: "Volver"
				})
			]
		});
	}
	const current = session.current;
	const live = session.correct + session.incorrect;
	const accuracyNow = session.attempted ? Math.round(session.correct / session.attempted * 100) : null;
	const avgNow = session.attempted ? session.sumResponseMs / session.attempted : null;
	const rateNow = session.durationMs != null && elapsedMs >= 5e3 ? session.correct / elapsedMs * 6e4 : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				"aria-live": "polite",
				children: [
					countLabel(session.correct, "acierto", "aciertos"),
					" · ",
					countLabel(session.incorrect, "error", "errores"),
					session.abandoned > 0 ? ` · ${countLabel(session.abandoned, "pasada", "pasadas")}` : "",
					session.mode === "diagnostic" ? ` · ${session.attempted}/12` : "",
					session.config.count ? ` · ${session.attempted}/${session.config.count}` : "",
					accuracyNow != null ? ` · ${accuracyNow} %` : "",
					avgNow != null ? ` · ${formatSeconds(avgNow)}` : "",
					rateNow != null ? ` · ${rateNow.toFixed(1).replace(".", ",")} aciertos/min` : ""
				]
			}), remaining != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-3xl tabular-nums",
				"aria-label": `Tiempo restante ${formatClock(remaining)}`,
				children: formatClock(remaining)
			})]
		}),
		grade && !grade.duplicate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: `mb-4 rounded-xl px-4 py-3 ${grade.correct ? "bg-accent-2 text-ink" : "bg-wrong-bg text-wrong"}`,
			role: "status",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: grade.correct ? "Correcto" : "Incorrecto"
				}),
				grade.prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "expr ml-2 text-base",
					children: grade.prompt
				}) : null,
				grade.responseMs != null ? ` · ${formatSeconds(grade.responseMs)}` : "",
				!grade.correct && session.mode !== "daily" && session.mode !== "diagnostic" && grade.solutionText ? ` · la respuesta era ${grade.solutionText}` : "",
				!grade.correct && (session.mode === "daily" || session.mode === "diagnostic") ? " · la corrección queda para el final." : "",
				session.mode !== "daily" && session.mode !== "diagnostic" && grade.explain ? ` ${grade.explain}` : ""
			]
		}),
		current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => {
				event.preventDefault();
				send(false);
			},
			className: "rounded-2xl border border-line bg-card p-5 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						KIND_LABEL[current.kind] ?? current.kind,
						" · ",
						LEVEL_NAME[current.level] ?? `nivel ${current.level}`
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "expr mt-4 text-4xl sm:text-6xl",
					children: current.prompt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-8 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: current.answerLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-2 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							value: answer,
							onChange: (event) => setAnswer(event.target.value),
							inputMode: current.input === "int" ? "decimal" : "text",
							autoComplete: "off",
							autoCorrect: "off",
							autoCapitalize: "off",
							spellCheck: false,
							enterKeyHint: "done",
							"aria-label": "Respuesta",
							className: "w-full rounded-xl border border-line bg-paper px-4 py-4 font-mono text-2xl"
						}), current.input === "int" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 min-w-14 rounded-xl border border-line px-3 font-mono text-2xl",
							"aria-label": "Cambiar signo",
							onClick: () => setAnswer((currentValue) => {
								const trimmed = currentValue.trim();
								if (trimmed.startsWith("-") || trimmed.startsWith("−")) return trimmed.slice(1);
								return trimmed ? `-${trimmed}` : "-";
							}),
							children: "±"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || !answer.trim(),
							className: "min-h-11 rounded-xl bg-accent px-5 py-3 font-medium text-paper disabled:opacity-50",
							children: "Comprobar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							className: "min-h-11 rounded-xl border border-line px-4 py-3",
							onClick: () => void send(true),
							children: "Pasar"
						}),
						!confirmEnd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-xl px-4 py-3 text-muted",
							onClick: () => setConfirmEnd(true),
							children: "Terminar"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-xl border border-wrong px-4 py-3 text-wrong",
							onClick: () => void finishSession({ data: { id: sessionId } }).then((next) => publish(next)).then(() => onChange?.()),
							children: session.mode === "daily" ? "Sí, cerrar sin récord" : session.mode === "diagnostic" ? "Sí, salir sin guardar el diagnóstico" : "Sí, terminar"
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-wrong",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-muted",
					children: live === 0 ? "Escribe la respuesta y pulsa Enter." : "La precisión usa solo ejercicios respondidos, no los pasados."
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Preparando el siguiente ejercicio…" })
	] });
}
function formatRecord(key, value) {
	if (key.includes("accuracy")) return `${value.toFixed(1).replace(".", ",")} %`;
	if (key.includes("avg_correct")) return formatSeconds(value);
	if (key === "best_streak") return `${Math.round(value)} días`;
	return String(Math.round(value));
}
//#endregion
export { Player as t };
