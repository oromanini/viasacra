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
    <div className="min-h-screen pb-24" data-testid="via-sacra-page">
      {/* Header with map */}
      <div className="bg-card border-b border-border shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <ViaMap currentStation={currentStation} totalStations={14} />
        </div>
      </div>

      {/* Station content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-xl text-muted-foreground">Carregando estação...</p>
          </div>
        ) : (
          <StationCard station={stationData} />
        )}
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
