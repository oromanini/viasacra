import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RoomPage = () => {
  const navigate = useNavigate();
  const [createName, setCreateName] = useState('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [joinFirstName, setJoinFirstName] = useState('');
  const [joinLastName, setJoinLastName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [error, setError] = useState('');
  const [duplicateNameOpen, setDuplicateNameOpen] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    setCreatingRoom(true);
    try {
      const response = await axios.post(`${API}/rooms`, {
        name: createName,
        password: createPassword,
        first_name: createFirstName,
        last_name: createLastName,
      });
      const { room_id: roomId, host_token: hostToken } = response.data;
      localStorage.setItem('viaSacraRoomId', roomId);
      localStorage.setItem('viaSacraRole', 'host');
      localStorage.setItem('viaSacraHostToken', hostToken);
      localStorage.setItem('viaSacraHostFirstName', createFirstName);
      localStorage.setItem('viaSacraHostLastName', createLastName);
      navigate(`/intro?roomId=${roomId}`);
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      if (err.response?.status === 409) {
        setDuplicateNameOpen(true);
      } else {
        setError('Não foi possível criar a sala. Verifique os dados.');
      }
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    setError('');
    setJoiningRoom(true);
    try {
      const response = await axios.post(`${API}/rooms/join`, {
        room_id: joinRoomId,
        password: joinPassword,
        first_name: joinFirstName,
        last_name: joinLastName,
      });
      const { room_id: roomId } = response.data;
      localStorage.setItem('viaSacraRoomId', roomId);
      localStorage.setItem('viaSacraRole', 'orante');
      localStorage.removeItem('viaSacraHostToken');
      localStorage.setItem('viaSacraParticipantName', `${joinFirstName} ${joinLastName}`.trim());
      navigate(`/intro?roomId=${roomId}`);
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      setError('Não foi possível entrar na sala. Verifique a senha.');
    } finally {
      setJoiningRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 text-center md:text-left">
          <div className="flex flex-col gap-2 md:items-start">
            <h1 className="heading-font text-4xl font-bold text-primary">Via Sacra em grupo</h1>
            <p className="text-muted-foreground">
              Crie uma sala para ser anfitrião ou entre como orante com a senha.
            </p>
          </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-first-name">Nome</Label>
                    <Input
                      id="create-first-name"
                      placeholder="Seu nome"
                      value={createFirstName}
                      onChange={(event) => setCreateFirstName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-last-name">Sobrenome</Label>
                    <Input
                      id="create-last-name"
                      placeholder="Seu sobrenome"
                      value={createLastName}
                      onChange={(event) => setCreateLastName(event.target.value)}
                      required
                    />
                  </div>
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
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  loading={creatingRoom}
                  loadingText="Criando sala..."
                >
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
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="join-first-name">Nome</Label>
                    <Input
                      id="join-first-name"
                      placeholder="Seu nome"
                      value={joinFirstName}
                      onChange={(event) => setJoinFirstName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join-last-name">Sobrenome</Label>
                    <Input
                      id="join-last-name"
                      placeholder="Seu sobrenome"
                      value={joinLastName}
                      onChange={(event) => setJoinLastName(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-room-id">Código da sala</Label>
                  <Input
                    id="join-room-id"
                    placeholder="Digite o código da sala"
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
                <Button
                  type="submit"
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                  loading={joiningRoom}
                  loadingText="Entrando..."
                >
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

      <AlertDialog open={duplicateNameOpen} onOpenChange={setDuplicateNameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nome de sala já existe</AlertDialogTitle>
            <AlertDialogDescription>
              Esse nome de sala já existe, escolha outro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomPage;
