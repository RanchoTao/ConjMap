import summary from '../../docs/evidence/v04-real-run/mf-audit-86c955e76307455994ecb1b84c74a81d/SUMMARY.json';
import { T } from './i18n';
const evidence =
  'https://github.com/RanchoTao/ConjMap/tree/2d75b06233dc142535695640545c3309fbc6ccf4/docs/evidence/v04-real-run/' +
  summary.real_engine_task_id;

export function ArchivedRunPanel({ problemId }: { problemId: string }) {
  if (problemId !== summary.problem_id) return null;
  return (
    <section className="paper-panel" data-testid="archived-real-run">
      <div className="eyebrow">
        <T en="V0.4 / ARCHIVED ACTUAL EXECUTION" zh="V0.4 / 已归档的真实执行" />
      </div>
      <h2>
        <T en="One bounded run, with its evidence." zh="一次受限真实运行及其证据。" />
      </h2>
      <p>
        <strong>REAL_RUN · COMPLETED</strong> · {summary.captured_at}
      </p>
      <p>
        <T
          en="MathForge checked the source-bound Fin 2 frequency calibration: 16 families examined, 13 applicable. This is a known finite case, not a proof of the general conjecture."
          zh="MathForge 实际核查了绑定来源的 Fin 2 频率校准：检查 16 个集合族，其中 13 个适用。这是已知有限情形，不是一般猜想的证明。"
        />
      </p>
      <p className="muted small">
        <T en="Engine task ID" zh="引擎任务 ID" />:{' '}
        <code style={{ overflowWrap: 'anywhere' }}>{summary.real_engine_task_id}</code>
      </p>
      <dl className="evidence-dimensions">
        <div>
          <dt>
            <T en="WALL / CPU" zh="墙钟 / CPU" />
          </dt>
          <dd>
            {summary.resources.wall_seconds.toFixed(3)} s /{' '}
            {summary.resources.cpu_seconds.toFixed(3)} s
          </dd>
        </div>
        <div>
          <dt>
            <T en="PEAK JOB MEMORY" zh="Job 峰值内存" />
          </dt>
          <dd>{(summary.resources.peak_job_bytes / 1024 / 1024).toFixed(2)} MiB</dd>
        </div>
        <div>
          <dt>
            <T en="SCIENTIFIC STATUS" zh="数学证据状态" />
          </dt>
          <dd>
            <T en="unverified · catalog unknown" zh="未核验 · 问题状态未知" />
          </dd>
        </div>
      </dl>
      <p className="muted small">
        <T
          en="This immutable snapshot was authenticated at capture and checked after reload. Public browsing checks archive hashes; the owner-local HMAC secret is not published. A live journal displaying the same task ID is the same run, not another result."
          zh="此固定快照在采集时完成认证，并通过重载检查。公开浏览可核对归档哈希；本地 HMAC 密钥不公开。实时日志中相同任务 ID 对应同一次运行，不另行计数。"
        />
      </p>
      <a className="text-link" href={evidence} target="_blank" rel="noreferrer">
        <T
          en="Inspect receipt, actual logs and finite table ↗"
          zh="查看回执、真实日志及有限结果表 ↗"
        />
      </a>
    </section>
  );
}
