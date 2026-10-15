'use client';
import Link from 'next/link';
import { T, ProblemName, problemTitle, useLanguage, translate } from './i18n';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { queryProblems, type Filters } from '@/lib/query';
import type { Problem } from '@/lib/schema';
import { Badge } from './status';

export function ProblemExplorer({
  problems,
  fields,
  initial,
}: {
  problems: Problem[];
  fields: string[];
  initial: Filters;
}) {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<Filters>(initial);
  const [page, setPage] = useState(1);
  useEffect(() => {
    // Read client-only URL parameters after hydration; GitHub Pages has no request server.
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const fromUrl: Filters = {};
      for (const k of ['q', 'field', 'status', 'sort'] as const) {
        const value = params.get(k);
        if (value) fromUrl[k] = value;
      }
      setFilters(fromUrl);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const results = useMemo(() => {
    if (language !== 'zh' || !filters.q?.trim()) return queryProblems(problems, filters);
    const plain = queryProblems(problems, { ...filters, q: '' });
    const englishIds = new Set(queryProblems(problems, filters).map((p) => p.id));
    const q = filters.q.toLocaleLowerCase();
    return plain.filter((p) =>
      englishIds.has(p.id) || problemTitle(p.title, 'zh').toLocaleLowerCase().includes(q),
    );
  }, [problems, filters, language]);
  function update(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(1);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
    window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`);
  }
  return (
    <>
      <div className="explorer-toolbar">
        <label className="search-input">
          <Search size={18} />
          <input
            aria-label="Search problems"
            placeholder={translate("Search problems, statements, aliases, MSC…", language)}
            value={filters.q ?? ''}
            onChange={(e) => update('q', e.target.value)}
          />
          {filters.q ? (
            <button aria-label="Clear search" onClick={() => update('q', '')}>
              <X size={15} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </label>
        <label className="select-label">
          <SlidersHorizontal size={15} />
          <select
            aria-label="Filter by field"
            value={filters.field ?? ''}
            onChange={(e) => update('field', e.target.value)}
          >
            <option value=""><T en="All fields" /></option>
            {fields.map((f) => (
              <option key={f} value={f}><T en={f} /></option>
            ))}
          </select>
        </label>
        <label className="select-label">
          <select
            aria-label="Filter by status"
            value={filters.status ?? ''}
            onChange={(e) => update('status', e.target.value)}
          >
            <option value=""><T en="All statuses" /></option>
            {['open', 'partially_resolved', 'solved', 'disputed', 'unknown'].map((s) => (
              <option key={s} value={s}>
                <T en={s} />
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="result-meta">
        <span aria-live="polite">
          <strong>{results.length}</strong> <T en="problems found" />{' '}
          <span className="dim">/ {problems.length} <T en="indexed" /></span>
        </span>
        <label className="sort-label">
          <ArrowDownUp size={14} />
          <select
            aria-label="Sort problems"
            value={filters.sort ?? 'title-asc'}
            onChange={(e) => update('sort', e.target.value)}
          >
            <option value="title-asc"><T en="Title: A → Z" /></option>
            <option value="title-desc"><T en="Title: Z → A" /></option>
            <option value="field"><T en="Mathematical field" /></option>
            <option value="status"><T en="Status" /></option>
          </select>
        </label>
      </div>
      <div className="problem-table" role="table" aria-label="Mathematical problems">
        <div className="table-head" role="row">
          <span role="columnheader"><T en="PROBLEM / CANONICAL ID" /></span>
          <span role="columnheader"><T en="FIELD" /></span>
          <span role="columnheader"><T en="STATUS" /></span>
          <span role="columnheader"><T en="EVIDENCE" /></span>
          <span />
        </div>
        {results.slice((page - 1) * 20, page * 20).map((p) => (
          <Link href={`/problems/${p.id}`} key={p.id} className="problem-row" role="row">
            <span role="cell">
              <strong><ProblemName title={p.title} /></strong>
              <small>{p.id}</small>
            </span>
            <span role="cell" className="field-cell">
              <T en={p.field} />
              <small>MSC {p.MSC.join(' · ')}</small>
            </span>
            <span role="cell">
              <Badge><T en={p.status} /></Badge>
            </span>
            <span role="cell">
              <Badge tone="amber"><T en={p.review_status} /></Badge>
            </span>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
      {!results.length ? (
        <div className="empty-state">
          <Search size={26} />
          <h3><T en="No matching problems" /></h3>
          <p>
            <T en="Try a different term or clear the filters. Independent status review is pending for this first collection." />
          </p>
          <button
            onClick={() => {
              setFilters({});
              setPage(1);
              window.history.replaceState(null, '', window.location.pathname);
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="pagination">
          <span>
            <T en="Showing" /> {(page - 1) * 20 + 1}–{Math.min(page * 20, results.length)} <T en="of" zh=" / 共" /> {results.length}
          </span>
          <div>
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              {page} / {Math.ceil(results.length / 20)}
            </span>
            <button disabled={page * 20 >= results.length} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
