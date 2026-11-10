import { Link } from 'react-router-dom';
export function NotFound() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-3 text-slate-600">
        O endereço que você acessou não está disponível.
      </p>
      <Link className="mt-6 inline-block underline" to="/">
        Voltar ao início
      </Link>
    </section>
  );
}
