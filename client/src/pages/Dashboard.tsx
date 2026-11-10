import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { MonthComparison } from '../components/MonthComparison';
import { useApi } from '../hooks/use-api';
import { authClient } from '../lib/auth-client';
import {
  categories,
  categoryColors,
  money,
  monthKey,
  monthLabel,
  offsetMonth,
  parseAmount,
  sampleTransactions,
  totals,
  upgradeDemoCategories,
  validStored,
  type Transaction,
} from '../lib/demo-finance';

type Member = {
  userId: string;
  name: string;
  familyName: string;
  role: string;
};
type IconName =
  | 'overview'
  | 'activity'
  | 'chart'
  | 'compare'
  | 'plus'
  | 'down'
  | 'up'
  | 'wallet'
  | 'calendar'
  | 'trash'
  | 'logout'
  | 'chevron'
  | 'left'
  | 'info'
  | 'close'
  | 'search';
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    activity: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
        <path d="m16 5 3 2-3 2M8 10l-3 2 3 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16V6M20 16v-6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    compare: <path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" />,
    down: <path d="M12 4v15m-6-6 6 6 6-6" />,
    up: <path d="M12 20V5m-6 6 6-6 6 6" />,
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M16 12h5M16 15h5M5 5V3h12" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v5M14 11v5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5v16h5M13 8l4 4-4 4M8 12h9" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    left: <path d="m15 18-6-6 6-6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 7h.01" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Dashboard() {
  const member = useApi<Member>('/me');
  if (member.loading)
    return (
      <main className="loading-screen" role="status">
        Carregando seu espaço…
      </main>
    );
  if (member.error || !member.data)
    return (
      <main className="loading-screen">
        <p role="alert">
          {member.error ?? 'Não foi possível carregar seu acesso.'}
        </p>
        <a href="/login">Voltar para o login</a>
      </main>
    );
  return <DemoDashboard key={member.data.userId} member={member.data} />;
}

function DemoDashboard({ member }: { member: Member }) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const sections = [
    { href: '#visao-geral', label: 'Visão geral', icon: 'overview' as const },
    {
      href: '#movimentacoes',
      label: 'Movimentações',
      icon: 'activity' as const,
    },
    { href: '#analise', label: 'Análise de gastos', icon: 'chart' as const },
    {
      href: '#comparar-meses',
      label: 'Comparar meses',
      icon: 'compare' as const,
    },
  ];
  const activeSection = sections.some((section) => section.href === hash)
    ? hash
    : '#visao-geral';
  const sectionTitle =
    sections.find((section) => section.href === activeSection)?.label ??
    'Visão geral';
  const sectionDescriptions: Record<string, string> = {
    '#visao-geral': `Olá, ${member.name.split(' ')[0]}. Veja como está o mês da sua família.`,
    '#analise':
      'Acompanhe a evolução das receitas e veja onde estão os gastos.',
    '#comparar-meses': 'Escolha dois meses e veja o que mudou entre eles.',
    '#movimentacoes': 'Consulte e organize as receitas e despesas do mês.',
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSection]);
  const formInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const storageKey = `financas-demo-v1:${member.userId}`;
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [items, setItems] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === null) return sampleTransactions();
      const parsed: unknown = JSON.parse(saved);
      return validStored(parsed) ? upgradeDemoCategories(parsed) : [];
    } catch {
      return sampleTransactions();
    }
  });
  const [month, setMonth] = useState(monthKey);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [removedItem, setRemovedItem] = useState<Transaction | null>(null);
  useEffect(() => {
    if (showForm) formInputRef.current?.focus();
  }, [showForm]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      queueMicrotask(() => setStorageAvailable(false));
    }
  }, [items, storageKey]);
  const selected = useMemo(
    () => items.filter((item) => item.date.slice(0, 7) === month),
    [items, month],
  );
  const summary = totals(selected);
  const previous = totals(
    items.filter((item) => item.date.slice(0, 7) === offsetMonth(month, -1)),
  );
  const listed = selected
    .filter(
      (item) =>
        (filter === 'all' || item.type === filter) &&
        `${item.description} ${item.category}`
          .toLocaleLowerCase('pt-BR')
          .includes(search.trim().toLocaleLowerCase('pt-BR')),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const byCategory = Object.entries(
    selected
      .filter((item) => item.type === 'expense')
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + item.cents;
        return acc;
      }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const months = Array.from({ length: 6 }, (_, i) => offsetMonth(month, i - 5));
  const series = months.map((key) => ({
    key,
    ...totals(items.filter((item) => item.date.slice(0, 7) === key)),
  }));
  const chartMax = Math.max(
    ...series.flatMap((point) => [point.income, point.expense]),
    1,
  );

  function addTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const form = new FormData(event.currentTarget);
    const description = String(form.get('description') ?? '').trim();
    const cents = parseAmount(String(form.get('amount') ?? ''));
    const type = String(form.get('type'));
    const category = String(form.get('category'));
    const date = String(form.get('date'));
    const parsedDate = new Date(`${date}T12:00:00`);
    if (
      !description ||
      description.length > 100 ||
      !cents ||
      !categories.includes(category) ||
      !['income', 'expense'].includes(type) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      monthKey(parsedDate) !== date.slice(0, 7) ||
      parsedDate.getDate() !== Number(date.slice(-2))
    ) {
      setFormError(
        'Confira os campos. Use um valor positivo, com até duas casas decimais, e uma data válida.',
      );
      return;
    }
    if (items.length >= 500) {
      setFormError('A demonstração aceita até 500 movimentações.');
      return;
    }
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        description,
        category,
        cents,
        date,
        type: type as Transaction['type'],
      },
    ]);
    setMonth(date.slice(0, 7));
    setFilter('all');
    setSearch('');
    setShowForm(false);
    setRemovedItem(null);
    setNotice(
      'Movimentação de teste adicionada. Seu resumo já foi atualizado.',
    );
    addButtonRef.current?.focus();
  }
  function closeForm() {
    setShowForm(false);
    addButtonRef.current?.focus();
  }
  function removeTransaction(item: Transaction) {
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setRemovedItem(item);
    setNotice('Movimentação de teste excluída.');
  }
  async function logout() {
    setBusy(true);
    setPageError('');
    try {
      const result = await authClient.signOut();
      if (result.error) setPageError('Não foi possível sair. Tente novamente.');
      else navigate('/login', { replace: true });
    } catch {
      setPageError('Não foi possível sair. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  function clearExamples() {
    if (
      window.confirm(
        'Apagar todas as movimentações de demonstração deste navegador? Você poderá restaurar os exemplos originais, mas as movimentações adicionadas serão perdidas.',
      )
    ) {
      setItems([]);
      setShowForm(false);
      setRemovedItem(null);
      setNotice(
        'Exemplos apagados. Você pode restaurar os dados originais quando quiser.',
      );
    }
  }
  function restoreExamples() {
    if (
      items.length === 0 ||
      window.confirm(
        'Substituir os dados de demonstração atuais pelos exemplos originais?',
      )
    ) {
      setItems(sampleTransactions());
      setMonth(monthKey());
      setFilter('all');
      setSearch('');
      setRemovedItem(null);
      setNotice('Exemplos originais restaurados.');
    }
  }
  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const variation = previous.expense
    ? Math.round(
        ((summary.expense - previous.expense) / previous.expense) * 100,
      )
    : null;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#visao-geral">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-label">ACOMPANHE SUAS FINANÇAS</div>
        <nav className="side-nav" aria-label="Navegação principal">
          {sections.map((section) => (
            <Link
              key={section.href}
              to={section.href}
              className={activeSection === section.href ? 'active' : undefined}
              aria-current={
                activeSection === section.href ? 'location' : undefined
              }
            >
              <Icon name={section.icon} />
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="avatar">{initials}</span>
            <span className="profile-copy">
              <strong>{member.name}</strong>
              <small>{member.familyName}</small>
            </span>
            <button
              aria-label="Sair da conta"
              title="Sair"
              disabled={busy}
              onClick={() => void logout()}
            >
              <Icon name="logout" size={19} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="family-heading">
            <span>ESPAÇO DA FAMÍLIA</span>
            <strong>{member.familyName}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-pill">
              <span /> Demonstração
            </span>
            <span className="avatar top-avatar">{initials}</span>
            <button
              className="mobile-logout"
              disabled={busy}
              onClick={() => void logout()}
            >
              Sair
            </button>
          </div>
        </header>
        <nav className="mobile-nav" aria-label="Seções do painel">
          {sections.map((section) => (
            <Link
              key={section.href}
              to={section.href}
              aria-current={
                activeSection === section.href ? 'location' : undefined
              }
              className={activeSection === section.href ? 'active' : undefined}
            >
              <Icon name={section.icon} size={18} />
              {section.label}
            </Link>
          ))}
        </nav>
        <main className="dashboard" id="visao-geral" tabIndex={-1}>
          {pageError && (
            <p role="alert" className="error-message">
              {pageError}
            </p>
          )}
          <div className="demo-banner">
            <span className="banner-icon">
              <Icon name="info" size={20} />
            </span>
            <div>
              <strong>Um espaço para experimentar</strong>
              <p>
                Dados fictícios para explorar o painel. Suas alterações ficam só
                neste navegador.
              </p>
            </div>
            <div className="banner-actions">
              <button onClick={restoreExamples}>Restaurar exemplos</button>
              <button onClick={clearExamples} disabled={items.length === 0}>
                Apagar exemplos
              </button>
            </div>
          </div>
          {!storageAvailable && (
            <p role="alert" className="storage-warning">
              O armazenamento do navegador está indisponível. Os dados de teste
              serão perdidos ao recarregar.
            </p>
          )}
          <div className="page-heading">
            <div>
              <p className="eyebrow">MAIS TRANQUILIDADE NO SEU DIA A DIA</p>
              <h1>{sectionTitle}</h1>
              <p>{sectionDescriptions[activeSection]}</p>
            </div>
            <button
              className="primary-action"
              ref={addButtonRef}
              aria-expanded={showForm}
              aria-controls="new-transaction"
              onClick={() => {
                setShowForm(!showForm);
                setFormError('');
              }}
            >
              <Icon name={showForm ? 'close' : 'plus'} size={18} />
              {showForm ? 'Fechar formulário' : 'Adicionar movimentação'}
            </button>
          </div>
          {showForm && (
            <form
              id="new-transaction"
              className="entry-form panel"
              onSubmit={addTransaction}
              aria-labelledby="form-heading"
            >
              <div className="section-heading">
                <div>
                  <h2 id="form-heading">O que você quer registrar?</h2>
                  <p>Experimente com uma receita ou despesa fictícia.</p>
                </div>
              </div>
              <fieldset className="type-choice">
                <legend>Tipo de movimentação</legend>
                <label>
                  <input
                    name="type"
                    type="radio"
                    value="expense"
                    defaultChecked
                  />
                  <span>
                    <strong>Despesa</strong>
                    <small>Dinheiro que saiu</small>
                  </span>
                  <Icon name="down" size={20} />
                </label>
                <label>
                  <input name="type" type="radio" value="income" />
                  <span>
                    <strong>Receita</strong>
                    <small>Dinheiro que entrou</small>
                  </span>
                  <Icon name="up" size={20} />
                </label>
              </fieldset>
              <div className="form-grid">
                <label>
                  Descrição
                  <input
                    name="description"
                    ref={formInputRef}
                    maxLength={100}
                    required
                    placeholder="Ex.: Mercado"
                  />
                </label>
                <label>
                  Valor em reais
                  <input
                    name="amount"
                    inputMode="decimal"
                    required
                    placeholder="Ex.: 120,50"
                  />
                </label>
                <label>
                  Categoria
                  <select name="category" defaultValue="Alimentação">
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Data
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={`${month}-01`}
                  />
                </label>
              </div>
              {formError && (
                <p role="alert" className="error-message">
                  {formError}
                </p>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={closeForm}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-action">
                  Salvar movimentação de teste
                </button>
              </div>
            </form>
          )}
          <div
            className="period-line"
            hidden={activeSection === '#comparar-meses'}
          >
            <div>
              <h2>
                {activeSection === '#visao-geral'
                  ? 'Resumo do mês'
                  : 'Mês selecionado'}
              </h2>
              <p>
                Entradas e saídas de <strong>{monthLabel(month)}</strong>
              </p>
            </div>
            <div className="month-control">
              <button
                aria-label="Ver mês anterior"
                onClick={() => setMonth(offsetMonth(month, -1))}
              >
                <Icon name="left" size={17} />
              </button>
              <Icon name="calendar" size={17} />
              <label htmlFor="month" className="sr-only">
                Escolher mês de referência
              </label>
              <input
                id="month"
                type="month"
                value={month}
                onChange={(event) => {
                  if (event.target.value) setMonth(event.target.value);
                }}
              />
              <button
                aria-label="Ver próximo mês"
                onClick={() => setMonth(offsetMonth(month, 1))}
              >
                <Icon name="chevron" size={17} />
              </button>
            </div>
          </div>
          <div
            className="summary-grid"
            hidden={activeSection !== '#visao-geral'}
          >
            <article className="summary-card balance">
              <div className="summary-top">
                <span>Saldo do mês</span>
                <span className="summary-icon">
                  <Icon name="wallet" size={19} />
                </span>
              </div>
              <strong>{money(summary.income - summary.expense)}</strong>
              <p>O que entrou menos o que saiu</p>
              <div className="balance-decoration" aria-hidden="true" />
            </article>
            <article className="summary-card">
              <div className="summary-top">
                <span>Receitas</span>
                <span className="summary-icon income-icon">
                  <Icon name="up" size={18} />
                </span>
              </div>
              <strong>{money(summary.income)}</strong>
              <p>
                <span className="legend-dot income-dot" /> Dinheiro que entrou
              </p>
            </article>
            <article className="summary-card">
              <div className="summary-top">
                <span>Despesas</span>
                <span className="summary-icon expense-icon">
                  <Icon name="down" size={18} />
                </span>
              </div>
              <strong>{money(summary.expense)}</strong>
              <p>
                <span className="legend-dot expense-dot" />{' '}
                {variation === null
                  ? 'Saídas no período'
                  : `${variation > 0 ? '+' : ''}${variation}% em relação ao mês anterior`}
              </p>
            </article>
          </div>
          <div
            className="analysis-grid"
            id="analise"
            hidden={activeSection !== '#analise'}
          >
            <section className="panel chart-panel">
              <div className="section-heading">
                <div>
                  <h2>Entradas e saídas</h2>
                  <p>Receitas e despesas nos últimos 6 meses</p>
                </div>
                <span className="panel-tag">Mensal</span>
              </div>
              <div className="chart-legend">
                <span>
                  <i className="legend-dot income-dot" /> Receitas
                </span>
                <span>
                  <i className="legend-dot expense-dot" /> Despesas
                </span>
              </div>
              <div
                className="bar-chart"
                role="img"
                aria-label={series
                  .map(
                    (point) =>
                      `${monthLabel(point.key)}: receitas ${money(point.income)}, despesas ${money(point.expense)}`,
                  )
                  .join('; ')}
              >
                <div className="chart-grid">
                  <span>{money(chartMax)}</span>
                  <span>{money(Math.round(chartMax * 0.5))}</span>
                  <span>R$ 0</span>
                </div>
                <div className="chart-bars">
                  {series.map((point) => (
                    <div className="bar-group" key={point.key}>
                      <div className="bars">
                        <div
                          className="bar income-bar"
                          style={{
                            height: `${(point.income / chartMax) * 100}%`,
                          }}
                          title={`Receitas: ${money(point.income)}`}
                        />
                        <div
                          className="bar expense-bar"
                          style={{
                            height: `${(point.expense / chartMax) * 100}%`,
                          }}
                          title={`Despesas: ${money(point.expense)}`}
                        />
                      </div>
                      <span>
                        {monthLabel(point.key, { month: 'short' }).replace(
                          '.',
                          '',
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="panel categories-panel">
              <div className="section-heading">
                <div>
                  <h2>Onde você gastou</h2>
                  <p>Despesas por categoria</p>
                </div>
                <span className="subtle-icon">
                  <Icon name="chart" size={18} />
                </span>
              </div>
              {byCategory.length ? (
                <>
                  <div className="donut-wrap">
                    <div
                      className="donut"
                      role="img"
                      aria-label={byCategory
                        .map(
                          ([category, amount]) =>
                            `${category}: ${money(amount)}`,
                        )
                        .join('; ')}
                      style={{
                        background: `conic-gradient(${byCategory
                          .map(([category, amount], index) => {
                            const before = byCategory
                              .slice(0, index)
                              .reduce((sum, [, cents]) => sum + cents, 0);
                            return `${categoryColors[category]} ${(before / summary.expense) * 100}% ${((before + amount) / summary.expense) * 100}%`;
                          })
                          .join(', ')})`,
                      }}
                    >
                      <div className="donut-center">
                        <span>Total gasto</span>
                        <strong>{money(summary.expense)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="category-list">
                    {byCategory.map(([category, amount]) => (
                      <div key={category}>
                        <span>
                          <i
                            className="legend-dot"
                            style={{
                              backgroundColor: categoryColors[category],
                            }}
                          />
                          {category}
                        </span>
                        <span className="category-values">
                          <strong>{money(amount)}</strong>
                          <small>
                            {Math.round((amount / summary.expense) * 100)}% do
                            total
                          </small>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-chart">Nenhuma despesa neste mês.</div>
              )}
            </section>
          </div>
          <div hidden={activeSection !== '#comparar-meses'}>
            <MonthComparison items={items} initialMonth={month} />
          </div>
          <section
            className="panel transactions-panel"
            id="movimentacoes"
            hidden={activeSection !== '#movimentacoes'}
          >
            <div className="section-heading transactions-heading">
              <div>
                <h2>Movimentações</h2>
                <p>Suas entradas e saídas de {monthLabel(month)}</p>
              </div>
              <div className="table-controls">
                <label className="search-field">
                  <Icon name="search" size={16} />
                  <span className="sr-only">
                    Buscar por descrição ou categoria
                  </span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar movimentação"
                  />
                </label>
                <label>
                  <span className="sr-only">Filtrar tipo</span>
                  <select
                    value={filter}
                    onChange={(event) =>
                      setFilter(event.target.value as typeof filter)
                    }
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="income">Receitas</option>
                    <option value="expense">Despesas</option>
                  </select>
                </label>
              </div>
            </div>
            {listed.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>DESCRIÇÃO</th>
                      <th>CATEGORIA</th>
                      <th>DATA</th>
                      <th>TIPO</th>
                      <th className="amount-cell">VALOR</th>
                      <th>
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listed.map((item) => (
                      <tr key={item.id}>
                        <td className="description-cell">
                          <div className="transaction-name">
                            <span className={`transaction-icon ${item.type}`}>
                              <Icon
                                name={item.type === 'income' ? 'up' : 'down'}
                                size={16}
                              />
                            </span>
                            <strong>{item.description}</strong>
                          </div>
                        </td>
                        <td className="category-cell">
                          <span className="category-badge">
                            {item.category}
                          </span>
                        </td>
                        <td className="date-cell">
                          {new Intl.DateTimeFormat('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }).format(new Date(`${item.date}T12:00:00`))}
                        </td>
                        <td className="type-cell">
                          <span className={`type-badge ${item.type}`}>
                            {item.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className={`amount-cell amount-${item.type}`}>
                          {item.type === 'income' ? '+' : '−'}{' '}
                          {money(item.cents)}
                        </td>
                        <td className="action-cell">
                          <button
                            className="delete-button"
                            aria-label={`Excluir movimentação fictícia ${item.description}`}
                            title="Excluir exemplo"
                            onClick={() => removeTransaction(item)}
                          >
                            <Icon name="trash" size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-table">
                <strong>Nenhuma movimentação encontrada</strong>
                <p>
                  {items.length === 0
                    ? 'Os dados de demonstração foram removidos. Restaure os exemplos ou adicione uma movimentação fictícia.'
                    : 'Experimente outro período ou filtro, ou adicione uma movimentação fictícia.'}
                </p>
                {items.length === 0 && (
                  <button
                    className="secondary-action"
                    onClick={restoreExamples}
                  >
                    Restaurar exemplos
                  </button>
                )}
              </div>
            )}
            <div className="table-footer">
              {listed.length}{' '}
              {listed.length === 1 ? 'movimentação' : 'movimentações'} neste
              período <span>Dados de demonstração</span>
            </div>
          </section>
          <footer className="page-footer">
            <span>Mais clareza para cuidar das suas finanças.</span>
            <span>Finanças em família · modo demonstração</span>
          </footer>
          {notice && (
            <div className="notice-toast">
              <p role="status">{notice}</p>
              {removedItem && (
                <button
                  onClick={() => {
                    setItems((current) => [...current, removedItem]);
                    setRemovedItem(null);
                    setNotice('Movimentação restaurada.');
                  }}
                >
                  Desfazer
                </button>
              )}
              <button
                className="notice-close"
                aria-label="Fechar aviso"
                onClick={() => {
                  setNotice('');
                  setRemovedItem(null);
                }}
              >
                <Icon name="close" size={17} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
