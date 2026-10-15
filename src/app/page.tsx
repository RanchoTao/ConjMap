import Link from 'next/link';
import { T, ProblemName } from '@/components/i18n';
import { ArrowRight, ArrowUpRight, BookOpen, GitBranch, Network, ShieldCheck } from 'lucide-react';
import { Atlas } from '@/components/atlas';
import { Badge, EvidenceNote } from '@/components/status';
import { fields, fieldColors, manifest, problems, relationships, getProblem } from '@/lib/catalog';

export default function Home() {
  const featured = [
    'fc-millennium-riemannhypothesis',
    'fc-wikipedia-abc',
    'fc-wikipedia-beckfialaconjecture',
  ]
    .map((id) => getProblem(id))
    .filter((p) => !!p);
  return (
    <div className="page-wrap home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> <T en="AN OPEN MAP OF MATHEMATICAL POSSIBILITY" />
          </div>
          <h1>
            <T en="Every answer begins" />
            <br />
            <em><T en="at the frontier." /></em>
          </h1>
          <p>
            <T en="Explore the questions mathematics has yet to settle." />
            <br className="desktop-break" /> <T en="Follow the connections. Trace the evidence. Find your next problem." />
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/atlas">
              Explore the atlas <ArrowUpRight size={18} />
            </Link>
            <Link className="button secondary" href="/problems">
              Browse problems <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-footnote">
            <GitBranch size={14} /> <T en="Open infrastructure for mathematical discovery" />{' '}
            <span>V0.2 · {process.env.CONJMAP_STATIC_EXPORT === '1' ? <T en="PUBLIC READ-ONLY" /> : <T en="LOCAL EDITION" />}</span>
          </div>
        </div>
        <div className="hero-marginalia">
          <span><T en="THE KNOWN" /></span>
          <svg viewBox="0 0 210 130" fill="none" aria-hidden="true">
            <path
              d="M5 97C35 90 31 25 76 40s38 77 79 37 21-45 49-52"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <circle cx="76" cy="40" r="4" fill="currentColor" />
            <circle cx="155" cy="77" r="4" fill="currentColor" />
          </svg>
          <span><T en="THE STILL POSSIBLE ↗" /></span>
          <small>∂ knowledge</small>
        </div>
      </section>
      <section className="stats-strip" aria-label="Catalog overview">
        {[
          [String(problems.length), 'SOURCE-BACKED PROBLEMS'],
          [String(fields.length), 'MATHEMATICAL FIELDS'],
          [String(relationships.length), 'DISCOVERY ASSOCIATIONS'],
          ['0', 'INDEPENDENTLY VERIFIED'],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>
              {value.padStart(2, '0')}
              <span>{label === 'SOURCE-BACKED PROBLEMS' ? '↗' : ''}</span>
            </strong>
            <small><T en={label} /></small>
          </div>
        ))}
      </section>
      <section className="landscape-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><T en="01 / THE LANDSCAPE" /></div>
            <h2><T en="Ideas don’t live in isolation." /></h2>
          </div>
          <Link href="/atlas" className="text-link">
            Explore all connections <ArrowUpRight size={16} />
          </Link>
        </div>
        <Atlas problems={problems} relationships={relationships} colors={fieldColors} preview />
        <EvidenceNote compact />
      </section>
      <section className="fields-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><T en="02 / FIND YOUR FIELD" /></div>
            <h2><T en="Many disciplines. One frontier." /></h2>
          </div>
          <span className="muted"><T en="Choose a direction to explore." /></span>
        </div>
        <div className="field-grid">
          {fields.map((f, i) => (
            <Link href={`/problems?field=${encodeURIComponent(f)}`} className="field-card" key={f}>
              <span className="field-number">0{i + 1}</span>
              <div className="field-glyph" style={{ color: fieldColors[f] }}>
                {['⊗', '∫', 'Σ', '△', '∀', 'ℙ'][i]}
              </div>
              <h3><T en={f} /></h3>
              <p>
                {problems.filter((p) => p.field === f).length} <T en="problems" zh="个问题" />{' '}
                <span>
                  MSC{' '}
                  {[...new Set(problems.filter((p) => p.field === f).flatMap((p) => p.MSC))]
                    .slice(0, 3)
                    .join(' / ')}
                </span>
              </p>
              <ArrowUpRight className="field-arrow" size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow"><T en="03 / A PLACE TO START" /></div>
            <h2><T en="Questions with a long horizon." /></h2>
          </div>
          <Link href="/problems" className="text-link">
            View the problem index <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="featured-grid">
          {featured.map((p) => (
            <Link className="feature-card" key={p.id} href={`/problems/${p.id}`}>
              <div className="eyebrow" style={{ color: fieldColors[p.field] }}>
                <T en={p.field} />
              </div>
              <h3><ProblemName title={p.title} /></h3>
              <p>{p.statement.replace(/[$*`]/g, '').slice(0, 165)}…</p>
              <div>
                <Badge><T en="status unknown" /></Badge>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="principles">
        <div>
          <ShieldCheck size={22} />
          <h3><T en="Evidence is part of the map." /></h3>
          <p>
            <T en="Every statement links to a pinned source. Retrieval, review, and mathematical verification remain distinct." />
          </p>
        </div>
        <div>
          <Network size={22} />
          <h3><T en="A map built in the open." /></h3>
          <p>
            <T en="Source code, data contracts, and import provenance are inspectable. Better references and corrections are welcome." />
          </p>
        </div>
        <div>
          <BookOpen size={22} />
          <h3><T en="Connected to what comes next." /></h3>
          <p>
            <T en="Separate mock and authenticated real adapters preserve research provenance. The real MathForge connection remains blocked pending a compatible engine API." />
          </p>
        </div>
      </section>
      <div className="collection-note">
        <span className="live-dot" /> <T en="COLLECTION SNAPSHOT" />{' '}
        <span>{manifest.retrieved_at} · Formal Conjectures · Apache-2.0</span>
        <Link href="/sources">
          Read the source audit <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
