window.__ModuleLoader__.load({
	id: "dsh-theme-paper-warm",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");

		//#region lib/client/theme.js
		/**
		 * Registered theme id. Registered themes are process-local extensions: the
		 * built-in `ui-theme` settings schema only accepts `light`, `dark` and
		 * `system`, so this id can never be persisted as the durable Appearance
		 * preference. This package therefore keeps its own selection in
		 * localStorage and drives `ctx.theme.setTheme()` from its own row.
		 */
		const THEME_ID = "paper-warm";
		/** Storage key holding this plugin's own selection. */
		const STORAGE_KEY = "dsh.theme.paper-warm";
		/** Preference restored when the user leaves the paper theme. */
		const FALLBACK_KEY = "dsh.theme.paper-warm.previous";
		/** Built-in preferences this plugin may restore. */
		const BUILTIN_PREFERENCES = ["light", "dark", "system"];
		/**
		 * How long after a press on an appearance toggle a built-in preference still
		 * counts as the user's choice rather than a Host settings push. A press
		 * reaches its handler within milliseconds, so this only has to absorb a
		 * stalled event loop.
		 */
		const PRESS_WINDOW_MS = 750;

		/**
		 * Font stack. Segoe UI first, so Windows renders it instead of the shell's
		 * leading `-apple-system`/`BlinkMacSystemFont`; the CJK faces and the
		 * remaining fallbacks are kept so Chinese text and every other script still
		 * resolve to a real face. Applied as a token override, so it reaches the
		 * whole shell through `var(--dsw-font-family)` plus body inheritance.
		 */
		const FONT_STACK =
			'"Segoe UI", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';

		/**
		 * Warm paper palette. `light` carries the two colors the user asked for:
		 * canvas #F2F0E5 and ink #100F0F. Every other entry is derived so raised
		 * surfaces, borders and the secondary text ladder stay legible on the warm
		 * canvas instead of re-using the cool neutral-bluish scale.
		 */
		const PALETTE = {
			light: {
				"--dsw-font-family": FONT_STACK,
				"--dsw-alias-bg-base": "#F2F0E5",
				"--dsw-specific-sidebar-fill": "#F2F0E5",
				/* The composer input reads this token (third-party sidebar maps it to
				   --dcu-composer-bg), so warm-white here replaces the white input card. */
				"--dsw-specific-input-major": "#FAF8F0",
				"--dsw-alias-bg-layer-1": "#FAF8F0",
				"--dsw-alias-bg-layer-2": "#FDFCF6",
				"--dsw-alias-bg-layer-3": "#FFFFFF",
				"--dsw-alias-bg-overlay": "#F7F5EC",
				"--dsw-alias-bg-module-platform": "#ECE9DC",
				"--dsw-alias-bg-multi-select": "#ECE9DC",
				"--dsw-alias-bg-document-preview": "#ECE9DC",
				"--dsw-alias-label-primary": "#100F0F",
				"--dsw-alias-label-secondary": "#55524A",
				"--dsw-alias-label-tertiary": "#7A756A",
				"--dsw-alias-label-caption": "#8E887C",
				"--dsw-alias-border-l1": "#100f0f14",
				"--dsw-alias-border-l2": "#100f0f1f",
				"--dsw-alias-border-l3": "#100f0f29",
				"--dsw-alias-border-l4": "#100f0f33",
				"--dsw-alias-interactive-bg-hover": "#100f0f0f",
				"--dsw-alias-interactive-bg-active": "#100f0f1a",
				"--dsw-alias-interactive-bg-hover-solid": "#E7E4D6",
				"--dsw-alias-button-floating-fill": "#FAF8F0",
				"--dsw-alias-button-floating-hover": "#F1EEE2",
				"--dsw-alias-button-elevated-fill": "#FAF8F0",
				"--dsw-alias-button-ghost-active-fill": "#ECE9DC",
				"--dsw-alias-button-ghost-active-hover": "#E7E4D6",
				"--dsw-alias-menu-icon": "#3A3833",
				"--dsw-alias-markdown-code-block": "#EAE7DA",
				"--dsw-alias-markdown-code-block-banner": "#EAE7DA",
				"--dsw-alias-scrollbar-bg-l1": "#DDD9C9",
				"--dsw-alias-scrollbar-bg-l2": "#DDD9C9",
				"--dsw-alias-bg-skeleton": "#100f0f0f"
			},
			dark: {
				"--dsw-font-family": FONT_STACK,
				"--dsw-alias-bg-base": "#100F0F",
				"--dsw-specific-sidebar-fill": "#100F0F",
				"--dsw-specific-input-major": "#222120",
				"--dsw-alias-bg-layer-1": "#1A1918",
				"--dsw-alias-bg-layer-2": "#222120",
				"--dsw-alias-bg-layer-3": "#2B2A28",
				"--dsw-alias-bg-overlay": "#2B2A28",
				"--dsw-alias-bg-module-platform": "#1E1D1C",
				"--dsw-alias-bg-multi-select": "#1E1D1C",
				"--dsw-alias-bg-document-preview": "#1E1D1C",
				"--dsw-alias-label-primary": "#F2F0E5",
				"--dsw-alias-label-secondary": "#C4BFB1",
				"--dsw-alias-label-tertiary": "#9C978A",
				"--dsw-alias-label-caption": "#837E72",
				"--dsw-alias-border-l1": "#f2f0e51a",
				"--dsw-alias-border-l2": "#f2f0e524",
				"--dsw-alias-border-l3": "#f2f0e52e",
				"--dsw-alias-border-l4": "#f2f0e538",
				"--dsw-alias-interactive-bg-hover": "#f2f0e514",
				"--dsw-alias-interactive-bg-active": "#f2f0e521",
				"--dsw-alias-interactive-bg-hover-solid": "#2B2A28",
				"--dsw-alias-button-floating-fill": "#222120",
				"--dsw-alias-button-floating-hover": "#2B2A28",
				"--dsw-alias-button-elevated-fill": "#222120",
				"--dsw-alias-button-ghost-active-fill": "#2B2A28",
				"--dsw-alias-button-ghost-active-hover": "#343230",
				"--dsw-alias-menu-icon": "#D8D3C4",
				"--dsw-alias-markdown-code-block": "#1A1918",
				"--dsw-alias-markdown-code-block-banner": "#1A1918",
				"--dsw-alias-scrollbar-bg-l1": "#3A3835",
				"--dsw-alias-scrollbar-bg-l2": "#3A3835",
				"--dsw-alias-bg-skeleton": "#f2f0e50f"
			}
		};

		/**
		 * The same palette in the shape `theme.overrideTokens()` requires: one
		 * `{ light, dark }` pair per token name (a bare string throws at runtime, so
		 * the palette above is transposed here at module scope).
		 */
		const PALETTE_OVERRIDE = Object.fromEntries(
			Object.keys(PALETTE.light).map((name) => [name, { light: PALETTE.light[name], dark: PALETTE.dark[name] }])
		);

		/**
		 * Read the stored selection without throwing when storage is unavailable.
		 * @returns whether the paper theme was selected.
		 */
		function storedActive() {
			try {
				return globalThis.localStorage?.getItem(STORAGE_KEY) === "1";
			} catch {
				return false;
			}
		}

		/** Persist the selection; storage failures only cost durability. */
		function storeActive(active) {
			try {
				globalThis.localStorage?.setItem(STORAGE_KEY, active ? "1" : "0");
			} catch {
				/* ignored */
			}
		}

		/**
		 * Remember the built-in preference to restore when paper is switched off.
		 * @param preference - the preference in effect before the switch.
		 */
		function storeFallback(preference) {
			if (!BUILTIN_PREFERENCES.includes(preference)) return;
			try {
				globalThis.localStorage?.setItem(FALLBACK_KEY, preference);
			} catch {
				/* ignored */
			}
		}

		/** @returns the remembered built-in preference, defaulting to `system`. */
		function storedFallback() {
			try {
				const value = globalThis.localStorage?.getItem(FALLBACK_KEY);
				return BUILTIN_PREFERENCES.includes(value) ? value : "system";
			} catch {
				return "system";
			}
		}
		//#endregion

		//#region lib/client/PaperRow.js
		/** Row copy; the locale registration below overrides these through `t`. */
		const FALLBACK_COPY = {
			title: "暖纸主题",
			description: "背景 #F2F0E5、前景 #100F0F 的暖色纸张配色",
			on: "暖纸",
			off: "原生"
		};

		/**
		 * Appearance-section row for the paper theme. Reads its state from the theme
		 * service snapshot (reacting to `theme/change`) and writes through the
		 * plugin's own selection helpers, so it never depends on the built-in
		 * `preference` field accepting a third-party id.
		 * @param props - composed slot props (`t` from the locale share, plus `read`,
		 * `write` and `useTheme` from this package's inject share).
		 * @returns the row element tree.
		 */
		function PaperRow({ t, read, write, useTheme }) {
			const theme = useTheme();
			const active = theme.preference === THEME_ID;
			const translate = (key) => (typeof t === "function" ? t(key) : FALLBACK_COPY[key]) ?? FALLBACK_COPY[key];

			const option = (id, label) =>
				react.createElement(
					"button",
					{
						type: "button",
						key: id,
						onClick: () => write(id === THEME_ID),
						"aria-pressed": id === THEME_ID ? active : !active,
						style: {
							font: "inherit",
							lineHeight: "22px",
							padding: "0 14px",
							height: 32,
							border: "1px solid #100f0f1f",
							borderRadius: 8,
							cursor: "pointer",
							background: (id === THEME_ID) === active ? "#100f0f" : "#f2f0e5",
							color: (id === THEME_ID) === active ? "#f2f0e5" : "#100f0f",
							transition: "background 120ms ease, color 120ms ease"
						}
					},
					label
				);

			return react_jsx_runtime.jsxs("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 16,
					borderBottom: "0.5px solid var(--dsw-alias-border-l2, #100f0f1f)",
					padding: "16px 0"
				},
				children: [
					react_jsx_runtime.jsxs("div", {
						style: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0, paddingRight: 48 },
						children: [
							react_jsx_runtime.jsx("div", {
								style: { color: "var(--dsw-alias-label-primary, #100f0f)", fontSize: 14, lineHeight: "22px" },
								children: translate("title")
							}),
							react_jsx_runtime.jsx("div", {
								style: { color: "var(--dsw-alias-label-tertiary, #7a756a)", fontSize: 12, lineHeight: "18px" },
								children: translate("description")
							})
						]
					}),
					react_jsx_runtime.jsx("div", {
						style: { display: "inline-flex", gap: 6, alignItems: "center" },
						children: [option("builtin", translate("off")), option(THEME_ID, translate("on"))]
					})
				]
			});
		}
		//#endregion

		//#region lib/client/locales.js
		const SETTINGS_NS = "settings.paper-warm";
		const zh = {
			title: "暖纸主题",
			description: "背景 #F2F0E5、前景 #100F0F 的暖色纸张配色",
			on: "暖纸",
			off: "原生"
		};
		const en = {
			title: "Paper warm",
			description: "Warm paper palette: background #F2F0E5, foreground #100F0F",
			on: "Paper",
			off: "Native"
		};
		//#endregion

		//#region lib/client/index.js
		/** Services this plugin needs; `theme` is provided by `@deepseek-ai/dsh-client-ui-theme`. */
		const inject = ["theme", "slots", "locale"];

		/**
		 * Sidebar layer: warm palette for the third-party sidebar plus a guaranteed
		 * reopen affordance. Collapsing the left sidebar on Windows leaves a zero-width
		 * grid track while every reopen control lives inside that track, so the plugin
		 * renders its own button, shown only while the body carries
		 * `data-dsh-sidebar-collapsed`.
		 *
		 * Why the `--dcu-*` overrides: `@michengai/dsh-codex-ui` replaces the official
		 * sidebar and paints it from its own palette variables declared on `.dcu-root`
		 * (light `#eef7f5`, a cool teal). Overriding the first-party
		 * `--dsw-specific-sidebar-fill` therefore leaves that sidebar cool; the sheet
		 * maps its variables onto the same warm scale the theme uses.
		 */
		const SIDEBAR_CSS = `
/* --- third-party sidebar palette: cool teal default -> warm paper --- */
:root,
:root body[data-ds-dark-theme] {
	--dcu-sidebar-background: #F2F0E5 !important;
	--dcu-sidebar-primary: #100F0F !important;
	--dcu-sidebar-secondary: #55524A !important;
	--dcu-sidebar-tertiary: #7A756A !important;
	--dcu-sidebar-navigation: #3A3833 !important;
	--dcu-sidebar-icon: #3A3833 !important;
	--dcu-sidebar-hover: #E7E4D6 !important;
	--dcu-sidebar-border: #100f0f1f !important;
	--dcu-tip-bg: #FAF8F0 !important;
	--dcu-tip-shadow: 0 10px 32px #100f0f29 !important;
}

/* --- its settings page reads a separate --sp-* palette --- */
:root .dcu-settings-page,
:root body[data-ds-dark-theme] .dcu-settings-page {
	--sp-bg: #F2F0E5 !important;
	--sp-nav: #F2F0E5 !important;
	--sp-card: #FAF8F0 !important;
	--sp-border: #100f0f1f !important;
	--sp-text: #100F0F !important;
	--sp-muted: #55524A !important;
	--sp-hover: #E7E4D6 !important;
	--sp-active: #DFDBCB !important;
}

/* --- the theme's own dark palette (resolved through data-ds-dark-theme) --- */
:root body[data-ds-dark-theme] {
	--dcu-sidebar-background: #100F0F !important;
	--dcu-sidebar-primary: #F2F0E5 !important;
	--dcu-sidebar-secondary: #C4BFB1 !important;
	--dcu-sidebar-tertiary: #9C978A !important;
	--dcu-sidebar-navigation: #D8D3C4 !important;
	--dcu-sidebar-icon: #D8D3C4 !important;
	--dcu-sidebar-hover: #2B2A28 !important;
	--dcu-sidebar-border: #f2f0e524 !important;
	--dcu-tip-bg: #222120 !important;
	--dcu-tip-shadow: 0 10px 32px #00000073 !important;
}

/*
 * The sidebar also ships a "glass" variant that hard-codes its own fill
 * (body[data-we-sidebar-glass] .dcu-root { background: #eef7f5 }), which no
 * variable override can reach. Paint the sidebar root from the theme token
 * directly; when that attribute is absent this re-asserts the same colour.
 */
body .dcu-root,
body[data-we-sidebar-glass] .dcu-root {
	background: var(--dsw-specific-sidebar-fill, #F2F0E5) !important;
}

body[data-ds-dark-theme] .dcu-root,
body[data-ds-dark-theme][data-we-sidebar-glass] .dcu-root {
	background: #100F0F !important;
}

/*
 * A third-party "glass sidebar" effect lifts the sidebar toward white with
 * color-mix + a white sheen gradient on the .dcu-root::before overlay, which washes
 * the warm canvas out. Neutralise it *for the warm palette only*: clearing the mix
 * colour and dropping the sheen keeps the effect configured (blur/saturation still
 * apply) while letting #F2F0E5 show through. Dark mode keeps the effect untouched.
 */
body[data-we-sidebar-glass]:not([data-ds-dark-theme]) .dcu-root {
	--we-sidebar-color: transparent !important;
	--we-sidebar-sheen: 0 !important;
}

:root body[data-ds-dark-theme] .dcu-settings-page {
	--sp-bg: #100F0F !important;
	--sp-nav: #100F0F !important;
	--sp-card: #1A1918 !important;
	--sp-border: #f2f0e524 !important;
	--sp-text: #F2F0E5 !important;
	--sp-muted: #C4BFB1 !important;
	--sp-hover: #2B2A28 !important;
	--sp-active: #343230 !important;
}

/* --- reopen affordance, visible only while the sidebar is collapsed --- */
[data-paper-warm-expand] {
	display: none;
	position: fixed;
	top: max(6px, env(safe-area-inset-top));
	left: 12px;
	z-index: 60;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	padding: 0;
	border: 1px solid var(--dsw-alias-border-l2, #100f0f1f);
	border-radius: 50%;
	background: var(--dsw-alias-bg-layer-1, #faf8f0);
	color: var(--dsw-alias-label-primary, #100f0f);
	cursor: pointer;
	box-shadow: 0 1px 3px #100f0f1f;
}
body[data-dsh-sidebar-collapsed] [data-paper-warm-expand] { display: inline-flex; }
[data-paper-warm-expand]:hover { background: var(--dsw-alias-interactive-bg-hover-solid, #e7e4d6); }
[data-paper-warm-expand]:focus-visible {
	outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary, #4176e6);
	outline-offset: -2px;
}
html[data-windows-titlebar] body[data-dsh-sidebar-collapsed] button[aria-label="打开侧边栏"],
html[data-windows-titlebar] body[data-dsh-sidebar-collapsed] button[aria-label="Open sidebar"] {
	position: fixed;
	top: max(6px, calc((var(--dsh-windows-titlebar-height, 32px) - 28px) / 2));
	left: 48px;
	z-index: 60;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 50%;
}
body[data-dsh-sidebar-collapsed] [data-dsh-toggle-cluster] { z-index: 60; pointer-events: auto; }
body[data-dsh-sidebar-collapsed] [data-dsh-toggle-cluster] button { pointer-events: auto; cursor: pointer; }
`;

		/** Install the recovery sheet once per document. */
		function installSidebarCss() {
			const tagId = "dsh-theme-paper-warm/sidebar-recovery.css";
			if (document.querySelector(`style[data-plugin-css="${tagId}"]`) !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-theme-paper-warm";
			tag.dataset.pluginCss = tagId;
			tag.textContent = SIDEBAR_CSS;
			document.head.append(tag);
		}

		/**
		 * Build the reopen button and wire its click to the most specific available
		 * toggle path.
		 * @param toggle - layout service toggle, or `undefined` when absent.
		 * @returns the button element.
		 */
		function createExpandButton(toggle) {
			const button = document.createElement("button");
			button.type = "button";
			button.dataset.paperWarmExpand = "";
			button.setAttribute("aria-label", "打开侧边栏");
			button.title = "打开侧边栏";
			button.style.margin = "0";
			button.innerHTML =
				'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="1.5" y="2.5" width="13" height="11" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.3"/><line x1="6" y1="2.5" x2="6" y2="13.5" stroke="currentColor" stroke-width="1.3"/></svg>';
			button.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				if (toggle !== undefined && typeof toggle.toggleSidebar === "function") {
					toggle.toggleSidebar();
					return;
				}
				const cluster = document.querySelector("[data-dsh-toggle-cluster] button");
				if (cluster instanceof HTMLElement) {
					cluster.click();
					return;
				}
				const native = document.querySelector(
					'button[aria-label="打开侧边栏"], button[aria-label="Open sidebar"]'
				);
				if (native instanceof HTMLElement) native.click();
			});
			return button;
		}

		/**
		 * Client plugin body: register the third-party theme, restore a previous
		 * selection, add the row that switches it, and install the sidebar recovery
		 * layer.
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			const theme = ctx.theme;
			if (theme === undefined) return;

			/**
			 * Whether the stored selection is wanted. Only this package's own row
			 * changes it: a page load and every preference the Host settings push are
			 * answered by re-asserting the stored selection, never by dropping it.
			 */
			let desired = storedActive();

			/**
			 * Session-only override, set when the platform Appearance row is pressed
			 * (see the press listener below). The built-in preference the user just
			 * picked stays in force until the next page load; the stored selection is
			 * left alone, so no misread press can ever lose the theme.
			 */
			let overridden = false;

			/** Timestamp of the last press on an appearance toggle. */
			let pressedAt = 0;

			/** Re-assert the stored selection; a rejected restore only costs the theme. */
			function assertStored() {
				try {
					theme.setTheme(THEME_ID);
				} catch (error) {
					console.warn("paper-warm: restoring the stored selection failed", error);
				}
			}

			ctx.effect(() => {
				const disposer = theme.register({ id: THEME_ID, colorScheme: "light", tokens: PALETTE.light });
				if (desired) assertStored();
				return () => {
					if (typeof disposer === "function") disposer();
				};
			}, "paper-warm: theme registration");

			/**
			 * `ThemeRuntime` provides itself on the schema default and adopts the
			 * durable `ui-theme` preference whenever the settings document reaches the
			 * browser — at boot, and again on every invalidation or reconnect. Each
			 * adoption publishes `theme/change` with a built-in preference and would
			 * otherwise silently outvote the stored selection (the theme "is gone"
			 * after a restart). Those pushes carry no signature worth guessing at, so
			 * the rule is the other way round: keep the stored selection in force, and
			 * let a real press on an appearance toggle end it for this session.
			 */
			ctx.effect(
				() =>
					ctx.on("theme/change", (snapshot) => {
						if (!desired || overridden || snapshot.preference === THEME_ID) return;
						/* Both the platform Appearance cubes and this package's own row
						   are `aria-pressed` buttons; a press right before the change is
						   what makes it a choice rather than a settings push. */
						if (Date.now() - pressedAt < PRESS_WINDOW_MS) {
							overridden = true;
							return;
						}
						storeFallback(snapshot.preference);
						assertStored();
					}),
				"paper-warm: stored selection reconciliation"
			);

			/** Remember an appearance press, so the next change can be read as one. */
			ctx.effect(() => {
				const notePress = (event) => {
					if (event.target?.closest?.("button[aria-pressed]") != null) pressedAt = Date.now();
				};
				document.addEventListener("pointerdown", notePress, true);
				return () => document.removeEventListener("pointerdown", notePress, true);
			}, "paper-warm: appearance presses");

			/**
			 * Stack the palette as a token override layer while — and only while —
			 * the paper theme is the active preference. The registered definition
			 * carries one color scheme, so this layer is what keeps the warm palette
			 * correct when the user later switches the built-in Appearance option to
			 * another scheme: overrides carry a `{ light, dark }` pair and the active
			 * scheme picks. Without an active layer the built-in palette shows
			 * through, so "native" stays genuinely native.
			 */
			ctx.effect(() => {
				let remove;
				const sync = (preference) => {
					const active = preference === THEME_ID;
					if (active && remove === undefined) remove = theme.overrideTokens("dsh-theme-paper-warm", PALETTE_OVERRIDE);
					else if (!active && remove !== undefined) {
						remove();
						remove = undefined;
					}
				};
				sync(theme.getTheme().preference);
				const off = ctx.on("theme/change", (snapshot) => sync(snapshot.preference));
				return () => {
					off();
					remove?.();
					remove = undefined;
				};
			}, "paper-warm: palette override layer");

			ctx.effect(
				() =>
					ctx.locale.register(SETTINGS_NS, {
						zh,
						en
					}),
				"paper-warm: row dictionaries"
			);

			/**
			 * Read the live theme snapshot. Called during render, so it subscribes the
			 * component to `theme/change` through the client runtime's hook.
			 * @returns the current theme snapshot.
			 */
			const useTheme = () => {
				const [snapshot, setSnapshot] = react.useState(() => theme.getTheme());
				react.useEffect(() => ctx.on("theme/change", (next) => setSnapshot(next)), []);
				return snapshot;
			};

			/** @returns whether the paper theme is the current preference. */
			const read = () => theme.getTheme().preference === THEME_ID;

			/**
			 * Switch the paper theme on or off — the package's own durable selection.
			 * The host settings schema cannot store a third-party id, so this package
			 * persists the selection itself and only falls back to a built-in
			 * preference when switching off.
			 * @param active - desired state.
			 */
			const write = (active) => {
				desired = active;
				overridden = false;
				if (active) {
					storeFallback(theme.getTheme().preference);
					storeActive(true);
					theme.setTheme(THEME_ID);
					return;
				}
				storeActive(false);
				theme.setTheme(storedFallback());
			};

			ctx.slots.inject("settings.general.item", () =>
				ctx.slots.register(
					{
						name: "settings.general.item",
						id: "paper-warm",
						order: 12,
						locale: SETTINGS_NS,
						inject: () => ({ read, write, useTheme })
					},
					PaperRow
				)
			);

			/*
			 * Sidebar recovery. The sheet is document-global (it does not depend on
			 * the theme being selected), and the button is mounted on every page the
			 * plugin runs on, so a closed sidebar always has a visible way back.
			 */
			installSidebarCss();
			ctx.inject(["layout"], (layoutCtx) => {
				const button = createExpandButton(layoutCtx.layout);
				document.body.append(button);
				layoutCtx.effect(() => () => button.remove(), "paper-warm: sidebar expand button");
			});
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.THEME_ID = THEME_ID;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
