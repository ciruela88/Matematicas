import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as getProgress } from "./training-1zuZf7E1.mjs";
import { n as useBoot } from "./boot-0OAGXx07.mjs";
import { a as Line, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as LineChart, o as CartesianGrid, r as YAxis, s as Bar, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progreso-BxlWSlgq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatMs(ms) {
	if (!ms) return "—";
	return `${(ms / 1e3).toFixed(1).replace(".", ",")} s`;
}
function formatPractice(ms) {
	if (ms <= 0) return "0 min";
	if (ms < 6e4) return `${Math.max(1, Math.round(ms / 1e3))} s`;
	if (ms < 36e5) return `${Math.round(ms / 6e4)} min`;
	return `${Math.floor(ms / 36e5)} h ${Math.round(ms % 36e5 / 6e4)} min`;
}
function formatRecord(key, value) {
	if (key.includes("accuracy")) return `${value.toFixed(1).replace(".", ",")} %`;
	if (key.includes("avg_correct")) return formatMs(value);
	if (key === "best_streak") return `${Math.round(value)} días`;
	return String(Math.round(value));
}
function ProgressPage() {
	const { boot } = useBoot();
	const [year, setYear] = (0, import_react.useState)(Number(boot.today.slice(0, 4)));
	const [month, setMonth] = (0, import_react.useState)(Number(boot.today.slice(5, 7)));
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		getProgress({ data: {
			year,
			month
		} }).then((next) => {
			if (!cancelled) setData(next);
		}).catch((err) => {
			if (!cancelled) setError(err instanceof Error ? err.message : "No pude cargar el progreso.");
		});
		return () => {
			cancelled = true;
		};
	}, [year, month]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-wrong",
		children: error
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-64 animate-pulse rounded-2xl bg-paper-2",
		"aria-busy": "true"
	});
	const accuracy = data.totals.attempted ? Math.round(data.totals.correct / data.totals.attempted * 1e3) / 10 : 0;
	const bestSpeed = data.records.find((record) => record.key === "daily:avg_correct_ms");
	const baseline = data.diagnostics.find((item) => item.baseline);
	function shift(delta) {
		const date = new Date(Date.UTC(year, month - 1 + delta, 1));
		setYear(date.getUTCFullYear());
		setMonth(date.getUTCMonth() + 1);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Progreso"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted",
				children: [
					"Histórico y temporada ",
					data.boot.season.number,
					" van separados. Un día en blanco no borra récords."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Nivel",
						value: String(data.boot.level)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Precisión histórica",
						value: `${String(accuracy).replace(".", ",")} %`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Respondidos, histórico",
						value: String(data.totals.attempted)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Aciertos, histórico",
						value: String(data.totals.correct)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Tiempo de práctica",
						value: formatPractice(data.totals.practiceMs)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Días con actividad",
						value: String(data.totals.days)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Racha actual",
						value: String(data.boot.streak.current)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Mejor velocidad",
						value: bestSpeed ? formatMs(bestSpeed.value) : "Aún no"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "El bloque anterior no se reinicia con la temporada. Abajo va solo la temporada en curso."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeasonNow, { seasons: data.seasons }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Calendario"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-lg border border-line px-3",
								onClick: () => shift(-1),
								"aria-label": "Mes anterior",
								children: "←"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "self-center text-sm",
								children: [
									monthName(month),
									" ",
									year
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-lg border border-line px-3",
								onClick: () => shift(1),
								"aria-label": "Mes siguiente",
								children: "→"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
					year,
					month,
					today: boot.today,
					days: data.calendar
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "D: reto completo. P: práctica sin reto. El número es el mejor resultado del reto ese día."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Evolución reciente"
				}),
				data.series.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Todavía no hay días con respuestas."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-56 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: data.series,
							margin: {
								left: 4,
								right: 16,
								top: 8,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-line)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									stroke: "var(--color-muted)",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--color-muted)",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "accuracy",
									name: "Precisión %",
									stroke: "var(--color-accent)",
									strokeWidth: 2,
									dot: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "correct",
									name: "Aciertos",
									stroke: "var(--color-ink)",
									strokeWidth: 2,
									dot: false
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "mt-4 w-full text-left text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
							className: "sr-only",
							children: "Aciertos y precisión por día"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 font-medium",
									children: "Día"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 font-medium",
									children: "Aciertos"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 font-medium",
									children: "Precisión"
								})
							]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.series.slice(-10).map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1",
									children: day.full
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
									day.correct,
									"/",
									day.attempted
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [day.accuracy, " %"] })
							]
						}, day.full)) })
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Por dificultad"
			}), data.byLevel.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Sin respuestas todavía."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2 sm:grid-cols-4",
				children: data.byLevel.map((row) => {
					const rowAccuracy = row.attempted ? Math.round(row.correct / row.attempted * 100) : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-line bg-card p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: ["Nivel ", row.level]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xl font-semibold",
								children: [rowAccuracy, " %"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									row.correct,
									"/",
									row.attempted
								]
							})
						]
					}, row.level);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Por operación"
				}),
				data.byKind.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Sin datos todavía."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-56",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: aggregate(data.byKind),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-line)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "var(--color-muted)",
									fontSize: 11,
									interval: 0,
									angle: -20,
									height: 50,
									textAnchor: "end"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--color-muted)",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "accuracy",
									name: "Precisión %",
									fill: "var(--color-accent)"
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 font-medium",
									children: "Operación"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 font-medium",
									children: "Familia"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 font-medium",
									children: "Aciertos"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 font-medium",
									children: "Tiempo medio"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.byKind.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1",
									children: row.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.family.replaceAll("_", " ") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
									row.correct,
									"/",
									row.attempted
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatMs(row.avgMs) })
							]
						}, `${row.kind}-${row.family}`)) })]
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Puntos débiles"
			}), data.weaknesses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Hacen falta al menos cinco respuestas de un tipo para señalar un punto débil."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-3",
				children: data.weaknesses.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: item.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Precisión ",
								Math.round(item.accuracy * 100),
								" % · ",
								formatMs(item.avgMs),
								" · ",
								item.attempted,
								" respuestas"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: item.suggestion
						})
					]
				}, item.key))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Récords históricos"
				}), data.records.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Completa un reto de 10 minutos para abrir los récords de sesión."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: data.records.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between gap-3 border-b border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: record.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: formatRecord(record.key, record.value)
						})]
					}, record.key))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Temporadas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2",
					children: [data.seasons.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted",
						children: "La temporada actual aún no tiene respuestas."
					}), data.seasons.map((season) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-line px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								season.number,
								". ",
								season.name,
								season.current ? " · actual" : ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted",
							children: [
								season.correct,
								" aciertos de ",
								season.attempted
							]
						})]
					}, season.number))]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Diagnóstico y ahora"
			}), baseline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BaselineNow, {
				report: baseline.report,
				currentLevel: data.boot.level,
				accuracy
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "No hay diagnóstico original guardado."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Historial de sesiones"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2",
				children: [data.history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-muted",
					children: "Sin sesiones."
				}), data.history.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						session.date,
						" · ",
						labelMode(session.mode),
						session.full ? " · completa" : ""
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						session.correct,
						"/",
						session.attempted
					] })]
				}, session.id))]
			})] })
		]
	});
}
function SeasonNow({ seasons }) {
	const season = seasons.find((item) => item.current) ?? seasons[seasons.length - 1];
	if (!season) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-line bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: "Temporada actual"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Todavía no hay respuestas en esta temporada."
		})]
	});
	const accuracy = season.attempted ? Math.round(season.correct / season.attempted * 1e3) / 10 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-line bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-semibold",
				children: [
					"Temporada ",
					season.number,
					". ",
					season.name,
					season.current ? "" : " · última con datos"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2",
				children: [
					season.correct === 1 ? "1 acierto" : `${season.correct} aciertos`,
					" de ",
					season.attempted,
					". Precisión ",
					String(accuracy).replace(".", ","),
					" %."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Estas cifras se reinician al pasar de temporada. Los récords de arriba no."
			})
		]
	});
}
function BaselineNow({ report, currentLevel, accuracy }) {
	const data = report && typeof report === "object" && !Array.isArray(report) ? report : null;
	const level = typeof data?.level === "number" ? data.level : null;
	const speed = typeof data?.speedLabel === "string" ? data.speedLabel : null;
	const weak = Array.isArray(data?.weak) ? data.weak.filter((item) => typeof item === "string") : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-2 text-sm",
		children: [
			"El diagnóstico original estimó el nivel ",
			level ?? "—",
			".",
			speed ? ` Velocidad inicial: ${speed}.` : "",
			" Hoy el nivel de práctica es ",
			currentLevel,
			" y la precisión histórica es ",
			String(accuracy).replace(".", ","),
			" %.",
			weak.length ? ` Entonces flojeaban: ${weak.join(", ")}.` : ""
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-2xl font-semibold",
			children: value
		})]
	});
}
function monthName(month) {
	return [
		"enero",
		"febrero",
		"marzo",
		"abril",
		"mayo",
		"junio",
		"julio",
		"agosto",
		"septiembre",
		"octubre",
		"noviembre",
		"diciembre"
	][month - 1] ?? "";
}
function labelMode(mode) {
	if (mode === "daily") return "reto";
	if (mode === "free") return "libre";
	if (mode === "clock") return "reloj";
	if (mode === "lab") return "laboratorio";
	if (mode === "diagnostic") return "diagnóstico";
	return mode;
}
function Calendar({ year, month, today, days }) {
	const map = new Map(days.map((day) => [day.date, day]));
	const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
	const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
	const cells = [...Array(offset).fill(null)];
	for (let day = 1; day <= count; day += 1) cells.push(day);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-7 gap-1 text-center text-xs text-muted",
		children: [
			"L",
			"M",
			"X",
			"J",
			"V",
			"S",
			"D"
		].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: label }, label))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 grid grid-cols-7 gap-1",
		children: cells.map((day, index) => {
			if (!day) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, `e-${index}`);
			const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			const info = map.get(iso);
			const practiced = Boolean(info && (info.freePracticed || info.clockPracticed || info.labPracticed || info.attempted > 0));
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `min-h-12 rounded-lg border p-1 text-left text-xs ${info?.dailyCompleted ? "border-accent bg-accent-2" : practiced ? "border-line bg-card" : "border-transparent"} ${iso === today ? "ring-1 ring-accent" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: day }),
					info?.dailyCompleted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block",
						children: ["D ", info.bestDailyCorrect || ""]
					}),
					!info?.dailyCompleted && practiced && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-muted",
						children: "P"
					})
				]
			}, iso);
		})
	})] });
}
function aggregate(rows) {
	const map = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const cur = map.get(row.kind) ?? {
			label: row.label,
			correct: 0,
			attempted: 0
		};
		cur.correct += row.correct;
		cur.attempted += row.attempted;
		map.set(row.kind, cur);
	}
	return [...map.values()].map((row) => ({
		label: row.label,
		accuracy: row.attempted ? Math.round(row.correct / row.attempted * 100) : 0
	}));
}
//#endregion
export { ProgressPage as component };
