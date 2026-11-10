import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authClient } from '../lib/auth-client';

export function ProtectedRoute() {
  const { data, isPending, error } = authClient.useSession();
  const location = useLocation();
  if (isPending) return <p role="status">Verificando sessão…</p>;
  if (error)
    return (
      <p role="alert">
        Não foi possível verificar sua sessão. Recarregue a página.
      </p>
    );
  if (!data)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
