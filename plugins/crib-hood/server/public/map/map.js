'use strict';
window.initMap = function initMap() {
  const cyContainer = document.getElementById('cy');
  const empty = document.getElementById('empty-state');
  const metaCount = document.getElementById('meta-count');
  const metaAgents = document.getElementById('meta-agents');
  const metaMode = document.getElementById('meta-mode');
  const layerButtons = document.querySelectorAll('.layer-pill[data-layer]');

  let cy = null;
  const layerState = { structural: true, semantic: false, activity: false };
  const animals = window.AnimalRenderer ? window.AnimalRenderer.create({ container: document.getElementById('creatures') }) : null;
  const trail = window.Trail ? window.Trail.create() : null;

  function showEmpty(on) { empty.hidden = !on; cyContainer.style.display = on ? 'none' : ''; }

  function buildElements(graph) {
    const nodes = graph.nodes.map((n) => ({ data: { id: n.id, label: n.label, path: n.path, summary: n.summary || '' } }));
    const edges = graph.edges.map((e, i) => ({
      data: { id: `e${i}`, source: e.from, target: e.to, kind: e.kind, weight: e.weight, evidence: e.evidence || '' },
      classes: `kind-${e.kind}`,
    }));
    return [...nodes, ...edges];
  }

  function applyLayerVisibility() {
    if (!cy) return;
    for (const kind of ['structural', 'semantic', 'activity']) {
      cy.edges(`.kind-${kind}`).style('display', layerState[kind] ? 'element' : 'none');
    }
  }

  function renderGraph(graph) {
    if (!graph || !graph.nodes || !graph.nodes.length) { showEmpty(true); return; }
    showEmpty(false);

    if (cy) cy.destroy();
    cy = cytoscape({
      container: cyContainer,
      elements: buildElements(graph),
      style: [
        { selector: 'node', style: {
          'background-color': '#2a3a4a', 'border-color': '#6a8aaa', 'border-width': 2,
          label: 'data(label)', color: '#c0c0c0', 'font-size': 12,
          'text-valign': 'bottom', 'text-margin-y': 6, width: 48, height: 48,
        }},
        { selector: 'node.busy', style: { 'border-color': '#7fffaf', 'shadow-color': '#7fffaf', 'shadow-blur': 16, 'shadow-opacity': 0.7 }},
        { selector: 'edge', style: { 'curve-style': 'bezier', 'target-arrow-shape': 'none' }},
        { selector: 'edge.kind-structural', style: { width: 'mapData(weight, 0, 1, 1, 5)', 'line-color': '#4a6a8a' }},
        { selector: 'edge.kind-semantic', style: { 'line-style': 'dashed', 'line-color': '#d4a373', width: 2 }},
        { selector: 'edge.kind-activity', style: { 'line-color': '#d4a3ff', width: 'mapData(weight, 0, 1, 1, 4)', 'line-style': 'dotted' }},
      ],
      layout: { name: 'cose', animate: true, randomize: true, nodeRepulsion: 8000 },
      minZoom: 0.3, maxZoom: 3,
    });

    cy.on('render position', () => animals?.syncPositions(cy));
    applyLayerVisibility();
    metaCount.textContent = `${graph.nodes.length} modules`;
    const src = document.getElementById('meta-source');
    src.textContent = graph.source === 'ast' ? '🔍 AST-only' : graph.source === 'hybrid' ? '🌐 Hybrid' : '📚 code-crib';
    src.dataset.source = graph.source || '';
  }

  async function refreshGraph() {
    try {
      const resp = await fetch('/api/graph');
      const data = await resp.json();
      if (data && data.exists === false) { showEmpty(true); return; }
      window.__currentGraph = data;
      renderGraph(data);
    } catch (err) {
      console.error('[map] failed to load graph', err);
      showEmpty(true);
    }
  }

  for (const btn of layerButtons) {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.layer;
      layerState[kind] = !layerState[kind];
      btn.classList.toggle('on', layerState[kind]);
      applyLayerVisibility();
    });
  }

  let trailEnabled = false;
  const trailToggle = document.getElementById('trail-toggle');
  trailToggle?.addEventListener('click', () => {
    trailEnabled = !trailEnabled;
    trailToggle.classList.toggle('on', trailEnabled);
    if (!trailEnabled) {
      trail?.clear();
      removeActivityEdges();
    }
  });

  function removeActivityEdges() {
    if (cy) cy.edges('.kind-activity').remove();
  }

  const activityWeights = new Map(); // "from->to" → weight
  function synthesizeActivity() {
    if (!cy || !trail || !trailEnabled) return;
    for (const [from, to] of trail.recentPairs()) {
      const key = `${from}->${to}`;
      const w = Math.min(1, (activityWeights.get(key) || 0) + 0.1);
      activityWeights.set(key, w);
    }
    removeActivityEdges();
    let i = 0;
    for (const [key, w] of activityWeights) {
      const [from, to] = key.split('->');
      cy.add({
        group: 'edges',
        data: { id: `act-${i++}`, source: from, target: to, kind: 'activity', weight: w, evidence: 'recent agent traffic' },
        classes: 'kind-activity',
      });
    }
    applyLayerVisibility();
  }

  // Decay loop
  setInterval(() => {
    if (!trailEnabled) return;
    for (const [k, w] of activityWeights) {
      const decayed = w * 0.8;
      if (decayed < 0.1) activityWeights.delete(k);
      else activityWeights.set(k, decayed);
    }
    synthesizeActivity();
  }, 30000);

  function onStateSnapshot(state) {
    metaMode.textContent = state.mode ? state.mode.name : '—';
    metaAgents.textContent = `${state.agents.length} agents`;
  }

  function onAgentOnModule(msg) {
    if (cy) cy.getElementById(msg.module).addClass('busy');
    animals?.placeAgent(msg.agent, msg.module, msg.character);
    trail?.push(msg.agent, msg.module);
    synthesizeActivity();
  }

  function onAgentLeftModule(msg) {
    animals?.removeAgent(msg.agent);
    // V1: re-derive busy classes from the live animal map after removal
    if (cy) {
      cy.nodes('.busy').removeClass('busy');
      const stillActive = animals ? animals.activeModules() : new Set();
      stillActive.forEach((m) => cy.getElementById(m).addClass('busy'));
    }
  }

  return { refreshGraph, onStateSnapshot, onAgentOnModule, onAgentLeftModule, _cy: () => cy };
};
