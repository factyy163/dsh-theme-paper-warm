/**
 * Reproduction harness for the paper-warm boot race.
 *
 * Mirrors the facts that decide the outcome in the real GUI:
 *  1. `ThemeRuntime` (dsh-client-ui-theme) provides itself on the schema default
 *     `system` and adopts the durable `ui-theme` preference whenever the settings
 *     document reaches the browser: at boot, and again on every invalidation or
 *     reconnect, with no signature that separates those pushes from a choice.
 *  2. The platform Appearance cubes are `aria-pressed` buttons, and the plugin's
 *     own row is persisted in `localStorage`.
 *
 * Run: node test/boot-race.test.mjs
 */
import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const PLUGIN = fileURLToPath(new URL("../lib/client.js", import.meta.url));
const THEME_ID = "paper-warm";
const STORAGE_KEY = "dsh.theme.paper-warm";

let failures = 0;
function check(label, actual, expected) {
	const ok = JSON.stringify(actual) === JSON.stringify(expected);
	if (!ok) failures += 1;
	console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : ` — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

/** Minimal document: a style tag, a mounted button, and the press listener. */
function createDocument() {
	const listeners = new Map();
	const element = () => ({
		dataset: {},
		style: { setProperty() {}, getPropertyValue: () => "" },
		setAttribute() {},
		addEventListener() {},
		append() {},
		remove() {},
		innerHTML: "",
		textContent: ""
	});
	return {
		head: { append() {} },
		body: { ...element(), style: { getPropertyValue: () => "" }, toggleAttribute() {} },
		documentElement: { dataset: {} },
		querySelector: () => null,
		createElement: element,
		addEventListener(type, handler) {
			if (!listeners.has(type)) listeners.set(type, []);
			listeners.get(type).push(handler);
		},
		removeEventListener(type, handler) {
			const list = listeners.get(type) ?? [];
			list.splice(list.indexOf(handler), 1);
		},
		/** Press something; `toggle` marks the target as an `aria-pressed` button. */
		press({ toggle = true } = {}) {
			const target = toggle ? { closest: () => ({}) } : { closest: () => null };
			for (const handler of [...(listeners.get("pointerdown") ?? [])]) handler({ target });
		}
	};
}

/** Load the plugin bundle and return its exports. */
function loadPlugin(storage, doc) {
	let exports;
	const react = {
		createElement: () => null,
		useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
		useEffect: () => {}
	};
	const sandbox = {
		window: {
			__ModuleLoader__: {
				load: ({ factory }) => {
					exports = factory((name) => {
						if (name === "react") return react;
						if (name === "react/jsx-runtime") return { jsx: () => null, jsxs: () => null };
						throw new Error(`unexpected require: ${name}`);
					});
				}
			}
		},
		document: doc,
		localStorage: storage,
		console,
		Date,
		JSON,
		Object,
		Array,
		Boolean,
		Number,
		String,
		Error,
		TypeError,
		Symbol,
		Promise,
		queueMicrotask
	};
	sandbox.globalThis = sandbox;
	vm.runInNewContext(fs.readFileSync(PLUGIN, "utf8"), sandbox, { filename: PLUGIN });
	return exports;
}

function createStorage(initial = {}) {
	const map = new Map(Object.entries(initial));
	return {
		getItem: (key) => (map.has(key) ? map.get(key) : null),
		setItem: (key, value) => map.set(key, String(value)),
		removeItem: (key) => map.delete(key),
		raw: map
	};
}

/**
 * Faithful subset of ThemeRuntime: schema default `system`, own built-in writes
 * kept out of the durable scope, `adopt()` driven by the settings document.
 */
function createTheme(ctx) {
	const service = {
		preference: "system",
		snapshot: { preference: "system", revision: 0 },
		registered: ["light", "dark"],
		overrides: new Map(),
		getTheme: () => service.snapshot,
		register(definition) {
			service.registered.push(definition.id);
			return () => {
				service.registered = service.registered.filter((id) => id !== definition.id);
			};
		},
		overrideTokens(source, tokens) {
			service.overrides.set(source, tokens);
			return () => service.overrides.delete(source);
		},
		setTheme(id) {
			if (service.preference === id) return;
			if (id !== "system" && !service.registered.includes(id)) throw new Error(`theme "${id}" is not registered`);
			service.preference = id;
			service.publish();
		},
		adopt(preference) {
			if (service.preference === preference) return;
			service.preference = preference;
			service.publish();
		},
		publish() {
			service.snapshot = { preference: service.preference, revision: service.snapshot.revision + 1 };
			ctx.emit("theme/change", service.snapshot);
		}
	};
	return service;
}

function createCtx(theme) {
	const handlers = new Map();
	const registered = [];
	const ctx = {
		theme,
		on(event, handler) {
			if (!handlers.has(event)) handlers.set(event, []);
			handlers.get(event).push(handler);
			return () => {
				const list = handlers.get(event);
				list.splice(list.indexOf(handler), 1);
			};
		},
		emit(event, payload) {
			for (const handler of [...(handlers.get(event) ?? [])]) handler(payload);
		},
		effect(run) {
			run();
		},
		inject(deps, run) {
			if (deps.every((dep) => ctx[dep] !== undefined)) run(ctx);
		},
		locale: { register: () => () => {} },
		slots: {
			inject: (name, run) => run(),
			register: (spec, Component) => {
				registered.push({ spec, Component });
				return () => {};
			}
		}
	};
	return { ctx, registered };
}

/** One full page life over one browser storage, with the plugin applied. */
function boot(storage = createStorage({ [STORAGE_KEY]: "1" })) {
	const doc = createDocument();
	const plugin = loadPlugin(storage, doc);
	let ctx;
	const built = createCtx(undefined);
	ctx = built.ctx;
	const theme = createTheme(ctx);
	ctx.theme = theme;
	plugin.apply(ctx);
	const row = built.registered.find((entry) => entry.spec.id === "paper-warm");
	return { storage, doc, theme, ctx, row, reload: () => boot(storage) };
}

/** The settings document reaching the browser and ThemeRuntime adopting it. */
function settingsPush({ theme }, preference = "light") {
	theme.adopt(preference);
}

/** A press on one of the platform Appearance cubes, then its handler. */
function platformPress(session, preference) {
	session.doc.press();
	session.theme.setTheme(preference);
}

console.log("== the boot adoption does not outvote the stored selection ==");
{
	const session = boot();
	check("stored selection applies at boot", session.theme.preference, THEME_ID);
	settingsPush(session, "light");
	check("settings push is answered by re-asserting", session.theme.preference, THEME_ID);
}

console.log("\n== repeated settings pushes never drop the theme ==");
{
	const session = boot();
	settingsPush(session, "light");
	settingsPush(session, "light");
	settingsPush(session, "dark");
	check("every push keeps the stored selection", session.theme.preference, THEME_ID);
	check("the stored selection is still on", session.storage.getItem(STORAGE_KEY), "1");
}

console.log("\n== the platform Appearance row wins for the session, and only for it ==");
{
	const session = boot();
	settingsPush(session, "light");
	platformPress(session, "dark");
	check("platform choice takes effect", session.theme.preference, "dark");
	check("platform choice leaves the stored selection alone", session.storage.getItem(STORAGE_KEY), "1");
	settingsPush(session, "light");
	check("settings pushes respect the session override", session.theme.preference, "light");
	const reloaded = session.reload();
	check("a page load restores the stored selection again", reloaded.theme.preference, THEME_ID);
}

console.log("\n== an unaccompanied built-in change is never read as a choice ==");
{
	const session = boot();
	settingsPush(session, "light");
	session.theme.setTheme("dark");
	check("no press: the stored selection is re-asserted", session.theme.preference, THEME_ID);
	check("no press: the stored selection is untouched", session.storage.getItem(STORAGE_KEY), "1");
}

console.log("\n== the plugin's own row is the durable switch ==");
{
	const session = boot();
	settingsPush(session, "light");
	const { read, write } = session.row.spec.inject();
	check("row reads the stored selection", read(), true);
	write(false);
	check("row switches back to the remembered built-in preference", session.theme.preference, "light");
	check("row records the selection as off", session.storage.getItem(STORAGE_KEY), "0");
	const reloaded = session.reload();
	check("the off selection survives a page load", reloaded.theme.preference, "system");
	settingsPush(reloaded, "light");
	check("the reloaded page lands on the durable preference", reloaded.theme.preference, "light");
	write(true);
	check("row switches the theme back on", session.theme.preference, THEME_ID);
	check("row records the selection as on", session.storage.getItem(STORAGE_KEY), "1");
}

console.log("\n== the row also ends a session override ==");
{
	const session = boot();
	settingsPush(session, "light");
	platformPress(session, "dark");
	check("platform choice takes effect", session.theme.preference, "dark");
	const { write } = session.row.spec.inject();
	write(true);
	check("row brings the theme back within the session", session.theme.preference, THEME_ID);
}

console.log("\n== a fresh profile with no stored selection stays native ==");
{
	const session = boot(createStorage());
	check("nothing is restored", session.theme.preference, "system");
	settingsPush(session, "light");
	check("the settings push lands", session.theme.preference, "light");
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exitCode = failures === 0 ? 0 : 1;
