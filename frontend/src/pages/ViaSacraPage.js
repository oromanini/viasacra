import React, { useState, useEffect } from 'react';
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

  // Get station from URL
  useEffect(() => {
    const stationParam = parseInt(searchParams.get('station')) || 1;
    if (stationParam >= 1 && stationParam <= 14) {
      setCurrentStation(stationParam);
    }
  }, [searchParams]);

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

  const handlePrevious = () => {
    if (currentStation > 1) {
      const newStation = currentStation - 1;
      setSearchParams({ station: newStation });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentStation < 14) {
      const newStation = currentStation + 1;
      setSearchParams({ station: newStation });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Go to final page after station 14
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
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-xl text-muted-foreground">Carregando estação...</p>
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
      />
    </div>
  );
};

export default ViaSacraPage;
