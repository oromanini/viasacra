import React from 'react';
import { User } from 'lucide-react';

const ViaMap = ({ currentStation, totalStations = 14 }) => {
  // Define path points for a winding path
  const pathPoints = [
    { x: 50, y: 50 },    // Station 1
    { x: 150, y: 80 },   // Station 2
    { x: 250, y: 60 },   // Station 3
    { x: 350, y: 90 },   // Station 4
    { x: 450, y: 70 },   // Station 5
    { x: 520, y: 130 },  // Station 6
    { x: 480, y: 200 },  // Station 7
    { x: 400, y: 250 },  // Station 8
    { x: 300, y: 230 },  // Station 9
    { x: 200, y: 260 },  // Station 10
    { x: 120, y: 220 },  // Station 11
    { x: 80, y: 150 },   // Station 12
    { x: 150, y: 150 },  // Station 13
    { x: 250, y: 170 }   // Station 14
  ];

  // Create SVG path
  const pathD = pathPoints.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  const getNodeStatus = (stationId) => {
    if (stationId === currentStation) return 'active';
    if (stationId < currentStation) return 'completed';
    return 'locked';
  };

  return (
    <div className="w-full" data-testid="via-map">
      <svg 
        viewBox="0 0 600 320" 
        className="w-full h-auto"
        style={{ maxHeight: '400px' }}
      >
        {/* Background path */}
        <path
          d={pathD}
          fill="none"
          stroke="#E6E0D4"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Completed path */}
        {currentStation > 1 && (
          <path
            d={pathPoints.slice(0, currentStation).map((point, index) => {
              if (index === 0) return `M ${point.x} ${point.y}`;
              return `L ${point.x} ${point.y}`;
            }).join(' ')}
            fill="none"
            stroke="#4B0082"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Station nodes */}
        {pathPoints.map((point, index) => {
          const stationId = index + 1;
          const status = getNodeStatus(stationId);
          
          return (
            <g key={stationId}>
              {/* Node circle */}
              <circle
                cx={point.x}
                cy={point.y}
                r={status === 'active' ? 18 : 14}
                fill={
                  status === 'active' ? '#D4AF37' : 
                  status === 'completed' ? '#4B0082' : 
                  '#9CA3AF'
                }
                stroke={status === 'active' ? '#B8952E' : 'none'}
                strokeWidth={status === 'active' ? 2 : 0}
                className={status === 'active' ? 'animate-pulse' : ''}
              />
              
              {/* Station number */}
              <text
                x={point.x}
                y={point.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="700"
                fontFamily="Lato, sans-serif"
              >
                {stationId}
              </text>
            </g>
          );
        })}

        {/* Character avatar at current station */}
        {currentStation > 0 && currentStation <= 14 && (
          <g>
            <circle
              cx={pathPoints[currentStation - 1].x}
              cy={pathPoints[currentStation - 1].y - 35}
              r={16}
              fill="#4B0082"
              opacity="0.9"
            />
            <foreignObject
              x={pathPoints[currentStation - 1].x - 12}
              y={pathPoints[currentStation - 1].y - 47}
              width="24"
              height="24"
            >
              <User size={24} color="white" />
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  );
};

export default ViaMap;
