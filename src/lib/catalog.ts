import rawProblems from '../../data/problems.json';
import rawRelationships from '../../data/relationships.json';
import manifest from '../../data/manifest.json';
import { validateCatalog } from './schema';
import registry from '../../data/v02/id-registry.json';
import sourceRecords from '../../data/v02/source-records.json';

const ids: Record<string, string> = registry;
const migrated = rawProblems.map((p) => ({
  ...p,
  id: ids[p.id],
  aliases: [...p.aliases, p.id],
  source_mappings: [
    ...p.source_mappings,
    ...sourceRecords
      .filter((r) => r.legacy_problem_id === p.id)
      .map((r) => ({ source_id: r.source_id, external_id: r.external_id, url: r.url })),
  ],
}));
const migratedEdges = rawRelationships.map((r) => ({
  ...r,
  source_id: ids[r.source_id],
  target_id: ids[r.target_id],
}));

export const { problems, relationships } = validateCatalog(migrated, migratedEdges);
export { manifest };
export const fields = [...new Set(problems.map((p) => p.field))].sort();
export const getProblem = (id: string) =>
  problems.find((p) => p.id === id || p.aliases.some((a) => a.toLowerCase() === id.toLowerCase()));
export const fieldColors: Record<string, string> = {
  'Number theory': '#ef9568',
  Combinatorics: '#6fc8c0',
  Algebra: '#a79ce8',
  'Geometry & topology': '#80afe5',
  Analysis: '#d7bd6e',
  'Logic & foundations': '#cb98b4',
  Probability: '#a1c882',
};
