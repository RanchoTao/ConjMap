'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Focus, Minus, Plus, Search, X } from 'lucide-react';
import type { Core } from 'cytoscape';
import type { Problem, Relationship } from '@/lib/schema';
import { queryProblems } from '@/lib/query';
import { Badge } from './status';

type Props = {
  problems: Problem[];
  relationships: Relationship[];
  colors: Record<string, string>;
  preview?: boolean;
};
export function Atlas({ problems, relationships, colors, preview = false }: Props) {
  const host = useRef<HTMLDivElement>(null),
    cy = useRef<Core | null>(null);
  const [q, setQ] = useState(''),
    [field, setField] = useState(''),
    [status, setStatus] = useState(''),
    [edges, setEdges] = useState(true);
  const [selected, setSelected] = useState<Problem | null>(null),
    [ready, setReady] = useState(false),
    [error, setError] = useState('');
  const fields = useMemo(() => [...new Set(problems.map((p) => p.field))].sort(), [problems]);
  const filtered = useMemo(
    () => queryProblems(problems, { q, field, status }),
    [problems, q, field, status],
  );
  const selectedVisible = selected && filtered.some((p) => p.id === selected.id) ? selected : null;
  const liveEdges = useMemo(() => {
    const ids = new Set(filtered.map((p) => p.id));
    return edges ? relationships.filter((r) => ids.has(r.source_id) && ids.has(r.target_id)) : [];
  }, [filtered, relationships, edges]);
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let graph: Core | undefined;
    import('cytoscape')
      .then(({ default: cytoscape }) => {
        if (cancelled || !host.current) return;
        graph = cytoscape({
          container: host.current,
          elements: [],
          minZoom: 0.15,
          maxZoom: 4,
          wheelSensitivity: 0.2,
          style: [
            {
              selector: 'node',
              style: {
                'background-color': 'data(color)',
                width: 11,
                height: 11,
                label: 'data(label)',
                color: '#bbc4d2',
                'font-size': 10,
                'font-family': 'Arial',
                'text-valign': 'bottom',
                'text-margin-y': 9,
                'text-max-width': '125px',
                'text-wrap': 'ellipsis',
                'border-width': 3,
                'border-color': 'data(color)',
                'border-opacity': 0.15,
                'min-zoomed-font-size': '7px',
              },
            },
            {
              selector: 'node:selected',
              style: {
                width: 19,
                height: 19,
                'border-width': 7,
                'border-opacity': 0.35,
                color: '#ffffff',
                'font-size': 13,
                'z-index': 10,
              },
            },
            {
              selector: 'edge',
              style: {
                width: 1.1,
                'line-color': '#94a3b8',
                opacity: 0.38,
                'line-style': 'dashed',
                'curve-style': 'bezier',
              },
            },
            { selector: '.muted', style: { opacity: 0.15 } },
          ],
        });
        cy.current = graph;
        graph.on('tap', 'node', (event) => {
          const id = event.target.id();
          setSelected(problems.find((p) => p.id === id) ?? null);
        });
        observer = new ResizeObserver(() => graph?.resize());
        observer.observe(host.current);
        setReady(true);
      })
      .catch(() => setError('The graph could not load. Use the accessible problem index below.'));
    return () => {
      cancelled = true;
      observer?.disconnect();
      graph?.destroy();
      cy.current = null;
    };
  }, [problems]);
  useEffect(() => {
    const graph = cy.current;
    if (!ready || !graph) return;
    graph.elements().remove();
    const groups = new Map(fields.map((f, i) => [f, i]));
    const counts: Record<string, number> = {};
    const elements = filtered.map((p) => {
      const group = groups.get(p.field) ?? 0;
      const index = counts[p.field] ?? 0;
      counts[p.field] = index + 1;
      const angle = (group / fields.length) * Math.PI * 2 - Math.PI / 2;
      const localAngle = index * 2.39996;
      const radius = 26 + Math.sqrt(index) * 29;
      return {
        data: { id: p.id, label: p.title, color: colors[p.field] ?? '#6fc8c0' },
        position: {
          x: Math.cos(angle) * 255 + Math.cos(localAngle) * radius,
          y: Math.sin(angle) * 225 + Math.sin(localAngle) * radius,
        },
      };
    });
    graph.add(elements);
    graph.add(
      liveEdges.map((r, i) => ({
        data: { id: `edge-${i}`, source: r.source_id, target: r.target_id },
      })),
    );
    graph.layout({ name: 'preset', fit: true, padding: preview ? 35 : 55 }).run();
    if (filtered.length === 1) {
      // Keep a single search result readable and center the node itself, not its label box.
      const position = graph.nodes()[0].position();
      graph.zoom(1.5);
      graph.pan({
        x: graph.width() / 2 - position.x * 1.5,
        y: graph.height() / 2 - position.y * 1.5,
      });
    }
  }, [filtered, liveEdges, fields, ready, colors, preview]);
  return (
    <div className={`atlas ${preview ? 'atlas-preview' : ''}`}>
      {!preview ? (
        <div className="atlas-toolbar">
          <label className="search-input">
            <Search size={16} />
            <input
              aria-label="Search atlas"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a problem or an idea…"
            />
            {q ? (
              <button aria-label="Clear atlas search" onClick={() => setQ('')}>
                <X size={14} />
              </button>
            ) : null}
          </label>
          <select aria-label="Atlas field" value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">All fields</option>
            {fields.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
          <select
            aria-label="Atlas status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {['open', 'partially_resolved', 'solved', 'disputed', 'unknown'].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <label className="edge-toggle">
            <input type="checkbox" checked={edges} onChange={(e) => setEdges(e.target.checked)} />
            Discovery links
          </label>
        </div>
      ) : null}
      <div className="graph-stage">
        <div
          ref={host}
          className="graph-canvas"
          role="img"
          aria-label={`Interactive mathematics atlas with ${filtered.length} problem nodes`}
          data-testid="atlas-canvas"
          data-ready={ready}
        />
        {!ready || error ? (
          <div className="graph-loading">{error || 'Drawing the frontier…'}</div>
        ) : null}
        {!filtered.length && ready ? (
          <div className="graph-loading">No problems match these filters.</div>
        ) : null}
        <div className="graph-caption">
          <span className="live-dot" />
          {preview ? 'A landscape of mathematical questions' : 'RESEARCH LANDSCAPE'}
          <small>
            {preview
              ? 'Pan, zoom, and select a node to begin.'
              : 'Scroll to zoom · Drag to pan · Select a node'}
          </small>
        </div>
        <div className="graph-controls">
          <button
            aria-label="Zoom in"
            onClick={() =>
              cy.current?.zoom({
                level: (cy.current.zoom() ?? 1) * 1.3,
                renderedPosition: {
                  x: (host.current?.clientWidth ?? 0) / 2,
                  y: (host.current?.clientHeight ?? 0) / 2,
                },
              })
            }
          >
            <Plus size={17} />
          </button>
          <button
            aria-label="Zoom out"
            onClick={() => cy.current?.zoom((cy.current.zoom() ?? 1) / 1.3)}
          >
            <Minus size={17} />
          </button>
          <button aria-label="Fit graph" onClick={() => cy.current?.fit(undefined, 45)}>
            <Focus size={17} />
          </button>
        </div>
        {selectedVisible ? (
          <div className="node-detail" aria-live="polite">
            <button
              aria-label="Close node details"
              className="close-node"
              onClick={() => {
                setSelected(null);
                cy.current?.nodes().unselect();
              }}
            >
              <X size={15} />
            </button>
            <span className="eyebrow">{selectedVisible.field}</span>
            <h3>{selectedVisible.title}</h3>
            <div className="badge-row">
              <Badge>{selectedVisible.status}</Badge>
              <Badge tone="amber">unverified</Badge>
            </div>
            <p>{selectedVisible.statement.replace(/\$|\*|`/g, '').slice(0, 180)}…</p>
            <Link className="text-link" href={`/problems/${selectedVisible.id}`}>
              Read problem & evidence <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : null}
        {preview ? (
          <Link href="/atlas" className="graph-open">
            Open full atlas <ArrowUpRight size={15} />
          </Link>
        ) : null}
      </div>
      <div className="graph-bottom">
        <div className="graph-legend">
          {fields.map((f) => (
            <button
              key={f}
              onClick={() => setField(field === f ? '' : f)}
              aria-pressed={field === f}
            >
              <i style={{ background: colors[f] }} />
              {f}
            </button>
          ))}
        </div>
        <span className="graph-count" aria-live="polite" data-testid="graph-count">
          {filtered.length} nodes · {liveEdges.length} links
        </span>
      </div>
      {!preview ? (
        <>
          <p className="graph-disclaimer">
            Dashed links are <strong>unverified subject associations</strong> based on shared source
            tags. They do not establish implications, equivalences, or dependencies.
          </p>
          <details className="accessible-index">
            <summary>Accessible node index · {filtered.length} problems</summary>
            <div>
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected(p);
                    const n = cy.current?.getElementById(p.id);
                    if (n) {
                      cy.current?.nodes().unselect();
                      n.select();
                      cy.current?.animate({ center: { eles: n }, zoom: 1.3 }, { duration: 200 });
                    }
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </details>
        </>
      ) : null}
    </div>
  );
}
