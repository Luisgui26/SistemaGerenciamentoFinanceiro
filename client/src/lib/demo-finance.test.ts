import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  monthKey,
  offsetMonth,
  parseAmount,
  sampleTransactions,
  totals,
  upgradeDemoCategories,
  validStored,
} from './demo-finance';
test('valores em reais são convertidos para centavos sem arredondamento', () => {
  assert.equal(parseAmount('0,10'), 10);
  assert.equal(parseAmount('123.4'), 12340);
  for (const value of ['0', '-1', '1,001', '1.000,00', 'abc', ''])
    assert.equal(parseAmount(value), null);
});
test('meses e dados de exemplo permanecem consistentes na virada do ano', () => {
  assert.equal(offsetMonth('2026-01', -1), '2025-12');
  assert.equal(monthKey(new Date(2026, 0, 1)), '2026-01');
  const items = sampleTransactions('2026-01');
  assert.equal(items.length, 66);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(validStored(items), true);
  const current = items.filter((item) => item.date.startsWith('2026-01'));
  assert.deepEqual(totals(current), { income: 776900, expense: 441631 });
});
test('atualiza apenas a categoria do exemplo original de energia, sem recriar ou alterar outros lançamentos', () => {
  const [original] = sampleTransactions('2026-01').filter(
    (item) => item.id === 'example-2026-01-4',
  );
  assert.ok(original);
  const old = { ...original, category: 'Moradia' };
  const custom = { ...old, id: 'custom', description: 'Conta de luz' };
  const migrated = upgradeDemoCategories([old, custom]);
  assert.equal(migrated[0]?.category, 'Energia');
  assert.deepEqual(migrated[1], custom);
  assert.equal(migrated[0]?.cents, old.cents);
  assert.deepEqual(upgradeDemoCategories([]), []);
  assert.equal(validStored(migrated), true);
});
test('estado adulterado é rejeitado antes de entrar nos cálculos', () => {
  assert.equal(
    validStored([
      {
        id: 'x',
        description: 'x',
        category: 'Outros',
        type: 'expense',
        cents: 0.1,
        date: '2026-01-01',
      },
    ]),
    false,
  );
  assert.equal(validStored([]), true);
});
