import { useState } from 'react';
import {
  money,
  categoryColors,
  monthLabel,
  offsetMonth,
  type Transaction,
} from '../lib/demo-finance';
import { compareMonths, comparisonChange } from '../lib/month-comparison';

type View = 'expense' | 'income' | 'balance';

function changeWords(reference: number, compared: number) {
  const difference = compared - reference;
  return difference === 0
    ? 'Mesmo valor'
    : `${money(Math.abs(difference))} a ${difference > 0 ? 'mais' : 'menos'}`;
}

function percentageWords(reference: number, compared: number) {
  const { difference, percentage } = comparisonChange(reference, compared);
  if (percentage === null) return 'Sem percentual: valor inicial igual a zero';
  if (difference === 0) return 'Sem variação (0%)';
  return `${difference > 0 ? 'Aumentou' : 'Diminuiu'} ${Math.abs(percentage).toLocaleString('pt-BR')}%`;
}

function changeTone(reference: number, compared: number, view: View) {
  if (reference === compared) return 'neutral';
  return (view === 'expense' ? compared < reference : compared > reference)
    ? 'positive'
    : 'negative';
}

export function MonthComparison({
  items,
  initialMonth,
}: {
  items: Transaction[];
  initialMonth: string;
}) {
  const [firstMonth, setFirstMonth] = useState(() =>
    offsetMonth(initialMonth, -1),
  );
  const [secondMonth, setSecondMonth] = useState(initialMonth);
  const [view, setView] = useState<View>('expense');
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const type = view === 'income' ? 'income' : 'expense';
  const byName = category !== null || query.trim().length > 0;
  const comparison = compareMonths(items, firstMonth, secondMonth, {
    type,
    category: category ?? 'all',
    query,
    groupBy: byName ? 'description' : 'category',
  });
  const firstLabel = monthLabel(firstMonth);
  const secondLabel = monthLabel(secondMonth);
  const shortMonth = (month: string) =>
    monthLabel(month, { month: 'short', year: 'numeric' });
  const firstValue =
    view === 'balance'
      ? comparison.reference.income - comparison.reference.expense
      : comparison.reference[view];
  const secondValue =
    view === 'balance'
      ? comparison.compared.income - comparison.compared.expense
      : comparison.compared[view];
  const { difference } = comparisonChange(firstValue, secondValue);
  const barMax = Math.max(Math.abs(firstValue), Math.abs(secondValue), 1);
  const sameMonth = firstMonth === secondMonth;
  const firstEmpty = comparison.reference.count === 0;
  const secondEmpty = comparison.compared.count === 0;
  const result =
    difference === 0
      ? view === 'expense'
        ? 'Você gastou o mesmo valor nos dois meses.'
        : view === 'income'
          ? 'Você recebeu o mesmo valor nos dois meses.'
          : 'Seu saldo foi igual nos dois meses.'
      : view === 'balance'
        ? `Em ${secondLabel}, seu saldo ficou ${money(Math.abs(difference))} ${difference > 0 ? 'maior' : 'menor'}.`
        : `Em ${secondLabel}, você ${view === 'expense' ? 'gastou' : 'recebeu'} ${changeWords(firstValue, secondValue)}.`;

  function selectView(next: View) {
    setView(next);
    setCategory(null);
    setQuery('');
  }
  function updateMonth(value: string, setter: (value: string) => void) {
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) setter(value);
  }
  function clearSearch() {
    setCategory(null);
    setQuery('');
  }

  return (
    <section
      id="comparar-meses"
      className="panel month-compare"
      aria-labelledby="comparison-title"
    >
      <header className="cmp-heading">
        <h2 id="comparison-title">Comparar meses</h2>
        <p>Veja o que mudou de um mês para o outro.</p>
      </header>

      <div className="cmp-months">
        <label>
          Primeiro mês
          <input
            type="month"
            value={firstMonth}
            onChange={(event) => updateMonth(event.target.value, setFirstMonth)}
          />
        </label>
        <span className="cmp-versus" aria-hidden="true">
          com
        </span>
        <label>
          Segundo mês
          <input
            type="month"
            value={secondMonth}
            onChange={(event) =>
              updateMonth(event.target.value, setSecondMonth)
            }
          />
        </label>
      </div>

      <fieldset className="cmp-view">
        <legend>O que você quer comparar?</legend>
        <div role="group" aria-label="O que comparar">
          {(
            [
              { value: 'expense', label: 'Gastos' },
              { value: 'income', label: 'Receitas' },
              { value: 'balance', label: 'Saldo' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={view === option.value}
              onClick={() => selectView(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div
        className="cmp-values"
        aria-label={
          view === 'expense'
            ? 'Gastos nos dois meses'
            : view === 'income'
              ? 'Receitas nos dois meses'
              : 'Saldo nos dois meses'
        }
      >
        <div className="cmp-first-value">
          <small className="cmp-month-number">Primeiro mês</small>
          <span>{firstLabel}</span>
          <strong>{money(firstValue)}</strong>
          {firstValue >= 0 && secondValue >= 0 && (
            <div className="cmp-value-bar" aria-hidden="true">
              <i style={{ width: `${(firstValue / barMax) * 100}%` }} />
            </div>
          )}
          {firstEmpty && <small>Sem registros neste mês</small>}
        </div>
        <span className="cmp-arrow" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12h16m-6-6 6 6-6 6" />
          </svg>
        </span>
        <div className="cmp-second-value">
          <small className="cmp-month-number">Segundo mês</small>
          <span>{secondLabel}</span>
          <strong>{money(secondValue)}</strong>
          {firstValue >= 0 && secondValue >= 0 && (
            <div className="cmp-value-bar" aria-hidden="true">
              <i style={{ width: `${(secondValue / barMax) * 100}%` }} />
            </div>
          )}
          {secondEmpty && <small>Sem registros neste mês</small>}
        </div>
      </div>

      <div
        className={`cmp-result ${sameMonth || firstEmpty || secondEmpty ? 'neutral' : changeTone(firstValue, secondValue, view)}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <strong>
          {sameMonth
            ? 'Escolha dois meses diferentes para comparar.'
            : firstEmpty || secondEmpty
              ? 'Faltam registros para comparar esses meses.'
              : result}
        </strong>
        {!sameMonth && !firstEmpty && !secondEmpty && (
          <p>
            {percentageWords(firstValue, secondValue)} em relação a {firstLabel}
            .
          </p>
        )}
        {view === 'balance' && (
          <p>
            Saldo é o que você recebeu menos o que gastou. A variação usa o
            valor absoluto do saldo inicial como base.
          </p>
        )}
      </div>

      {view !== 'balance' && (
        <details className="cmp-details" key={view}>
          <summary>
            <span className="cmp-details-title">
              <strong>
                {view === 'expense'
                  ? 'Comparar gastos por categoria'
                  : 'Comparar receitas por categoria'}
              </strong>
              <small>
                {view === 'expense'
                  ? 'Veja energia, condomínio e outros gastos.'
                  : 'Veja como cada receita mudou.'}
              </small>
            </span>
            <span className="cmp-details-action">
              <span className="cmp-open-label">Ver detalhes</span>
              <span className="cmp-close-label">Fechar detalhes</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="cmp-details-body">
            <p className="cmp-detail-help">
              Escolha uma categoria abaixo ou busque pelo nome.
            </p>
            <label className="cmp-search">
              {view === 'expense' ? 'Buscar um gasto' : 'Buscar uma receita'}
              <input
                type="search"
                value={query}
                maxLength={100}
                placeholder={
                  view === 'expense'
                    ? 'Ex.: supermercado ou aluguel'
                    : 'Ex.: salário ou renda extra'
                }
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {category !== null && (
              <div className="cmp-breadcrumb">
                <button onClick={clearSearch}>
                  <span aria-hidden="true">←</span> Todas as categorias
                </button>
                <strong>{category}</strong>
              </div>
            )}
            {query.trim() && category === null && (
              <div className="cmp-search-status">
                <span>Resultados para “{query.trim()}”</span>
                <button onClick={clearSearch}>Limpar busca</button>
              </div>
            )}
            <ul className="cmp-items">
              {comparison.rows.map((row) => (
                <li key={row.key}>
                  <div className="cmp-item-name">
                    <span
                      className="cmp-category-dot"
                      aria-hidden="true"
                      style={{ backgroundColor: categoryColors[row.category] }}
                    />
                    <span>
                      <strong>{row.label}</strong>
                      {byName && <small>{row.category}</small>}
                    </span>
                  </div>
                  <dl className="cmp-item-values">
                    <div>
                      <dt>{shortMonth(firstMonth)}</dt>
                      <dd>{money(row.reference)}</dd>
                    </div>
                    <div>
                      <dt>{shortMonth(secondMonth)}</dt>
                      <dd>{money(row.compared)}</dd>
                    </div>
                  </dl>
                  <div
                    className={`cmp-item-change ${changeTone(row.reference, row.compared, view)}`}
                  >
                    {changeWords(row.reference, row.compared)}
                    <br />
                    {percentageWords(row.reference, row.compared)}
                  </div>
                  {!byName && (
                    <button
                      className="cmp-drill"
                      aria-label={`Ver ${view === 'expense' ? 'gastos' : 'receitas'} de ${row.category}`}
                      onClick={() => setCategory(row.category)}
                    >
                      {view === 'expense' ? 'Ver gastos' : 'Ver receitas'}{' '}
                      <span aria-hidden="true">→</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {comparison.rows.length === 0 && (
              <div className="cmp-empty">
                <strong>
                  {view === 'expense'
                    ? 'Nenhum gasto encontrado'
                    : 'Nenhuma receita encontrada'}
                </strong>
                <p>Tente outro nome ou escolha outros meses.</p>
                {(category !== null || query.trim()) && (
                  <button className="secondary-action" onClick={clearSearch}>
                    Ver todas as categorias
                  </button>
                )}
              </div>
            )}
            {byName && comparison.rows.length > 0 && (
              <p className="cmp-detail-note">
                Registros com o mesmo nome e categoria aparecem somados. O
                resumo acima continua mostrando o mês inteiro.
              </p>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
