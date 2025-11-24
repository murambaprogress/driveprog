import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title, 
  color = '#3B82F6',
  height = 200 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            fill={`url(#gradient-${title})`}
            points={`0,100 ${points} 100,100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-between text-xs text-gray-500 px-2 pb-2">
          {data.map((point, index) => (
            <div key={index} className="text-center">
              <div className="font-medium text-gray-900">{point.value}</div>
              <div>{point.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
