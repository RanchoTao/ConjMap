'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import type { FrontierRecord } from '@/lib/frontier';
import { T, useLanguage } from './i18n';

const PAGE_SIZE = 24;
function title(row: FrontierRecord, language: 'en' | 'zh') {
  return language === 'zh' ? `厄尔多斯问题 ${row.external_id}` : row.title;
}
export function FrontierExplorer({ records }: { records: FrontierRecord[] }) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [field, setField] = useState('');
  const [linkage, setLinkage] = useState('all');
  const [page, setPage] = useState(1);
  const fields = useMemo(() => [...new Set(records.map((r) => r.field))].sort(), [records]);
  const filtered = useMemo(() => {
    const q = query.toLocaleLowerCase().trim();
    const candidates = records.filter((r) =>
      (!field || r.field === field) &&
      (linkage === 'all' || (linkage === 'matched' ? Boolean(r.matched_problem_id) : !r.matched_problem_id))
    );
    if (!q) return candidates;
    // Exact IDs and full titles win over prefix matches (Erdős 10 vs 102/1029).
    const exact = candidates.filter((r) =>
      [r.id, r.title, title(r, 'zh'), r.external_id].some(
        value => value.toLocaleLowerCase() === q,
      )
    );
    if (exact.length) return exact;
    return candidates.filter((r) => [r.title, title(r, 'zh'), r.external_id, r.field, ...r.tags]
      .join(' ').toLocaleLowerCase().includes(q));
  }, [records, query, field, linkage]);
  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, maxPage);
  const displayed = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function change(fn: () => void) { fn(); setPage(1); }
  return (
    <section className="frontier-index" aria-label="Source-reported open problem index">
      <div className="frontier-controls">
        <label>
          <span><T en="Search source index" zh="搜索来源索引" /></span>
          <div className="search-input">
            <Search size={16} />
            <input aria-label="Search source index" value={query}
              placeholder={language === 'zh' ? '编号、领域、标签……' : 'Number, field, topic…'}
              onChange={e => change(() => setQuery(e.target.value))} />
          </div>
        </label>
        <label><span><T en="Mathematical field" zh="数学领域" /></span>
          <select aria-label="Source index field" value={field}
            onChange={e => change(() => setField(e.target.value))}>
            <option value=""><T en="All fields" zh="全部领域" /></option>
            {fields.map(f => <option value={f} key={f}><T en={f} /></option>)}
          </select>
        </label>
        <label><span><T en="Catalog linkage" zh="与原有档案的关联" /></span>
          <select aria-label="Catalog linkage" value={linkage}
            onChange={e => change(() => setLinkage(e.target.value))}>
            <option value="all"><T en="All source records" zh="全部来源记录" /></option>
            <option value="unmatched"><T en="No ID match yet" zh="尚无编号匹配" /></option>
            <option value="matched"><T en="Linked to full dossier" zh="已有完整档案" /></option>
          </select>
        </label>
      </div>
      <p className="muted small">
        {filtered.length} <T en="source-reported open records; every status is unverified." zh="条来源标为未解决的记录；所有状态均未经独立核验。" />
      </p>
      <div className="frontier-cards">
        {displayed.map(row => (
          <article key={row.id} className="frontier-item">
            <div className="frontier-item-header">
              <span className="mono dim">{row.id}</span>
              <span className="badge badge-amber"><T en="Source says open" zh="来源标注未解决" /></span>
            </div>
            <h3>{title(row, language)}</h3>
            <p className="muted small"><T en={row.field} /> · {row.tags.slice(0, 3).join(' · ')}</p>
            <p className="muted small">
              <T en="Status last updated" zh="来源状态更新" />: {row.source_status_updated ?? '—'}
              {' · '}<T en="Math status: unknown" zh="独立数学状态：未知" />
            </p>
            <div className="frontier-item-links">
              {row.matched_problem_id ? (
                <Link className="text-link" href={`/problems/${row.matched_problem_id}`}>
                  <T en="Open existing dossier" zh="查看已有档案" /> <ArrowUpRight size={13} />
                </Link>
              ) : (
                <span className="muted small"><T en="Metadata only · no vetted statement" zh="仅有元数据 · 尚无审查后的数学陈述" /></span>
              )}
              <a className="text-link" href={row.source_url} target="_blank" rel="noreferrer">
                <T en="Original problem" zh="原始问题" /> <ArrowUpRight size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="muted"><T en="No source records match those filters." zh="没有符合条件的来源记录。" /></p>
      ) : (
        <div className="pagination">
          <span><T en="Showing" zh="显示" /> {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
            {' / '}{filtered.length}</span>
          <div>
            <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              <T en="Previous" zh="上一页" />
            </button>
            <span>{currentPage} / {maxPage}</span>
            <button disabled={currentPage >= maxPage} onClick={() => setPage(currentPage + 1)}>
              <T en="Next" zh="下一页" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
