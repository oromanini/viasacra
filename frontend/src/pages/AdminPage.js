import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ADMIN_EMAIL = 'oscar.romanini.jr@gmail.com';
const ADMIN_TOKEN_KEY = 'viaSacraAdminToken';

const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    return decoded;
  } catch (error) {
    return null;
  }
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [adminEmail, setAdminEmail] = useState('');
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginEmail, setLoginEmail] = useState(ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const isAuthorized = useMemo(
    () => adminEmail && adminEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    [adminEmail],
  );

  const loadRooms = async (nameFilter, token) => {
    if (!token) {
      return;
    }
    setLoadingRooms(true);
    setError('');
    try {
      const response = await axios.get(`${API}/admin/rooms`, {
        params: nameFilter ? { name: nameFilter } : {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data);
    } catch (err) {
      console.error('Erro ao carregar salas:', err);
      setError('Não foi possível carregar as salas.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthError('Sessão expirada ou sem acesso.');
        setAdminToken('');
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleDeactivate = async (roomId) => {
    if (!adminToken) {
      return;
    }
    try {
      await axios.patch(
        `${API}/admin/rooms/${roomId}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      await loadRooms(filter, adminToken);
    } catch (err) {
      console.error('Erro ao desativar sala:', err);
      setError('Não foi possível desativar a sala.');
    }
  };

  const handleSignOut = () => {
    setAdminToken('');
    setAdminEmail('');
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  useEffect(() => {
    if (!adminToken) {
      return;
    }
    const decoded = decodeJwt(adminToken);
    if (decoded?.email) {
      setAdminEmail(decoded.email);
    } else {
      setAdminToken('');
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) {
      return;
    }
    const timeout = setTimeout(() => {
      loadRooms(filter, adminToken);
    }, 300);
    return () => clearTimeout(timeout);
  }, [filter, adminToken]);

  const handleNativeLogin = async () => {
    setAuthError('');
    setLoginLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, {
        email: loginEmail,
        password: loginPassword,
      });
      const token = response.data?.token;
      if (!token) {
        setAuthError('Não foi possível autenticar.');
        return;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      setAdminToken(token);
      const decoded = decodeJwt(token);
      if (decoded?.email) {
        setAdminEmail(decoded.email);
      }
    } catch (err) {
      console.error('Erro ao autenticar:', err);
      setAuthError('Email ou senha inválidos.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="heading-font text-4xl font-bold text-primary">Administração de Salas</h1>
            <p className="mt-2 text-muted-foreground">Gerencie salas ativas e acompanhe o andamento.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Voltar para a página inicial"
            onClick={handleReturnHome}
          >
            <Home className="h-5 w-5" />
          </Button>
        </header>

        {authError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {authError}
          </div>
        )}

        {adminToken ? (
          <Card className="shadow-md">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="heading-font text-2xl">Salas cadastradas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isAuthorized
                    ? `Acesso autorizado para ${adminEmail}.`
                    : 'Seu email não possui permissão para acessar esta área.'}
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sair
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="filter" className="text-sm font-medium text-muted-foreground">
                  Filtrar por nome da sala
                </label>
                <Input
                  id="filter"
                  placeholder="Digite o nome da sala"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  disabled={!isAuthorized}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {loadingRooms ? (
                <p className="text-sm text-muted-foreground">Carregando salas...</p>
              ) : !isAuthorized ? (
                <p className="text-sm text-muted-foreground">Solicite acesso para continuar.</p>
              ) : rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma sala encontrada.</p>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.room_id}
                      className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Sala</div>
                          <div className="font-semibold text-primary">{room.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: <span className="font-medium text-foreground">{room.room_id}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Senha: <span className="font-medium text-foreground">{room.password || '—'}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Participantes: <span className="font-medium text-foreground">{room.participant_count}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-muted-foreground">
                            Status:{' '}
                            <strong className={room.active ? 'text-emerald-600' : 'text-destructive'}>
                              {room.active ? 'Ativa' : 'Desativada'}
                            </strong>
                          </span>
                          <Button
                            variant="outline"
                            className="min-w-[160px]"
                            onClick={() => handleDeactivate(room.room_id)}
                            disabled={!room.active}
                          >
                            Desativar sala
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="heading-font text-2xl">Entrar na administração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Apenas o email {ADMIN_EMAIL} possui acesso a esta área.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="text-sm font-medium text-muted-foreground">
                    Email de acesso
                  </label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-password" className="text-sm font-medium text-muted-foreground">
                    Senha
                  </label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                  />
                </div>
                <Button onClick={handleNativeLogin} disabled={loginLoading}>
                  {loginLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
