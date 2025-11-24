import React from 'react';
import { LucideIcon } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <SpotlightCard className={`rounded-xl shadow p-6 flex items-center gap-4 ${color}`}>
    <div className="text-3xl text-drivecash-blue"><Icon /></div>
    <div>
      <div className="text-lg font-semibold text-drivecash-blue">{title}</div>
      <div className="text-2xl font-bold text-drivecash-gray">{value}</div>
    </div>
  </SpotlightCard>
);
