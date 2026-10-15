import { T } from './i18n';
export function Badge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}
export function EvidenceNote({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`evidence-note ${compact ? 'compact' : ''}`}>
      <span className="note-symbol">◇</span>
      <div>
        <strong><T en="Evidence before certainty." /></strong>{' '}
        {compact ? (
          <T en="Imported statements and discovery links are unverified." />
        ) : (
          <T en="Source-reported open problems are indexed here. Imported statements and associations await independent review; ConjMap records their mathematical status as unknown." />
        )}
      </div>
    </div>
  );
}
