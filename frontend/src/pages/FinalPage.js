import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cross, Home } from 'lucide-react';

const FinalPage = () => {
  const navigate = useNavigate();
  const reflectionText = `Oração final a Jesus crucificado. — Eis-me aqui, ó meu bom e dulcíssimo Jesus! Humildemente prostrado de joelhos em vossa presença, peço e suplico-vos, com todo o fervor de minha alma, que vos digneis gravar em meu coração os mais vivos sentimentos de fé, esperança e caridade, de verdadeiro arrependimento de meus pecados, e um firme propósito de emendar-me, enquanto vou considerando, com vivo afeto e dor, as vossas cinco chagas, tendo presentes as palavras que já o profeta Davi punha em vossa boca, ó bom Jesus: “Transpassaram minhas mãos e os meus pés e contaram todos os meus ossos” (Sl 21, 17).

A Nossa Senhora das Dores. — Ó Mãe das Dores, Rainha dos mártires, que tanto chorastes vosso Filho, morto para me salvar, alcançai-me uma verdadeira contrição dos meus pecados e uma sincera mudança de vida. Mãe, pela dor que experimentastes quando vosso divino Filho, no meio de tantos tormentos, inclinando a cabeça expirou à vossa vista sobre a cruz, eu vos suplico que me alcanceis uma boa morte. Por piedade, ó advogada dos pecadores, não deixeis de amparar a minha alma na aflição e no combate da terrível passagem desta vida à eternidade. E, como é possível que, neste momento, a palavra e a voz me faltem para pronunciar o vosso nome e o de Jesus, rogo-vos, desde já, a vós e a vosso divino Filho, que me socorrais nessa hora extrema, e assim direi: Jesus e Maria, entrego-vos a minha alma. Amém.`;
  const handleReturnHome = () => {
    navigate('/?completed=1');
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
          <p className="text-xl text-muted-foreground">Orações finais</p>
        </div>

        {/* Final Message */}
        <Card className="shadow-lg border-border" data-testid="final-message-card">
          <CardContent className="p-8 md:p-12 space-y-8">
            <div className="space-y-4 text-lg leading-relaxed whitespace-pre-line" data-testid="final-message-text">
              {reflectionText}
            </div>
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
            Concluir orações e voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalPage;
