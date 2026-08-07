/**
 * Platform V3 Plugin Registry
 */

const pluginRegistry = new Map();

export function registerPlugin(name, plugin) {
  pluginRegistry.set(name, plugin);
}

export function getPlugin(name) {
  return pluginRegistry.get(name);
}

export function getAllPlugins() {
  return Array.from(pluginRegistry.entries());
}
