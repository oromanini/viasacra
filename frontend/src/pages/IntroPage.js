import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cross } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IntroPage = () => {
  const navigate = useNavigate();
  const [intro, setIntro] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleStart = () => {
    navigate('/via-sacra?station=1');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-accent" data-testid="intro-page">
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
            
            <div className="flex justify-center">
              <Button
                onClick={handleStart}
                size="lg"
                className="min-h-[56px] px-12 text-lg bg-primary hover:bg-primary/90"
                data-testid="start-button"
              >
                Começar Via Sacra
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntroPage;
