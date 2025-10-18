import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  isProfit: boolean | null;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, isProfit, className = '' }) => {
  const valueColor = isProfit === null ? 'text-white' : isProfit ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`bg-navy-dark p-4 rounded-lg shadow-lg flex flex-col items-center justify-center text-center ${className}`}>
      <span className="text-sm text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-bold mt-1 ${valueColor}`}>
        {value}
      </span>
    </div>
  );
};

export default MetricCard;