import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ViaMap from '@/components/ViaMap';
import StationCard from '@/components/StationCard';
import Navigation from '@/components/Navigation';

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
  const redirectingRef = useRef(false);

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
      setSyncMessage('');
      if (role !== 'host') {
        setCurrentStation(station);
        setSearchParams({ station, roomId });
      }
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
  };

  const handleNext = async () => {
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
      navigate('/final');
    }
  };

  return (
    <div className="h-screen overflow-hidden pb-24 md:pb-0" data-testid="via-sacra-page">
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
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                Acompanhando o anfitrião. As etapas são sincronizadas automaticamente.
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
      />
    </div>
  );
};

export default ViaSacraPage;
