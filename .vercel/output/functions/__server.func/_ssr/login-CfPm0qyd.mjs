import { o as __toESM } from "../_runtime.mjs";
import { S as useNavigate, Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-Cskhp2pC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CfPm0qyd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(event) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const result = mode === "up" ? await authClient.signUp.email({
				email,
				password,
				name: name || email,
				callbackURL: "/"
			}) : await authClient.signIn.email({
				email,
				password,
				callbackURL: "/"
			});
			if (result.error) {
				setError(result.error.message ?? "No se pudo entrar.");
				setBusy(false);
				return;
			}
			navigate({ to: "/" });
			window.location.assign("/");
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo entrar.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto grid min-h-screen max-w-md place-items-center px-5 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-muted",
					children: "Cálculo mental"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-4xl font-semibold tracking-tight",
					children: "Cifra"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted",
					children: "La misma cuenta guarda récords, rachas y el historial de ejercicios en cualquier dispositivo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 space-y-2",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-h-11 w-full rounded-xl border border-line bg-card px-4 py-3 text-left font-medium",
							onClick: () => void signIn(provider.providerId, { callbackURL: "/" }),
							children: ["Continuar con ", provider.label]
						}, provider.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "my-6 text-center text-sm text-muted",
						children: "o con correo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit,
						className: "space-y-3",
						children: [
							mode === "up" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm",
								children: ["Nombre", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: name,
									onChange: (event) => setName(event.target.value),
									className: "mt-1 w-full rounded-xl border border-line bg-card px-3 py-3",
									autoComplete: "name"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm",
								children: ["Correo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "email",
									required: true,
									value: email,
									onChange: (event) => setEmail(event.target.value),
									className: "mt-1 w-full rounded-xl border border-line bg-card px-3 py-3",
									autoComplete: "email"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm",
								children: ["Contraseña", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "password",
									required: true,
									minLength: 8,
									value: password,
									onChange: (event) => setPassword(event.target.value),
									className: "mt-1 w-full rounded-xl border border-line bg-card px-3 py-3",
									autoComplete: mode === "up" ? "new-password" : "current-password"
								})]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-wrong",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: busy,
								className: "min-h-11 w-full rounded-xl bg-accent px-4 py-3 font-medium text-paper disabled:opacity-60",
								children: busy ? "Entrando…" : mode === "up" ? "Crear cuenta" : "Entrar"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 text-sm text-muted underline-offset-4 hover:underline",
						onClick: () => setMode(mode === "up" ? "in" : "up"),
						children: mode === "up" ? "Ya tengo cuenta" : "Crear una cuenta con correo"
					})
				] })
			]
		})
	});
}
//#endregion
export { LoginPage as component };
