import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'About the project' };
export default function About() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow">MAPPING THE FRONTIERS OF MATHEMATICS</div>
        <h1>
          An atlas for the questions ahead<span className="title-period">.</span>
        </h1>
        <p>
          ConjMap is open research infrastructure for finding problems and following their evidence.
        </p>
      </div>
      <div className="about-layout">
        <div className="about-content">
          <section>
            <h2>A shared map, with clear boundaries.</h2>
            <p>
              Mathematical problems are scattered across papers, workshop lists, and research
              communities. ConjMap makes a bounded collection searchable and explorable, preserving
              the path back to its sources.
            </p>
            <p>
              Math-CS-AI Atlas organizes learning and knowledge. ConjMap organizes open problems and
              research frontiers. MathForge will execute mathematical research and verification.
              Each project has a separate responsibility.
            </p>
            <div className="prose-banner">
              ConjMap does not execute proofs, search for solutions, or certify mathematical
              progress. The task adapter in V0.1 is a local mock.
            </div>
          </section>
          <section>
            <h2>Small pieces, explicit contracts.</h2>
            <div
              className="architecture-diagram"
              aria-label="Architecture: licensed source snapshot to validated catalog to interface and independent research adapter"
            >
              <div>
                Licensed, pinned source snapshot
                <small>Python adapter · attribution · immutable file hashes</small>
              </div>
              <span>↓</span>
              <div>
                Validated, canonical problem catalog
                <small>Zod contracts · duplicate and reference checks · JSON storage</small>
              </div>
              <span>↓</span>
              <div>
                Atlas, problem index & evidence pages
                <small>Next.js · TypeScript · Cytoscape.js · KaTeX</small>
              </div>
              <span>↕</span>
              <div>
                Research Task API v1
                <small>Independent adapter interface · local durable mock journal</small>
              </div>
            </div>
            <p>
              The local version needs no external credentials. Source snapshots ship in the
              repository. A storage interface separates research tasks from the website; a
              documented relational model provides a future path to PostgreSQL.
            </p>
          </section>
          <section>
            <h2>Contribute something checkable.</h2>
            <ul>
              <li>
                Provide a precise problem statement, stable references, and an explicit reuse
                license.
              </li>
              <li>
                Propose aliases or canonical mappings when a problem appears in several collections.
              </li>
              <li>Attach evidence to every claimed relationship and status update.</li>
              <li>Distinguish an attempted proof from an independently checked result.</li>
              <li>
                Report failure routes and corrections with their scope and assumptions intact.
              </li>
            </ul>
            <p>
              Read{' '}
              <a href="https://github.com/RanchoTao/ConjMap/blob/main/CONTRIBUTING.md">
                CONTRIBUTING
              </a>{' '}
              and the{' '}
              <a href="https://github.com/RanchoTao/ConjMap/blob/main/docs/data-contract.md">
                data contract
              </a>{' '}
              before submitting a change.
            </p>
          </section>
          <section>
            <h2>What this first map can establish.</h2>
            <p>
              V0.1 indexes 120 actual source statements from six broad fields. Every record links to
              a pinned upstream theorem and preserves its original file. All automatic extractions
              remain unverified, and all independent mathematical statuses are unknown. Difficulty
              and historical attribution are left unknown where the adapter does not establish them.
            </p>
            <p>
              The 82 graph links represent shared subject tags. They are navigation aids awaiting
              review. No implication or equivalence is established. There are no real MathForge
              runs, no independent Lean checks, and no claim that this catalog is complete or
              current literature.
            </p>
            <p>
              See the <Link href="/sources">source audit and permissions</Link> for the exact scope
              of this snapshot.
            </p>
          </section>
        </div>
        <aside>
          <div className="aside-panel">
            <div className="eyebrow">PROJECT NOTES</div>
            <dl>
              <div>
                <dt>Version</dt>
                <dd>0.1.0 · Local edition</dd>
              </div>
              <div>
                <dt>License decision</dt>
                <dd>
                  Apache-2.0 for code and original project material; upstream and third-party rights
                  retained.
                </dd>
              </div>
              <div>
                <dt>Independent verification</dt>
                <dd>Pending for all imported content</dd>
              </div>
              <div>
                <dt>Development</dt>
                <dd>
                  <code>npm run dev</code>
                </dd>
              </div>
              <div>
                <dt>Repository</dt>
                <dd>
                  <a className="text-link" href="https://github.com/RanchoTao/ConjMap">
                    RanchoTao / ConjMap ↗
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
