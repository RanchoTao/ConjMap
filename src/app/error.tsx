'use client';
import { T } from '@/components/i18n';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-wrap empty-state">
      <h1><T en="This view could not load." /></h1>
      <p><T en="Your source catalog is unchanged. Retry this view or return to the problem index." /></p>
      <button onClick={reset}><T en="Try again" /></button>
    </div>
  );
}
