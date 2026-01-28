import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RoomPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [error, setError] = useState('');

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await axios.get(`${API}/rooms`);
      setRooms(response.data);
    } catch (err) {
      console.error('Erro ao carregar salas:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API}/rooms`, {
        name: createName,
        password: createPassword,
      });
      const { room_id: roomId, host_token: hostToken } = response.data;
      localStorage.setItem('viaSacraRoomId', roomId);
      localStorage.setItem('viaSacraRole', 'host');
      localStorage.setItem('viaSacraHostToken', hostToken);
      navigate(`/intro?roomId=${roomId}`);
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      setError('Não foi possível criar a sala. Verifique os dados.');
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API}/rooms/join`, {
        room_id: joinRoomId,
        password: joinPassword,
      });
      const { room_id: roomId } = response.data;
      localStorage.setItem('viaSacraRoomId', roomId);
      localStorage.setItem('viaSacraRole', 'orante');
      localStorage.removeItem('viaSacraHostToken');
      navigate(`/intro?roomId=${roomId}`);
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      setError('Não foi possível entrar na sala. Verifique a senha.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="text-center">
          <h1 className="heading-font text-4xl font-bold text-primary">Salas da Via Sacra</h1>
          <p className="mt-2 text-muted-foreground">
            Crie uma sala para ser anfitrião ou entre como orante com a senha.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="heading-font text-2xl">Criar sala</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Nome da sala</Label>
                  <Input
                    id="room-name"
                    placeholder="Ex: Via Sacra da família"
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-password">Senha</Label>
                  <Input
                    id="room-password"
                    type="password"
                    placeholder="Defina uma senha"
                    value={createPassword}
                    onChange={(event) => setCreatePassword(event.target.value)}
                    minLength={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Criar sala
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="heading-font text-2xl">Entrar em sala</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingRooms ? (
                <p className="text-sm text-muted-foreground">Carregando salas ativas...</p>
              ) : rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma sala ativa no momento. Crie a primeira!
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Salas disponíveis:</p>
                  <div className="space-y-2">
                    {rooms.map((room) => (
                      <button
                        key={room.room_id}
                        type="button"
                        onClick={() => setJoinRoomId(room.room_id)}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                          joinRoomId === room.room_id
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-primary/60'
                        }`}
                      >
                        <div className="font-medium text-primary">{room.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Expira em {new Date(room.expires_at).toLocaleString('pt-BR')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-room-id">Código da sala</Label>
                  <Input
                    id="join-room-id"
                    placeholder="Selecione acima ou cole o código"
                    value={joinRoomId}
                    onChange={(event) => setJoinRoomId(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-password">Senha</Label>
                  <Input
                    id="join-password"
                    type="password"
                    placeholder="Senha da sala"
                    value={joinPassword}
                    onChange={(event) => setJoinPassword(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full">
                  Entrar como orante
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          As salas ficam disponíveis por 24 horas após a criação.
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
