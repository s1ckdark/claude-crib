'use strict';
window.Trail = (() => {
  function create() {
    const RING_SIZE = 5;
    const buffers = new Map(); // agent → [{module, at}]

    function push(agent, moduleId) {
      const buf = buffers.get(agent) || [];
      buf.push({ module: moduleId, at: Date.now() });
      while (buf.length > RING_SIZE) buf.shift();
      buffers.set(agent, buf);
    }

    function recentPairs() {
      // Returns array of [from, to] adjacency pairs across all agents (most recent within ring)
      const pairs = [];
      for (const buf of buffers.values()) {
        for (let i = 1; i < buf.length; i++) {
          if (buf[i - 1].module !== buf[i].module) {
            pairs.push([buf[i - 1].module, buf[i].module]);
          }
        }
      }
      return pairs;
    }

    function clear() { buffers.clear(); }
    return { push, recentPairs, clear };
  }
  return { create };
})();
