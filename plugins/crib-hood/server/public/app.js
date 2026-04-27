'use strict';
(function () {
  const stream = new EventSource('/events');
  const handlers = {
    'state-snapshot': (msg) => window.__map?.onStateSnapshot?.(msg.state),
    'graph-rebuilt': () => window.__map?.refreshGraph(),
    'agent-on-module': (msg) => window.__map?.onAgentOnModule?.(msg),
    'agent-left-module': (msg) => window.__map?.onAgentLeftModule?.(msg),
  };

  stream.onmessage = (evt) => {
    let data;
    try { data = JSON.parse(evt.data); } catch (_) { return; }
    if (data && data.type && handlers[data.type]) handlers[data.type](data);
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.__map = window.initMap();
    window.__map.refreshGraph();
  });
})();
