/**
 * Global environment bindings accessor.
 *
 * @param {Object} data - Cloudflare Worker environment bindings.
 * @returns {Function} The env function with bindings as properties.
 *
 * @description
 * Stores Cloudflare Worker bindings (D1, KV, secrets) globally.
 * Call once at Worker entry, then access anywhere via property access.
 *
 * @example
 * env(environment) // Initialize
 * env.DB.prepare('SELECT ...') // Access
 */
const env = (data) => {
  Object.assign(env, data);
  return env;
};

export default env;
