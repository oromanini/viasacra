import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cross, Home } from 'lucide-react';

const FinalPage = () => {
  const navigate = useNavigate();
  const reflectionText = `Concluímos juntos este caminho sagrado da Via-Sacra, acompanhando Jesus em sua Paixão, Morte e entrega total por amor. Cada estação foi um convite à conversão, à gratidão e à esperança.

A Igreja, como mãe, nos recorda que este exercício piedoso, vivido com fé e recolhimento, pode nos conceder a indulgência plenária, sinal da infinita misericórdia de Deus, que deseja nos libertar não só do pecado, mas também de suas consequências.

Que esta graça nos ajude a carregar nossas cruzes com mais amor, a perdoar com mais generosidade e a viver como verdadeiros discípulos daquele que deu a vida por nós. Que os frutos desta caminhada permaneçam em nossos corações e se traduzam em caridade no dia a dia. ✝️`;
  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/5/5d/Christ_Carrying_the_Cross_%28El_Greco%29.jpg';
  const fallbackImageUrl =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fff7ed"/>
            <stop offset="100%" stop-color="#fde68a"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" rx="48" fill="url(#bg)"/>
        <g fill="none" stroke="#b45309" stroke-width="12" stroke-linecap="round">
          <path d="M600 180v360" />
          <path d="M470 320h260" />
        </g>
        <text x="600" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#7c2d12">
          Cristo carregando a cruz
        </text>
        <text x="600" y="610" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#9a3412">
          El Greco
        </text>
      </svg>
    `);
  const [imageSrc, setImageSrc] = useState(imageUrl);

  const handleReturnHome = () => {
    navigate('/');
  };

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
            Mensagem Final
          </p>
        </div>

        {/* Final Message */}
        <Card className="shadow-lg border-border" data-testid="final-message-card">
          <CardContent className="p-8 md:p-12 space-y-8">
            <div className="space-y-4 text-lg leading-relaxed whitespace-pre-line" data-testid="final-message-text">
              {reflectionText}
            </div>
            <figure className="space-y-3" data-testid="final-message-image">
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 shadow-sm">
                <img
                  src={imageSrc}
                  alt="Cristo carregando a cruz, de El Greco."
                  className="w-full rounded-lg border border-amber-200/80 shadow-sm"
                  onError={() => {
                    if (imageSrc !== fallbackImageUrl) {
                      setImageSrc(fallbackImageUrl);
                    }
                  }}
                />
              </div>
              <figcaption className="text-sm text-muted-foreground">
                🔹 Cristo carregando a cruz – El Greco
              </figcaption>
            </figure>
          </CardContent>
        </Card>

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
