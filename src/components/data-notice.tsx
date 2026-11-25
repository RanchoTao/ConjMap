import { T } from '@/components/i18n';
import manifest from '../../data/manifest.json';

const UPSTREAM = 'https://github.com/google-deepmind/formal-conjectures';
const ERDOS = 'https://github.com/teorth/erdosproblems';

// Shown on every page: where the data comes from and that nothing has been independently checked.
export function DataNotice() {
  return (
    <div className="data-notice" role="note" data-testid="data-notice">
      <div className="data-notice-inner">
        <strong>
          <T en="Not independently verified." zh="未独立核实。" />
        </strong>{' '}
        <T en="Problem statements are imported from" zh="问题陈述导入自" />{' '}
        <a href={UPSTREAM} target="_blank" rel="noreferrer">
          google-deepmind/formal-conjectures
        </a>{' '}
        <T en={`(snapshot ${manifest.retrieved_at}, Apache-2.0); Erdős metadata from`} zh={`（${manifest.retrieved_at} 快照，Apache-2.0）；Erdős 元数据来自`} />{' '}
        <a href={ERDOS} target="_blank" rel="noreferrer">
          teorth/erdosproblems
        </a>
        <T
          en=". Every status is unknown and every relationship is an unreviewed navigation aid."
          zh="。所有问题状态均为未知，所有关联均为未经审阅的导航线索。"
        />
      </div>
    </div>
  );
}
