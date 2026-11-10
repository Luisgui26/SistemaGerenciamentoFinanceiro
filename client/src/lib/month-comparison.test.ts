import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compareMonths,
  comparisonChange,
  type ComparisonFilters,
} from './month-comparison';
import type { Transaction } from './demo-finance';

const items: Transaction[] = [
  {
    id: 'a',
    description: 'Salário',
    category: 'Salário',
    type: 'income',
    cents: 100000,
    date: '2025-12-05',
  },
  {
    id: 'b',
    description: 'Supermercado',
    category: 'Alimentação',
    type: 'expense',
    cents: 100,
    date: '2025-12-10',
  },
  {
    id: 'c',
    description: 'supermercado',
    category: 'Alimentação',
    type: 'expense',
    cents: 200,
    date: '2025-12-20',
  },
  {
    id: 'd',
    description: 'Aluguel',
    category: 'Moradia',
    type: 'expense',
    cents: 30000,
    date: '2025-12-08',
  },
  {
    id: 'e',
    description: 'Salário',
    category: 'Salário',
    type: 'income',
    cents: 120000,
    date: '2026-02-05',
  },
  {
    id: 'f',
    description: 'Supermercado',
    category: 'Alimentação',
    type: 'expense',
    cents: 500,
    date: '2026-02-10',
  },
  {
    id: 'g',
    description: 'Farmácia',
    category: 'Saúde',
    type: 'expense',
    cents: 1000,
    date: '2026-02-15',
  },
  {
    id: 'h',
    description: 'Outro mês',
    category: 'Outros',
    type: 'expense',
    cents: 99999,
    date: '2026-01-05',
  },
];
const filters: ComparisonFilters = {
  type: 'expense',
  category: 'all',
  query: '',
  groupBy: 'category',
};

test('compara meses não consecutivos de anos diferentes sem incluir outros períodos', () => {
  const result = compareMonths(items, '2025-12', '2026-02', filters);
  assert.deepEqual(result.reference, {
    income: 100000,
    expense: 30300,
    count: 4,
  });
  assert.deepEqual(result.compared, {
    income: 120000,
    expense: 1500,
    count: 3,
  });
  assert.equal(result.filteredReference, 30300);
  assert.equal(result.filteredCompared, 1500);
  assert.equal(
    result.rows.find((row) => row.category === 'Moradia')?.compared,
    0,
  );
});
test('filtra e soma gastos específicos sem alterar o resumo geral', () => {
  const result = compareMonths(items, '2025-12', '2026-02', {
    ...filters,
    category: 'Alimentação',
    query: ' SUPERMERCADO ',
    groupBy: 'description',
  });
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0]?.reference, 300);
  assert.equal(result.rows[0]?.compared, 500);
  assert.equal(result.rows[0]?.referenceCount, 2);
  assert.equal(result.reference.expense, 30300);
  assert.deepEqual(comparisonChange(300, 500), {
    difference: 200,
    percentage: 66.7,
  });
});
test('busca sem acentos, filtra receitas e mantém descrições de categorias distintas separadas', () => {
  const result = compareMonths(items, '2025-12', '2026-02', {
    ...filters,
    type: 'income',
    query: 'salario',
    groupBy: 'description',
  });
  assert.equal(result.rows.length, 1);
  assert.equal(result.filteredReference, 100000);
  assert.equal(result.filteredCompared, 120000);
  const distinct = compareMonths(
    [
      ...items,
      {
        id: 'i',
        description: 'Supermercado',
        category: 'Outros',
        type: 'expense',
        cents: 500,
        date: '2026-02-10',
      },
    ],
    '2025-12',
    '2026-02',
    { ...filters, query: 'supermercado', groupBy: 'description' },
  );
  assert.equal(distinct.rows.length, 2);
});
test('lida com zero, períodos vazios e o mesmo mês sem duplicar valores', () => {
  assert.deepEqual(comparisonChange(0, 500), {
    difference: 500,
    percentage: null,
  });
  assert.deepEqual(comparisonChange(0, 0), { difference: 0, percentage: 0 });
  assert.deepEqual(comparisonChange(500, 0), {
    difference: -500,
    percentage: -100,
  });
  const same = compareMonths(items, '2025-12', '2025-12', filters);
  assert.equal(same.filteredReference, same.filteredCompared);
  assert.equal(same.filteredReference, 30300);
  const empty = compareMonths(items, '2020-01', '2020-02', filters);
  assert.deepEqual(empty.rows, []);
  assert.equal(empty.reference.count, 0);
  assert.equal(empty.compared.count, 0);
});
