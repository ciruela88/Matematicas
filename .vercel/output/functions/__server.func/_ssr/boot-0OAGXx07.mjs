import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as authClient } from "./client-1vAx-gM_.mjs";
import { a as getBootstrap } from "./training-1zuZf7E1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/boot-0OAGXx07.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var BootContext = (0, import_react.createContext)(null);
function useBoot() {
	const ctx = (0, import_react.useContext)(BootContext);
	if (!ctx) throw new Error("useBoot fuera del perfil");
	return ctx;
}
function BootProvider({ children }) {
	const user = useCurrentUser();
	const [boot, setBoot] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		const next = await getBootstrap({ data: { timezone } });
		setBoot(next);
		setError(null);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		let cancelled = false;
		load().catch((err) => {
			if (cancelled) return;
			setError(err instanceof Error ? err.message : "No pude cargar tu perfil.");
		});
		return () => {
			cancelled = true;
		};
	}, [user?.id, load]);
	(0, import_react.useEffect)(() => {
		if (!boot) return;
		document.documentElement.dataset.theme = boot.theme;
	}, [boot]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-md px-5 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold",
				children: "No hay conexión con tus datos"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-6 rounded-xl bg-accent px-4 py-3 font-medium text-paper",
				onClick: () => void load().catch((err) => setError(err instanceof Error ? err.message : "Error")),
				children: "Reintentar"
			})
		]
	});
	if (!boot) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-5 py-10",
		"aria-busy": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm uppercase tracking-widest text-muted",
				children: "Cifra"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-10 w-48 animate-pulse rounded-lg bg-paper-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-28 animate-pulse rounded-2xl bg-paper-2" })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootContext.Provider, {
		value: {
			boot,
			reload: load
		},
		children
	});
}
//#endregion
export { useCurrentUserState as i, useBoot as n, useCurrentUser as r, BootProvider as t };
