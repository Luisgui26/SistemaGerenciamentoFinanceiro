export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Sua sessão expirou. Entre novamente.'
        : response.status === 403
          ? 'Seu acesso à família não está disponível.'
          : 'Não foi possível acessar a API. Tente novamente.',
    );
  }
  return response.json() as Promise<T>;
}
