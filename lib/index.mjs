/**
 * Host half of `dsh-theme-paper-warm`.
 *
 * All behaviour lives in the client half (`./client`), which registers the
 * `paper-warm` theme through `ctx.theme` and adds its row to the Appearance
 * section. This half only exists so the package is a resolvable Loader entry:
 * the client module system discovers a browser bundle from a loaded entry that
 * declares `dsh.client`, so an entry with no host behaviour is still required.
 *
 * @module dsh-theme-paper-warm
 */

/** No host-side services are required. */
export const inject = [];

/** Host body: intentionally empty. */
export function apply() {}

export default { inject, apply };
