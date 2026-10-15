import rawProblems from '../../data/problems.json';
import rawRelationships from '../../data/relationships.json';
import manifest from '../../data/manifest.json';
import { validateCatalog } from './schema';

export const { problems, relationships } = validateCatalog(rawProblems, rawRelationships);
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
