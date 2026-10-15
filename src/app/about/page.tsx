import Link from 'next/link';
import { T } from '@/components/i18n';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'About the project' };
export default function About() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow"><T en="MAPPING THE FRONTIERS OF MATHEMATICS" /></div>
        <h1>
          An atlas for the questions ahead<span className="title-period">.</span>
        </h1>
        <p>
          <T en="ConjMap is open research infrastructure for finding problems and following their evidence." />
        </p>
      </div>
      <div className="about-layout">
        <div className="about-content">
          <section>
            <h2><T en="A shared map, with clear boundaries." /></h2>
            <p>
              <T en="Mathematical problems are scattered across papers, workshop lists, and research communities. ConjMap makes a bounded collection searchable and explorable, preserving the path back to its sources." zh="数学开放问题散见于论文、研讨会问题列表和研究社区。ConjMap 让有明确边界的问题集合可以检索、浏览和追溯至原始出处。" />
            </p>
            <p>
              <T en="Math-CS-AI Atlas organizes learning and knowledge. ConjMap organizes open problems and research frontiers. MathForge will execute mathematical research and verification. Each project has a separate responsibility." zh="Math-CS-AI Atlas 组织学习与知识，ConjMap 组织未解问题与研究前沿，MathForge 负责数学研究与核验。三个项目职责分离。" />
            </p>
            <div className="prose-banner">
              <T en="ConjMap does not execute proofs, search for solutions, or certify mathematical progress. The task adapter in V0.1 is a local mock." zh="ConjMap 本身不执行证明、不搜索解答，也不认证数学研究成果。早期任务适配器仅用于本地模拟。" />
            </div>
          </section>
          <section>
            <h2><T en="Small pieces, explicit contracts." /></h2>
            <div
              className="architecture-diagram"
              aria-label="Architecture: licensed source snapshot to validated catalog to interface and independent research adapter"
            >
              <div>
                <T en="Licensed, pinned source snapshot" zh="有许可证与固定版本的来源快照" />
                <small><T en="Python adapter · attribution · immutable file hashes" zh="Python 适配器 · 作者署名 · 文件哈希" /></small>
              </div>
              <span>↓</span>
              <div>
                <T en="Validated, canonical problem catalog" zh="完成数据校验的问题目录" />
                <small><T en="Zod contracts · duplicate and reference checks · JSON storage" zh="Zod 数据规范 · 去重与引用检查 · JSON 存储" /></small>
              </div>
              <span>↓</span>
              <div>
                <T en="Atlas, problem index & evidence pages" zh="交互图谱、问题索引与证据页面" />
                <small>Next.js · TypeScript · Cytoscape.js · KaTeX</small>
              </div>
              <span>↕</span>
              <div>
                <T en="Research Task API v1" zh="研究任务 API v1" />
                <small><T en="Independent adapter interface · local durable mock journal" zh="独立适配器接口 · 本地模拟任务日志" /></small>
              </div>
            </div>
            <p>
              <T en="The local version needs no external credentials. Source snapshots ship in the repository. A storage interface separates research tasks from the website; a documented relational model provides a future path to PostgreSQL." zh="本地版本不需要外部凭据，来源快照随仓库提供。存储接口隔离研究任务与网站，关系数据库模型为日后接入 PostgreSQL 提供基础。" />
            </p>
          </section>
          <section>
            <h2><T en="Contribute something checkable." /></h2>
            <ul>
              <li>
                <T en="Provide a precise problem statement, stable references, and an explicit reuse license." zh="提供精确的问题陈述、稳定的文献链接与明确的复用许可。" />
              </li>
              <li>
                <T en="Propose aliases or canonical mappings when a problem appears in several collections." zh="当同一问题出现在不同集合中时，提供别名或规范化对应关系。" />
              </li>
              <li><T en="Attach evidence to every claimed relationship and status update." zh="为每一条数学关系声明和状态变更提供证据。" /></li>
              <li><T en="Distinguish an attempted proof from an independently checked result." zh="严格区分候选证明与已独立核验的结果。" /></li>
              <li>
                <T en="Report failure routes and corrections with their scope and assumptions intact." zh="报告失败路线和修正时保留适用范围与假设。" />
              </li>
            </ul>
            <p>
              <T en="Read" zh="请阅读" />{' '}
              <a href="https://github.com/RanchoTao/ConjMap/blob/main/CONTRIBUTING.md">
                CONTRIBUTING
              </a>{' '}
              <T en="and the" zh="以及" />{' '}
              <a href="https://github.com/RanchoTao/ConjMap/blob/main/docs/data-contract.md">
                data contract
              </a>{' '}
              <T en="before submitting a change." zh="后再提交更改。" />
            </p>
          </section>
          <section>
            <h2><T en="What this first map can establish." /></h2>
            <p>
              <T en="V0.2 preserves 120 actual source statements from six broad fields, with 32 independently curated metadata observations linked from a second source. Every record links to a pinned upstream theorem and preserves its original file. All automatic extractions remain unverified, and all independent mathematical statuses are unknown. Difficulty and historical attribution are left unknown where the adapter does not establish them." zh="V0.2 保留六大领域的 120 条来源陈述，并关联来自第二来源的 32 条元数据观察。所有记录都链接到固定版本的上游定理，并保存原始文件。自动导入内容均未独立核验，数学状态全部标记为未知；难度与历史归属缺乏证据时不作推断。" />
            </p>
            <p>
              <T en="The 82 graph links represent shared subject tags. They are navigation aids awaiting review. No implication or equivalence is established. There are no real MathForge runs, no independent Lean checks, and no claim that this catalog is complete or current literature." zh="82 条图谱关联由共享学科标签生成，仅供导航，尚未证实数学蕴含或等价关系。平台目前没有真实 MathForge 运行、独立 Lean 核验，也不声称目录已覆盖全部或最新文献。" />
            </p>
            <p>
              <T en="Thirty scoped V0.2 dossiers and twelve substantive relationship candidates are available for review. They remain partial and unverified. The real adapter has authenticated transport, signed callbacks, quota and idempotency contracts; actual MathForge execution is blocked because a compatible source-bound task API is not configured." zh="当前有 30 份部分审查档案和 12 条数学关系候选，均未完成核验。真实接口已定义认证、签名回调、配额和幂等规范，但因缺少符合来源约束的引擎 API，实际 MathForge 研究仍受阻。" />
            </p>
            <p>
              <T en="See the" zh="详见" /> <Link href="/sources"><T en="source audit and permissions" zh="来源审计与使用许可" /></Link> <T en="for the exact scope of this snapshot." zh="，了解本次数据快照的准确范围。" />
            </p>
          </section>
        </div>
        <aside>
          <div className="aside-panel">
            <div className="eyebrow"><T en="PROJECT NOTES" /></div>
            <dl>
              <div>
                <dt><T en="Version" /></dt>
                <dd>0.2.0 · <T en="Local edition" zh="本地／公开只读版本" /></dd>
              </div>
              <div>
                <dt><T en="License decision" /></dt>
                <dd>
                  <T en="Apache-2.0 for code and original project material; upstream and third-party rights retained." zh="代码和原创内容采用 Apache-2.0；保留上游与第三方的原有权利。" />
                </dd>
              </div>
              <div>
                <dt><T en="Independent verification" /></dt>
                <dd><T en="Pending for all imported content" /></dd>
              </div>
              <div>
                <dt><T en="Development" /></dt>
                <dd>
                  <code>npm run dev</code>
                </dd>
              </div>
              <div>
                <dt><T en="Repository" /></dt>
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
