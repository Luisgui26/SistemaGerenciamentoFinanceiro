import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';

export function Login() {
  const { data, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (isPending) return <p role="status">Verificando sessão…</p>;
  if (data) return <Navigate to="/" replace />;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(form.get('email')).trim(),
        password: String(form.get('password')),
      });
      if (result.error)
        setError('Não foi possível entrar. Confira seu email e sua senha.');
      else navigate('/', { replace: true });
    } catch {
      setError('Não foi possível conectar. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="login-card">
      <p className="eyebrow">BEM-VINDO DE VOLTA</p>
      <h1>Entre na sua conta</h1>
      <p className="login-intro">
        Um espaço para cuidar das finanças da sua família, juntos.
      </p>
      <form className="mt-7 space-y-5" onSubmit={(event) => void submit(event)}>
        <div>
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <input
            className="field"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </div>
        <div>
          <label htmlFor="password" className="font-medium">
            Senha
          </label>
          <input
            className="field"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button className="primary-button w-full" disabled={busy} type="submit">
          {busy ? 'Entrando…' : 'Acessar minha conta'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Para obter acesso, fale com o administrador da família.
      </p>
    </section>
  );
}
