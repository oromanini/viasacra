import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Cross, Info, Share2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IntroPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [intro, setIntro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [role, setRole] = useState('solo');
  const [infoOpen, setInfoOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sharingRoom, setSharingRoom] = useState(false);

  useEffect(() => {
    const storedRoomId = searchParams.get('roomId') || localStorage.getItem('viaSacraRoomId');
    const storedRole = localStorage.getItem('viaSacraRole') || 'solo';
    if (storedRoomId) {
      setRoomId(storedRoomId);
      localStorage.setItem('viaSacraRoomId', storedRoomId);
    }
    setRole(storedRole);
  }, [searchParams]);

  useEffect(() => {
    const fetchIntro = async () => {
      try {
        const response = await axios.get(`${API}/intro`);
        setIntro(response.data);
      } catch (error) {
        console.error('Error fetching intro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntro();
  }, []);

  const handleStart = async () => {
    setStarting(true);
    if (!roomId) {
      navigate('/via-sacra?station=1');
      setStarting(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/rooms/${roomId}`);
      const station = response.data.current_station || 1;
      navigate(`/via-sacra?roomId=${roomId}&station=${station}`);
    } catch (error) {
      console.error('Erro ao carregar a sala:', error);
    } finally {
      setStarting(false);
    }
  };

  const handleShareRoom = async () => {
    if (!roomId) {
      return;
    }
    setSharingRoom(true);
    try {
      await navigator.clipboard.writeText(roomId);
      toast('Código da sala copiado');
    } catch (error) {
      console.error('Erro ao copiar o código da sala:', error);
      toast('Não foi possível copiar o código');
    } finally {
      setSharingRoom(false);
    }
  };

  const roleLabel = role === 'host' ? 'Anfitrião' : role === 'orante' ? 'Orante' : 'Solo';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-accent"
      data-testid="intro-page"
    >
      {roomId && (
        <div className="fixed right-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-purple-200/40 bg-purple-500/20 px-2 py-1 shadow-lg backdrop-blur-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setInfoOpen(true)}
            aria-label="Informações da sala"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={handleShareRoom}
            aria-label="Compartilhar código da sala"
            loading={sharingRoom}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-full p-6">
              <Cross size={48} className="text-primary-foreground" />
            </div>
          </div>
          <h1 className="heading-font text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4" data-testid="intro-title">
            Via Sacra
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground heading-font">
            com Santo Afonso de Ligório
          </p>
        </div>

        <Card className="shadow-xl border-border">
          <CardContent className="p-8 md:p-12">
            {intro && (
              <>
                <h2 className="heading-font text-2xl font-bold text-primary mb-6 text-center" data-testid="intro-prayer-title">
                  {intro.title}
                </h2>
                <p className="text-lg leading-relaxed mb-8" data-testid="intro-prayer-text">
                  {intro.text}
                </p>
              </>
            )}
            
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={handleStart}
                size="lg"
                className="min-h-[56px] px-12 text-lg bg-primary hover:bg-primary/90"
                data-testid="start-button"
                loading={starting}
                loadingText="Preparando..."
              >
                {role === 'orante' ? 'Entrar na Via Sacra' : 'Começar Via Sacra'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informações da sala</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Código</p>
              <p className="text-base font-semibold text-foreground">{roomId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Você está como</p>
              <p className="text-base font-semibold text-foreground">{roleLabel}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntroPage;
