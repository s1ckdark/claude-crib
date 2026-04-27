'use strict';
window.AnimalRenderer = (() => {
  function create({ container }) {
    const animals = new Map(); // name → { el, module, character }

    function placeAgent(name, moduleId, character) {
      let entry = animals.get(name);
      if (!entry) {
        const el = document.createElement('div');
        el.className = 'creature';
        el.dataset.agent = name;
        container.appendChild(el);
        entry = { el, module: moduleId, character };
        animals.set(name, entry);
      } else {
        entry.module = moduleId;
        if (character) entry.character = character;
      }
      entry.el.textContent = entry.character || '🤖';
    }

    function removeAgent(name) {
      const entry = animals.get(name);
      if (entry) { entry.el.remove(); animals.delete(name); }
    }

    function activeModules() {
      const set = new Set();
      for (const entry of animals.values()) set.add(entry.module);
      return set;
    }

    function syncPositions(cy) {
      // Group agents by module so we can scatter co-located ones
      const byModule = new Map();
      for (const [name, entry] of animals) {
        if (!byModule.has(entry.module)) byModule.set(entry.module, []);
        byModule.get(entry.module).push(entry);
      }
      for (const [moduleId, entries] of byModule) {
        const node = cy.getElementById(moduleId);
        if (!node || node.empty()) continue;
        const pos = node.renderedPosition();
        const radius = (node.renderedWidth() / 2) + 18;
        const count = entries.length;
        entries.forEach((entry, i) => {
          const angle = count === 1 ? -Math.PI / 2 : (Math.PI * 2 * i) / count - Math.PI / 2;
          const x = pos.x + Math.cos(angle) * (count === 1 ? 0 : radius);
          const y = pos.y + Math.sin(angle) * (count === 1 ? -radius : radius);
          entry.el.style.left = `${x}px`;
          entry.el.style.top = `${y}px`;
        });
      }
    }

    return { placeAgent, removeAgent, syncPositions, activeModules };
  }
  return { create };
})();
