import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ViaMap from '@/components/ViaMap';
import StationCard from '@/components/StationCard';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Info, Share2, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ViaSacraPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStation, setCurrentStation] = useState(1);
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [role, setRole] = useState('solo');
  const [hostToken, setHostToken] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [hostLoginOpen, setHostLoginOpen] = useState(false);
  const [hostFirstName, setHostFirstName] = useState(
    localStorage.getItem('viaSacraHostFirstName') || '',
  );
  const [hostLastName, setHostLastName] = useState(
    localStorage.getItem('viaSacraHostLastName') || '',
  );
  const [hostPassword, setHostPassword] = useState('');
  const [hostLoginError, setHostLoginError] = useState('');
  const [sharingRoom, setSharingRoom] = useState(false);
  const [openingParticipants, setOpeningParticipants] = useState(false);
  const [openingHostLogin, setOpeningHostLogin] = useState(false);
  const [hostLoginLoading, setHostLoginLoading] = useState(false);
  const [previousLoading, setPreviousLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const redirectingRef = useRef(false);
  const previousParticipantsRef = useRef([]);
  const initialParticipantsLoadedRef = useRef(false);

  // Get station from URL
  useEffect(() => {
    const stationParam = parseInt(searchParams.get('station')) || 1;
    const storedRoomId = searchParams.get('roomId') || localStorage.getItem('viaSacraRoomId');
    const storedRole = localStorage.getItem('viaSacraRole') || 'solo';
    const storedHostToken = localStorage.getItem('viaSacraHostToken');
    const isHost = storedRole === 'host';
    if (storedRoomId) {
      setRoomId(storedRoomId);
      localStorage.setItem('viaSacraRoomId', storedRoomId);
    }
    setRole(storedRole);
    if (!isHost && storedHostToken) {
      localStorage.removeItem('viaSacraHostToken');
      setHostToken(null);
    } else {
      setHostToken(storedHostToken);
    }
    if (stationParam >= 1 && stationParam <= 14 && (isHost || !storedRoomId)) {
      setCurrentStation(stationParam);
    }
  }, [searchParams]);

  const fetchRoomStation = useCallback(async () => {
    if (!roomId) {
      return;
    }
    try {
      const response = await axios.get(`${API}/rooms/${roomId}`);
      const station = response.data.current_station || 1;
      const incomingParticipants = response.data.participants || [];
      setSyncMessage('');
      if (role !== 'host') {
        setCurrentStation(station);
        setSearchParams({ station, roomId });
      }
      if (!initialParticipantsLoadedRef.current) {
        previousParticipantsRef.current = incomingParticipants;
        initialParticipantsLoadedRef.current = true;
      } else {
        const previousNames = new Set(
          (previousParticipantsRef.current || []).map((participant) => participant.name),
        );
        const incomingNames = new Set(incomingParticipants.map((participant) => participant.name));
        incomingParticipants.forEach((participant) => {
          if (!previousNames.has(participant.name)) {
            toast(`${participant.name} entrou`);
          }
        });
        previousParticipantsRef.current.forEach((participant) => {
          if (!incomingNames.has(participant.name)) {
            toast(`${participant.name} saiu`);
          }
        });
        previousParticipantsRef.current = incomingParticipants;
      }
      setParticipants(incomingParticipants);
    } catch (error) {
      console.error('Erro ao sincronizar sala:', error);
      if (!redirectingRef.current && error.response?.status === 404) {
        redirectingRef.current = true;
        localStorage.removeItem('viaSacraRoomId');
        localStorage.removeItem('viaSacraRole');
        localStorage.removeItem('viaSacraHostToken');
        navigate('/?roomClosed=1', { replace: true });
        return;
      }
      setSyncMessage('Sala expirada ou indisponível.');
    }
  }, [roomId, role, setSearchParams, navigate]);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }
    fetchRoomStation();
    const interval = setInterval(fetchRoomStation, 5000);
    return () => clearInterval(interval);
  }, [roomId, fetchRoomStation]);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }
    const participantName = localStorage.getItem('viaSacraParticipantName');
    if (!participantName) {
      return undefined;
    }
    const leaveUrl = `${API}/rooms/${roomId}/leave`;
    const sendLeave = () => {
      const payload = JSON.stringify({ name: participantName });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(leaveUrl, new Blob([payload], { type: 'application/json' }));
      } else {
        axios.post(leaveUrl, { name: participantName });
      }
    };
    const handleBeforeUnload = () => sendLeave();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendLeave();
    };
  }, [roomId]);

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

  const handleHostLogin = async (event) => {
    event.preventDefault();
    if (!roomId) {
      return;
    }
    setHostLoginError('');
    setHostLoginLoading(true);
    try {
      const response = await axios.post(`${API}/rooms/${roomId}/host-login`, {
        password: hostPassword,
        first_name: hostFirstName,
        last_name: hostLastName,
      });
      const { host_token: newHostToken, current_station: station } = response.data;
      localStorage.setItem('viaSacraRole', 'host');
      localStorage.setItem('viaSacraHostToken', newHostToken);
      localStorage.setItem('viaSacraHostFirstName', hostFirstName);
      localStorage.setItem('viaSacraHostLastName', hostLastName);
      setRole('host');
      setHostToken(newHostToken);
      if (station) {
        setCurrentStation(station);
        setSearchParams({ station, roomId });
      }
      setHostPassword('');
      setHostLoginOpen(false);
      toast('Anfitrião reconectado');
    } catch (error) {
      console.error('Erro ao reentrar como anfitrião:', error);
      setHostLoginError('Não foi possível autenticar como anfitrião.');
    } finally {
      setHostLoginLoading(false);
    }
  };

  // Fetch station data
  useEffect(() => {
    const fetchStation = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/stations/${currentStation}`);
        setStationData(response.data);
      } catch (error) {
        console.error('Error fetching station:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentStation >= 1 && currentStation <= 14) {
      fetchStation();
    }
  }, [currentStation]);

  const handlePrevious = async () => {
    if (currentStation <= 1) {
      return;
    }
    setPreviousLoading(true);
    const newStation = currentStation - 1;
    if (roomId && role === 'host') {
      try {
        await axios.patch(`${API}/rooms/${roomId}/station`, {
          station: newStation,
          host_token: hostToken,
        });
        setSearchParams({ station: newStation, roomId });
      } catch (error) {
        console.error('Erro ao atualizar estação:', error);
      }
    } else if (!roomId) {
      setSearchParams({ station: newStation });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPreviousLoading(false);
  };

  const handleNext = async () => {
    setNextLoading(true);
    if (currentStation < 14) {
      const newStation = currentStation + 1;
      if (roomId && role === 'host') {
        try {
          await axios.patch(`${API}/rooms/${roomId}/station`, {
            station: newStation,
            host_token: hostToken,
          });
          setSearchParams({ station: newStation, roomId });
        } catch (error) {
          console.error('Erro ao atualizar estação:', error);
        }
      } else if (!roomId) {
        setSearchParams({ station: newStation });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (roomId && role === 'host') {
        try {
          await axios.patch(`${API}/rooms/${roomId}/complete`, {
            host_token: hostToken,
          });
        } catch (error) {
          console.error('Erro ao concluir a sala:', error);
        }
      }
      navigate('/final');
    }
    setNextLoading(false);
  };

  return (
    <div className="relative h-screen overflow-hidden pb-24 md:pb-0" data-testid="via-sacra-page">
      {roomId && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setOpeningParticipants(true);
              setParticipantsOpen(true);
              setOpeningParticipants(false);
            }}
            aria-label="Ver participantes"
            loading={openingParticipants}
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
      <div className="flex h-full flex-col md:flex-row">
        {/* Map column */}
        <div className="bg-card border-b md:border-b-0 md:border-r border-border shadow-md md:shadow-none md:w-[35%] lg:w-[30%]">
          <div className="flex h-[33vh] items-center justify-center px-4 py-4 md:sticky md:top-0 md:h-screen md:py-0">
            <div className="w-full max-w-2xl md:max-w-none">
              <div className="block md:hidden">
                <ViaMap currentStation={currentStation} totalStations={14} />
              </div>
              <div className="hidden md:block">
                <ViaMap currentStation={currentStation} totalStations={14} orientation="vertical" />
              </div>
            </div>
          </div>
        </div>

        {/* Station content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-28">
          <div className="mx-auto max-w-3xl">
            {roomId && role !== 'host' && (
              <div className="mb-4 flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary md:flex-row md:items-center md:justify-between">
                <span>Acompanhando o anfitrião. As etapas são sincronizadas automaticamente.</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpeningHostLogin(true);
                    setHostLoginError('');
                    setHostLoginOpen(true);
                    setOpeningHostLogin(false);
                  }}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                  loading={openingHostLogin}
                >
                  Sou o anfitrião
                </Button>
              </div>
            )}
            {syncMessage && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {syncMessage}
              </div>
            )}
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div
                  className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
                  aria-label="Carregando"
                  role="status"
                />
              </div>
            ) : (
              <StationCard station={stationData} />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation
        currentStation={currentStation}
        totalStations={14}
        onPrevious={handlePrevious}
        onNext={handleNext}
        allowNavigation={!roomId || role === 'host'}
        previousLoading={previousLoading}
        nextLoading={nextLoading}
      />

      <Dialog open={participantsOpen} onOpenChange={setParticipantsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participantes</DialogTitle>
          </DialogHeader>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum participante ainda.</p>
          ) : (
            <ul className="space-y-2">
              {participants.map((participant) => (
                <li
                  key={`${participant.name}-${participant.joined_at}`}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span className={participant.is_host ? 'font-semibold text-primary' : undefined}>
                    {participant.name}
                  </span>
                  {participant.is_host && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Star className="h-3.5 w-3.5 text-yellow-500" aria-hidden="true" />
                      Anfitrião
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={hostLoginOpen} onOpenChange={setHostLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reentrar como anfitrião</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHostLogin} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="host-first-name">Nome</Label>
                <Input
                  id="host-first-name"
                  value={hostFirstName}
                  onChange={(event) => setHostFirstName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host-last-name">Sobrenome</Label>
                <Input
                  id="host-last-name"
                  value={hostLastName}
                  onChange={(event) => setHostLastName(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="host-password">Senha da sala</Label>
              <Input
                id="host-password"
                type="password"
                value={hostPassword}
                onChange={(event) => setHostPassword(event.target.value)}
                required
              />
            </div>
            {hostLoginError && (
              <p className="text-sm text-destructive">{hostLoginError}</p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setHostLoginOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={hostLoginLoading} loadingText="Entrando...">
                Entrar como anfitrião
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViaSacraPage;
