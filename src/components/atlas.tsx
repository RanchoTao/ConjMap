'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Focus, Minus, Plus, Search, X } from 'lucide-react';
import type { Core } from 'cytoscape';
import type { Problem, Relationship } from '@/lib/schema';
import { queryProblems } from '@/lib/query';
import { Badge } from './status';
import { selectRelations, type SubstantiveRelation } from '@/lib/relations-v02';

export type StatementNode = {
  id: string;
  parent_id: string;
  title: string;
  field: string;
  formal_statement: string;
  url: string;
};
const noRelations: SubstantiveRelation[] = [];
const noStatements: StatementNode[] = [];

type Props = {
  problems: Problem[];
  relationships: Relationship[];
  colors: Record<string, string>;
  preview?: boolean;
  mathematical?: SubstantiveRelation[];
  statements?: StatementNode[];
  onMeasurement?: (value: {
    nodes: number;
    initial_render_ms: number;
    pan_frame_ms: number[];
    js_heap_bytes: number | null;
  }) => void;
};
export function Atlas({
  problems,
  relationships,
  colors,
  preview = false,
  mathematical = noRelations,
  statements = noStatements,
  onMeasurement,
}: Props) {
  const host = useRef<HTMLDivElement>(null),
    cy = useRef<Core | null>(null);
  const [q, setQ] = useState(''),
    [field, setField] = useState(''),
    [status, setStatus] = useState(''),
    [edges, setEdges] = useState(true);
  const [layer, setLayer] = useState('navigation'),
    [candidates, setCandidates] = useState(false),
    [selectedStatement, setSelectedStatement] = useState<StatementNode | null>(null);
  const [selected, setSelected] = useState<Problem | null>(null),
    [ready, setReady] = useState(0),
    [error, setError] = useState('');
  const fields = useMemo(() => [...new Set(problems.map((p) => p.field))].sort(), [problems]);
  const filtered = useMemo(
    () => queryProblems(problems, { q, field, status }),
    [problems, q, field, status],
  );
  const selectedVisible = selected && filtered.some((p) => p.id === selected.id) ? selected : null;
  const visibleStatements = useMemo(() => {
    if (layer === 'navigation') return [];
    const active = new Set(
      selectRelations(mathematical, layer, candidates).flatMap((r) => [r.source_id, r.target_id]),
    );
    return statements.filter((s) => active.has(s.id) && filtered.some((p) => p.id === s.parent_id));
  }, [layer, statements, filtered, mathematical, candidates]);
  const liveEdges = useMemo(() => {
    const ids = new Set([...filtered.map((p) => p.id), ...visibleStatements.map((s) => s.id)]);
    const rows =
      layer === 'navigation' ? relationships : selectRelations(mathematical, layer, candidates);
    return edges ? rows.filter((r) => ids.has(r.source_id) && ids.has(r.target_id)) : [];
  }, [filtered, relationships, edges, layer, mathematical, candidates, visibleStatements]);
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let graph: Core | undefined;
    const container = host.current;
    const refreshBounds = () => graph?.resize();
    import('cytoscape')
      .then(({ default: cytoscape }) => {
        if (cancelled || !host.current) return;
        graph = cytoscape({
          container: host.current,
          elements: [],
          minZoom: 0.15,
          maxZoom: 4,
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
            {
              selector: 'node[kind="statement"]',
              style: { shape: 'diamond', 'border-color': '#efb268', 'border-width': 2 },
            },
            {
              selector: 'edge[trust="candidate"]',
              style: {
                'line-color': '#efb268',
                'target-arrow-color': '#efb268',
                'target-arrow-shape': 'triangle',
                'line-style': 'dashed',
                opacity: 0.65,
              },
            },
            {
              selector: 'edge[trust="verified"]',
              style: {
                'line-color': '#81d9b2',
                'target-arrow-color': '#81d9b2',
                'target-arrow-shape': 'triangle',
                'line-style': 'solid',
                opacity: 0.9,
              },
            },
          ],
        });
        cy.current = graph;
        graph.on('tap', 'node', (event) => {
          const id = event.target.id();
          const statement = statements.find((s) => s.id === id);
          setSelectedStatement(statement ?? null);
          setSelected(problems.find((p) => p.id === (statement?.parent_id ?? id)) ?? null);
        });
        observer = new ResizeObserver(refreshBounds);
        observer.observe(host.current);
        // Canvas hit testing caches offsets; scrolling the surrounding page changes them.
        window.addEventListener('scroll', refreshBounds, true);
        container?.addEventListener('mousedown', refreshBounds, true);
        container?.addEventListener('touchstart', refreshBounds, true);
        setReady((generation) => generation + 1);
      })
      .catch(() => setError('The graph could not load. Use the accessible problem index below.'));
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('scroll', refreshBounds, true);
      container?.removeEventListener('mousedown', refreshBounds, true);
      container?.removeEventListener('touchstart', refreshBounds, true);
      graph?.destroy();
      cy.current = null;
    };
  }, [problems, statements]);
  useEffect(() => {
    const graph = cy.current;
    if (!ready || !graph) return;
    const measureStart = performance.now();
    graph.startBatch();
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
      visibleStatements.map((s, i) => ({
        data: { id: s.id, label: s.title, color: colors[s.field] ?? '#efb268', kind: 'statement' },
        position: { x: Math.cos(i) * 360, y: Math.sin(i) * 330 },
      })),
    );
    graph.add(
      liveEdges.map((r, i) => ({
        data: {
          id: `edge-${i}`,
          source: r.source_id,
          target: r.target_id,
          trust:
            r.review_status === 'reviewed' || r.review_status === 'verified'
              ? 'verified'
              : layer === 'navigation'
                ? 'navigation'
                : 'candidate',
        },
      })),
    );
    graph.endBatch();
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
    let cancelled = false;
    if (onMeasurement)
      void (async () => {
        const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await frame();
        await frame();
        const initial = performance.now() - measureStart,
          latencies: number[] = [];
        for (let i = 0; i < 20 && !cancelled; i++) {
          const start = performance.now();
          graph.panBy({ x: i % 2 ? 2 : -2, y: 0 });
          await frame();
          latencies.push(performance.now() - start);
        }
        if (!cancelled)
          onMeasurement({
            nodes: graph.nodes().length,
            initial_render_ms: initial,
            pan_frame_ms: latencies,
            js_heap_bytes:
              (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
                ?.usedJSHeapSize ?? null,
          });
      })();
    return () => {
      cancelled = true;
    };
  }, [
    filtered,
    liveEdges,
    fields,
    ready,
    colors,
    preview,
    visibleStatements,
    onMeasurement,
    layer,
  ]);
  return (
    <div className={`atlas ${preview ? 'atlas-preview' : ''}`}>
      {!preview && mathematical.length ? (
        <div className="atlas-toolbar">
          <label>
            Graph layer{' '}
            <select
              aria-label="Graph layer"
              value={layer}
              onChange={(e) => setLayer(e.target.value)}
            >
              <option value="navigation">Subject navigation</option>
              <option value="logic">Mathematical logic</option>
              <option value="special_cases">Conjectures & special cases</option>
              <option value="research_evidence">Research evidence</option>
            </select>
          </label>
          <label className="edge-toggle">
            <input
              type="checkbox"
              checked={candidates}
              onChange={(e) => setCandidates(e.target.checked)}
            />
            Show unverified candidates
          </label>
          <span className="small muted">
            Solid green: verified · Dashed amber: candidate · Diamond: source statement
          </span>
        </div>
      ) : null}
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
          data-ready={Boolean(ready)}
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
            {selectedStatement && selectedStatement.parent_id === selectedVisible.id ? (
              <p>
                Source statement node: {selectedStatement.title}. Unverified; not counted as a
                separate problem.{' '}
                <a href={selectedStatement.url} target="_blank" rel="noreferrer">
                  Inspect source ↗
                </a>
              </p>
            ) : null}
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
          {filtered.length + visibleStatements.length} nodes · {liveEdges.length} links
        </span>
      </div>
      {!preview ? (
        <>
          <p className="graph-disclaimer">
            Gray dashed links are <strong>unverified subject associations</strong>. Amber dashed
            links are mathematical candidates; green solid links require verification receipts.
            Source declaration diamonds are variants, not additional catalog problems.
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
