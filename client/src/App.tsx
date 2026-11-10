import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { Brand } from './components/Brand';

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <main className="auth-page">
            <div className="auth-brand">
              <Brand />
            </div>
            <Login />
          </main>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route
        path="*"
        element={
          <main className="auth-page">
            <NotFound />
          </main>
        }
      />
    </Routes>
  );
}
