import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = ({ currentStation, totalStations, onPrevious, onNext }) => {
  const hasPrevious = currentStation > 1;
  const hasNext = currentStation < totalStations;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50"
      data-testid="navigation-bar"
    >
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Button
          onClick={onPrevious}
          disabled={!hasPrevious}
          variant="outline"
          size="lg"
          className="min-h-[48px] flex-1 max-w-[200px]"
          data-testid="previous-button"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Anterior
        </Button>

        <div className="text-center" data-testid="station-counter">
          <p className="text-sm text-muted-foreground">Estação</p>
          <p className="heading-font text-2xl font-bold text-primary">
            {currentStation} / {totalStations}
          </p>
        </div>

        <Button
          onClick={onNext}
          disabled={!hasNext}
          size="lg"
          className="min-h-[48px] flex-1 max-w-[200px] bg-primary hover:bg-primary/90"
          data-testid="next-button"
        >
          Próxima
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
