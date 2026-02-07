import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, User, Users } from 'lucide-react';
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

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loadingSolo, setLoadingSolo] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [roomClosedOpen, setRoomClosedOpen] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('roomClosed') === '1') {
      setRoomClosedOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('completed') === '1') {
      setCompletedOpen(true);
    }
  }, [searchParams]);

  const handleSolo = async () => {
    setError('');
    setLoadingSolo(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const response = await axios.post(`${API}/rooms`, {
        name: `Via Sacra individual ${timestamp}`,
        password: `solo-${Math.random().toString(36).slice(2, 8)}`,
        first_name: 'Orante',
        last_name: 'Solo',
      });
      const { room_id: roomId, host_token: hostToken } = response.data;
      localStorage.setItem('viaSacraRoomId', roomId);
      localStorage.setItem('viaSacraRole', 'host');
      localStorage.setItem('viaSacraHostToken', hostToken);
      localStorage.setItem('viaSacraHostFirstName', 'Orante');
      localStorage.setItem('viaSacraHostLastName', 'Solo');
      navigate(`/intro?roomId=${roomId}`);
    } catch (err) {
      console.error('Erro ao criar sala individual:', err);
      setError('Não foi possível iniciar a via sacra individual. Tente novamente.');
    } finally {
      setLoadingSolo(false);
    }
  };

  const handleGroup = () => {
    setLoadingGroup(true);
    setTimeout(() => {
      navigate('/salas');
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 text-center md:relative md:text-left">
          <div className="flex flex-col gap-2 md:items-start">
            <h1 className="heading-font text-4xl font-bold text-primary">Via Sacra</h1>
            <p className="text-muted-foreground">
              Escolha como deseja viver a Via Sacra hoje.
            </p>
          </div>
          <div className="md:absolute md:right-0 md:top-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin')}
              data-testid="admin-button"
              aria-label="Área Administrativa"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Área Administrativa</span>
            </Button>
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
              <CardTitle className="heading-font text-2xl">Fazer Via Sacra sozinho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Inicie agora mesmo a via sacra solo.
              </p>
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleSolo}
                loading={loadingSolo}
                loadingText="Preparando..."
              >
                <>
                  <User className="mr-2 h-4 w-4" aria-hidden="true" />
                  Fazer Via Sacra sozinho
                </>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="heading-font text-2xl">Fazer via sacra em grupo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Crie uma sala para ser anfitrião ou entre como orante com a senha.
              </p>
              <Button
                type="button"
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
                onClick={handleGroup}
                loading={loadingGroup}
                loadingText="Carregando..."
              >
                <>
                  <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                  Fazer via sacra em grupo
                </>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={roomClosedOpen}
        onOpenChange={(open) => {
          setRoomClosedOpen(open);
          if (!open && searchParams.get('roomClosed') === '1') {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('roomClosed');
            setSearchParams(nextParams, { replace: true });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sala encerrada</AlertDialogTitle>
            <AlertDialogDescription>
              Você deve iniciar uma nova sala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Ok</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={completedOpen}
        onOpenChange={(open) => {
          setCompletedOpen(open);
          if (!open && searchParams.get('completed') === '1') {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('completed');
            setSearchParams(nextParams, { replace: true });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Via Sacra concluída</AlertDialogTitle>
            <AlertDialogDescription>
              Você concluiu a via sacra online! Deus te abençoe!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Amém</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HomePage;
