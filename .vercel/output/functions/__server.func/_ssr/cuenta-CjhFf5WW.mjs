import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./client-1vAx-gM_.mjs";
import { n as deleteMyData, p as updateSettings, r as exportStats } from "./training-1zuZf7E1.mjs";
import { n as useBoot } from "./boot-0OAGXx07.mjs";
import { n as UserButton } from "./gates-C92060AB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cuenta-CjhFf5WW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ZONES = [
	"Europe/Madrid",
	"Atlantic/Canary",
	"America/Mexico_City",
	"America/Bogota",
	"America/Lima",
	"America/Santiago",
	"America/Argentina/Buenos_Aires",
	"America/Montevideo",
	"America/Caracas",
	"America/New_York",
	"America/Chicago",
	"America/Los_Angeles",
	"UTC"
];
function AccountPage() {
	const { boot, reload } = useBoot();
	const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const zones = browserZone && !ZONES.includes(browserZone) ? [browserZone, ...ZONES] : ZONES;
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-semibold",
					children: "Cuenta"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 text-sm text-muted underline-offset-4 hover:underline md:hidden",
					onClick: () => void signOut(),
					children: "Cerrar sesión"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					updateSettings({ data: {
						timezone: String(form.get("timezone") ?? boot.timezone),
						theme: String(form.get("theme") ?? boot.theme),
						soundOn: form.get("sound") === "on"
					} }).then(() => reload()).then(() => setMessage("Preferencias guardadas. No afectan a la medición de los récords.")).catch((err) => setError(err instanceof Error ? err.message : "No se pudo guardar."));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Zona horaria del reto", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							name: "timezone",
							defaultValue: boot.timezone,
							className: "mt-1 w-full rounded-xl border border-line bg-card px-3 py-3",
							children: zones.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: zone,
								children: zone
							}, zone))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "text-sm",
						children: "Apariencia"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "min-h-11 flex-1 rounded-xl border border-line px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "radio",
								name: "theme",
								value: "paper",
								defaultChecked: boot.theme === "paper",
								className: "mr-2"
							}), "Papel"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "min-h-11 flex-1 rounded-xl border border-line px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "radio",
								name: "theme",
								value: "ink",
								defaultChecked: boot.theme === "ink",
								className: "mr-2"
							}), "Tinta"]
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							name: "sound",
							value: "on",
							defaultChecked: boot.soundOn
						}), "Sonido breve al responder. Viene apagado."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "min-h-11 rounded-xl bg-accent px-4 py-3 text-paper",
						children: "Guardar"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Exportar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Descarga estadísticas, récords, días y los últimos intentos. No incluye la cuenta de acceso."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 min-h-11 rounded-xl border border-line px-4 py-3",
					onClick: () => {
						exportStats().then((data) => {
							const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
							const url = URL.createObjectURL(blob);
							const link = document.createElement("a");
							link.href = url;
							link.download = "cifra-estadisticas.json";
							link.click();
							URL.revokeObjectURL(url);
						}).catch((err) => setError(err instanceof Error ? err.message : "No se pudo exportar."));
					},
					children: "Descargar JSON"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-wrong p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Eliminar datos de entrenamiento"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: "Borra perfil, historial, récords, calendario y lecciones de esta cuenta. No se puede deshacer. La identidad de acceso puede seguir existiendo para volver a entrar."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-sm",
						children: ["Escribe BORRAR", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: confirm,
							onChange: (event) => setConfirm(event.target.value),
							className: "mt-1 w-full rounded-xl border border-line bg-card px-3 py-3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 min-h-11 rounded-xl bg-wrong px-4 py-3 text-paper",
						onClick: () => {
							setError(null);
							deleteMyData({ data: { confirm } }).then(() => reload()).then(() => {
								setConfirm("");
								setMessage("Datos de entrenamiento eliminados.");
							}).catch((err) => setError(err instanceof Error ? err.message : "No se pudo borrar."));
						},
						children: "Eliminar mis datos"
					})
				]
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: message
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-wrong",
				children: error
			})
		]
	});
}
//#endregion
export { AccountPage as component };
