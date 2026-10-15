import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { FrontierExplorer } from '@/components/frontier-explorer';
import { T } from '@/components/i18n';
import { frontierIndex, frontierStats } from '@/lib/frontier';

export const metadata: Metadata = {
  title: 'Open problem source index',
  description: 'Source-reported open mathematics problems with exact provenance; not mathematical certification.',
};
export default function FrontierPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow"><T en="THE OPEN PROBLEMS FRONTIER" zh="全球数学开放问题索引" /></div>
        <h1><T en="Beyond the first 120." zh="走出最初的 120 道题。" /></h1>
        <p><T en="Explore source-reported unsolved questions without confusing indexing with mathematical verification."
          zh="持续收录公开提出的数学开放问题，但严格区分资料索引与独立数学核验。" /></p>
      </div>
      <div className="source-summary">
        <div><strong>{frontierStats.sourceReportedOpen}</strong>
          <small><T en="Erdős source-reported open" zh="Erdős 来源标注未解决" /></small></div>
        <div><strong>{frontierStats.unmatchedCandidates}</strong>
          <small><T en="Not yet matched by numbered identity" zh="尚未按编号匹配的候选" /></small></div>
        <div><strong>{frontierStats.matchedCanonical}</strong>
          <small><T en="Linked to existing 120 dossiers" zh="已关联原有 120 份档案" /></small></div>
      </div>
      <div className="prose-banner">
        <strong><T en="Evidence boundary:" zh="证据边界：" /></strong>{' '}
        <T en="These are licensed, version-pinned metadata records; not 589 independently checked or necessarily distinct mathematical conjectures. Full statements remain on the originating website and may have stronger, weaker or solved variants. All mathematical statuses stay unknown."
          zh="这些是有许可证、固定版本的来源元数据，不代表 589 道已经独立核验或数学上互异的猜想。完整陈述仍需查看原站；可能存在更强、更弱或已解决的变体。所有独立数学状态保持未知。" />
      </div>
      <p className="muted small" style={{marginTop:16,marginBottom:20}}>
        <T en="The original 120 full dossiers remain available separately in"
          zh="原有 120 份完整来源档案仍可从" />{' '}
        <Link className="text-link" href="/problems"><T en="Problems" zh="问题列表" /> <ArrowUpRight size={13} /></Link>
        {' · '}
        <a className="text-link" target="_blank" rel="noreferrer"
          href="https://github.com/teorth/erdosproblems"><T en="Data attribution" zh="数据来源与署名" /> <ArrowUpRight size={13} /></a>
      </p>
      <FrontierExplorer records={frontierIndex} />
    </div>
  );
}
