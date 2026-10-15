'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-wrap empty-state">
      <h1>This view could not load.</h1>
      <p>Your source catalog is unchanged. Retry this view or return to the problem index.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
