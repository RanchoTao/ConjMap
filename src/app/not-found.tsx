import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="page-wrap empty-state">
      <span className="eyebrow">404 / BEYOND THIS MAP</span>
      <h1>This problem isn’t indexed.</h1>
      <p>The canonical ID may have changed, or this question has yet to be added.</p>
      <Link className="button primary" href="/problems">
        Back to the problem index
      </Link>
    </div>
  );
}
