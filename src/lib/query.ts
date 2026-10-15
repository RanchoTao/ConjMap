import type { Problem } from './schema';
export type Filters = {
  q?: string;
  field?: string;
  status?: string;
  review?: string;
  sort?: string;
};
export function queryProblems(problems: Problem[], filters: Filters) {
  const query = (filters.q ?? '').trim().toLowerCase();
  const result = problems.filter(
    (p) =>
      (!query ||
        [p.title, p.id, p.statement, ...p.aliases, ...p.MSC]
          .join(' ')
          .toLowerCase()
          .includes(query)) &&
      (!filters.field || p.field === filters.field) &&
      (!filters.status || p.status === filters.status) &&
      (!filters.review || p.review_status === filters.review),
  );
  return result.sort((a, b) =>
    filters.sort === 'title-desc'
      ? b.title.localeCompare(a.title)
      : filters.sort === 'field'
        ? a.field.localeCompare(b.field) || a.title.localeCompare(b.title)
        : filters.sort === 'status'
          ? a.status.localeCompare(b.status) || a.title.localeCompare(b.title)
          : a.title.localeCompare(b.title),
  );
}
