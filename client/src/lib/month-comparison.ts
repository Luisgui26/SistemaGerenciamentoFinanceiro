import { totals, type Transaction } from './demo-finance';

export type ComparisonFilters = {
  type: Transaction['type'];
  category: string;
  query: string;
  groupBy: 'category' | 'description';
};
export type ComparisonRow = {
  key: string;
  label: string;
  category: string;
  reference: number;
  compared: number;
  referenceCount: number;
  comparedCount: number;
};
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}
export function comparisonChange(reference: number, compared: number) {
  const difference = compared - reference;
  return {
    difference,
    percentage:
      reference === 0
        ? compared === 0
          ? 0
          : null
        : Math.round((difference / Math.abs(reference)) * 1000) / 10,
  };
}
export function compareMonths(
  items: Transaction[],
  referenceMonth: string,
  comparedMonth: string,
  filters: ComparisonFilters,
) {
  const referenceItems = items.filter(
    (item) => item.date.slice(0, 7) === referenceMonth,
  );
  const comparedItems = items.filter(
    (item) => item.date.slice(0, 7) === comparedMonth,
  );
  const rows = new Map<string, ComparisonRow>();
  const query = normalize(filters.query);
  const add = (item: Transaction, side: 'reference' | 'compared') => {
    if (
      item.type !== filters.type ||
      (filters.category !== 'all' && item.category !== filters.category) ||
      !normalize(`${item.description} ${item.category}`).includes(query)
    )
      return;
    const key =
      filters.groupBy === 'category'
        ? item.category
        : JSON.stringify([item.category, normalize(item.description)]);
    let row = rows.get(key);
    if (!row) {
      row = {
        key,
        label:
          filters.groupBy === 'category' ? item.category : item.description,
        category: item.category,
        reference: 0,
        compared: 0,
        referenceCount: 0,
        comparedCount: 0,
      };
      rows.set(key, row);
    }
    row[side] += item.cents;
    if (side === 'reference') row.referenceCount++;
    else row.comparedCount++;
  };
  referenceItems.forEach((item) => add(item, 'reference'));
  comparedItems.forEach((item) => add(item, 'compared'));
  const sorted = [...rows.values()].sort(
    (a, b) =>
      Math.max(b.reference, b.compared) - Math.max(a.reference, a.compared) ||
      a.label.localeCompare(b.label, 'pt-BR'),
  );
  return {
    reference: { ...totals(referenceItems), count: referenceItems.length },
    compared: { ...totals(comparedItems), count: comparedItems.length },
    rows: sorted,
    filteredReference: sorted.reduce((sum, row) => sum + row.reference, 0),
    filteredCompared: sorted.reduce((sum, row) => sum + row.compared, 0),
  };
}
