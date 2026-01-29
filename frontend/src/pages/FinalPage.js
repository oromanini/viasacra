import React from 'react';
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
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Christ_Carrying_the_Cross_%28El_Greco%29.jpg/1280px-Christ_Carrying_the_Cross_%28El_Greco%29.jpg';

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
                  src={imageUrl}
                  alt="Cristo carregando a cruz, de El Greco."
                  className="w-full rounded-lg border border-amber-200/80 shadow-sm"
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
