import React from 'react';
import { Stock } from '../types';

interface PortfolioPieChartProps {
  stocks: Stock[];
}

// Colors for the pie chart segments
const COLORS = [
  '#06b6d4', // cyan-500
  '#22c55e', // green-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#3b82f6', // blue-500
  '#ef4444', // red-500
];

const PortfolioPieChart: React.FC<PortfolioPieChartProps> = ({ stocks }) => {
  // Correctly filter for stocks that have not been sold by checking for a sellDate.
  const heldStocks = stocks.filter(s => !s.sellDate);
  const totalValue = heldStocks.reduce((acc, stock) => acc + stock.currentPrice * stock.quantity, 0);

  if (totalValue === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-navy-dark rounded-lg">
        <p className="text-slate-400">No active holdings to display in the chart.</p>
      </div>
    );
  }

  const chartData = heldStocks.map((stock, index) => {
    const value = stock.currentPrice * stock.quantity;
    return {
      name: stock.name,
      value,
      percentage: (value / totalValue) * 100,
      color: COLORS[index % COLORS.length],
    };
  }).sort((a, b) => b.value - a.value);

  let cumulativePercentage = 0;
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 p-4">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          {chartData.map((segment) => {
            if (segment.percentage === 0) return null;
            const strokeDasharray = `${segment.percentage} ${100 - segment.percentage}`;
            const strokeDashoffset = 25 - cumulativePercentage;
            cumulativePercentage += segment.percentage;
            
            return (
              <circle
                key={segment.name}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke={segment.color}
                strokeWidth="3.8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 18 18)"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm text-slate-400">Total Value</span>
            <span className="text-xl font-bold text-white">
                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
        </div>
      </div>
      <div className="w-full">
        <ul className="space-y-2">
          {chartData.map(segment => (
            <li key={segment.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center overflow-hidden mr-2">
                <span className="block w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: segment.color }}></span>
                <span className="text-slate-300 truncate" title={segment.name}>{segment.name}</span>
              </div>
              <span className="font-semibold text-white flex-shrink-0">{segment.percentage.toFixed(2)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PortfolioPieChart;