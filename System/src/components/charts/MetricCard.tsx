
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.FC<{ className?: string }>;
  color?: string;
  trend?: number[];
}
import React from 'react';
import { SpotlightCard } from '../SpotlightCard';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = '#3B82F6',
  trend = []
}) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const renderMiniChart = () => {
    if (trend.length === 0) return null;

    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;

    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-3">
        <svg width="60" height="20" className="opacity-60">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            points={points}
          />
        </svg>
      </div>
    );
  };

  return (
    <SpotlightCard className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
              {change}
            </div>
          )}
          {renderMiniChart()}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}15`, color: '#ffffff' }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </SpotlightCard>
  );
};
