import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const StationCard = ({ station }) => {
  if (!station) return null;

  return (
    <Card className="w-full shadow-lg border-border" data-testid="station-card">
      <CardHeader className="p-0">
        <div className="w-full h-64 overflow-hidden rounded-t-lg">
          <img
            src={station.image_url}
            alt={station.title}
            className="w-full h-full object-cover"
            data-testid="station-image"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 space-y-6">
        {/* Title */}
        <h2 
          className="heading-font text-2xl md:text-3xl font-bold text-primary text-center"
          data-testid="station-title"
        >
          {station.title}
        </h2>

        {/* Versicle */}
        <div className="bg-accent p-4 rounded-lg border border-border" data-testid="station-versicle">
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {station.versicle}
          </p>
        </div>

        {/* Meditation */}
        <div data-testid="station-meditation">
          <h3 className="heading-font text-xl font-semibold text-primary mb-3">
            Meditação
          </h3>
          <p className="text-lg leading-relaxed">
            {station.meditation}
          </p>
        </div>

        {/* Prayer */}
        <div data-testid="station-prayer">
          <h3 className="heading-font text-xl font-semibold text-primary mb-3">
            Oração
          </h3>
          <p className="text-lg leading-relaxed">
            {station.prayer}
          </p>
        </div>

        {/* Standard Prayers */}
        <div className="bg-muted p-4 rounded-lg" data-testid="station-standard-prayers">
          <p className="text-lg font-semibold text-muted-foreground italic">
            {station.standard_prayers}
          </p>
        </div>

        {/* Hymn */}
        <div data-testid="station-hymn">
          <h3 className="heading-font text-xl font-semibold text-primary mb-3">
            Hino
          </h3>
          <p className="text-lg leading-relaxed whitespace-pre-line italic text-muted-foreground">
            {station.hymn}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StationCard;
