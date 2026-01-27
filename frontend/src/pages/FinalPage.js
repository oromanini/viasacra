import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cross, Home } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FinalPage = () => {
  const navigate = useNavigate();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinalPrayers = async () => {
      try {
        const response = await axios.get(`${API}/final-prayers`);
        setPrayers(response.data);
      } catch (error) {
        console.error('Error fetching final prayers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalPrayers();
  }, []);

  const handleReturnHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6" data-testid="final-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-full p-6">
              <Cross size={48} className="text-primary-foreground" />
            </div>
          </div>
          <h1 className="heading-font text-4xl md:text-5xl font-bold text-primary mb-4" data-testid="final-title">
            Via Sacra Concluída
          </h1>
          <p className="text-xl text-muted-foreground">
            Orações Finais
          </p>
        </div>

        {/* Final Prayers */}
        <div className="space-y-8">
          {prayers.map((prayer, index) => (
            <Card key={index} className="shadow-lg border-border" data-testid={`final-prayer-${index}`}>
              <CardContent className="p-8 md:p-12">
                <h2 className="heading-font text-2xl font-bold text-primary mb-6" data-testid={`final-prayer-title-${index}`}>
                  {prayer.title}
                </h2>
                <p className="text-lg leading-relaxed" data-testid={`final-prayer-text-${index}`}>
                  {prayer.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Return button */}
        <div className="mt-12 text-center">
          <Button
            onClick={handleReturnHome}
            size="lg"
            variant="outline"
            className="min-h-[56px] px-12 text-lg"
            data-testid="return-home-button"
          >
            <Home className="mr-2 h-5 w-5" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalPage;
