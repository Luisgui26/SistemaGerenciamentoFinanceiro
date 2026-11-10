export type Transaction = {
  id: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  cents: number;
  date: string;
};
export const categories = [
  'Moradia',
  'Energia',
  'Condomínio',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Salário',
  'Outros',
];
export const categoryColors: Record<string, string> = {
  Moradia: '#547a71',
  Energia: '#b47b17',
  Condomínio: '#426b92',
  Alimentação: '#d1a867',
  Transporte: '#7b9eb5',
  Saúde: '#b98482',
  Lazer: '#aa9cc1',
  Educação: '#7c9f8c',
  Salário: '#547a71',
  Outros: '#9aaba5',
};
export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export function offsetMonth(month: string, offset: number): string {
  const [year, value] = month.split('-').map(Number);
  return monthKey(new Date(year!, value! - 1 + offset, 1));
}
export function monthLabel(
  month: string,
  options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' },
): string {
  const [year, value] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', options).format(
    new Date(year!, value! - 1, 1),
  );
}
export function money(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}
export function parseAmount(value: string): number | null {
  const match = value.trim().match(/^(\d{1,10})(?:[.,](\d{1,2}))?$/);
  if (!match) return null;
  const cents =
    Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return cents > 0 && Number.isSafeInteger(cents) ? cents : null;
}
export function totals(items: Transaction[]) {
  return items.reduce(
    (sum, item) => {
      if (item.type === 'income') sum.income += item.cents;
      else sum.expense += item.cents;
      return sum;
    },
    { income: 0, expense: 0 },
  );
}
export function sampleTransactions(month = monthKey()): Transaction[] {
  const items: Transaction[] = [];
  const examples: Array<Omit<Transaction, 'id' | 'date'> & { day: number }> = [
    {
      description: 'Salário mensal',
      category: 'Salário',
      type: 'income',
      cents: 680000,
      day: 5,
    },
    {
      description: 'Renda extra',
      category: 'Outros',
      type: 'income',
      cents: 95000,
      day: 12,
    },
    {
      description: 'Aluguel',
      category: 'Moradia',
      type: 'expense',
      cents: 185000,
      day: 8,
    },
    {
      description: 'Supermercado',
      category: 'Alimentação',
      type: 'expense',
      cents: 72490,
      day: 11,
    },
    {
      description: 'Conta de luz',
      category: 'Energia',
      type: 'expense',
      cents: 23850,
      day: 14,
    },
    {
      description: 'Farmácia',
      category: 'Saúde',
      type: 'expense',
      cents: 12890,
      day: 17,
    },
    {
      description: 'Transporte',
      category: 'Transporte',
      type: 'expense',
      cents: 31000,
      day: 19,
    },
    {
      description: 'Jantar em família',
      category: 'Lazer',
      type: 'expense',
      cents: 18990,
      day: 21,
    },
    {
      description: 'Internet',
      category: 'Moradia',
      type: 'expense',
      cents: 11990,
      day: 23,
    },
    {
      description: 'Feira da semana',
      category: 'Alimentação',
      type: 'expense',
      cents: 18640,
      day: 26,
    },
    {
      description: 'Taxa de condomínio',
      category: 'Condomínio',
      type: 'expense',
      cents: 45000,
      day: 9,
    },
  ];
  for (let offset = -5; offset <= 0; offset++) {
    const key = offsetMonth(month, offset);
    examples.forEach((example, i) => {
      const { day, ...transaction } = example;
      items.push({
        ...transaction,
        id: `example-${key}-${i}`,
        date: `${key}-${String(day).padStart(2, '0')}`,
        cents: Math.round(
          (transaction.cents * (100 + ((offset * 3 + i * 2) % 11))) / 100,
        ),
      });
    });
  }
  return items;
}
// Só atualiza exemplos originais da conta de luz; mantém inclusões e exclusões feitas no navegador.
export function upgradeDemoCategories(items: Transaction[]): Transaction[] {
  return items.map((item) =>
    item.id === `example-${item.date.slice(0, 7)}-4` &&
    item.description === 'Conta de luz' &&
    item.category === 'Moradia' &&
    item.type === 'expense'
      ? { ...item, category: 'Energia' }
      : item,
  );
}
export function validStored(value: unknown): value is Transaction[] {
  return (
    Array.isArray(value) &&
    value.length <= 500 &&
    value.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.description === 'string' &&
        item.description.length <= 100 &&
        typeof item.category === 'string' &&
        categories.includes(item.category) &&
        ['income', 'expense'].includes(item.type) &&
        Number.isSafeInteger(item.cents) &&
        item.cents > 0 &&
        item.cents <= 999999999999 &&
        typeof item.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date),
    )
  );
}
