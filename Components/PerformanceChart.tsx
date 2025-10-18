import React from 'react';
import { Stock } from '../types';

interface PerformanceChartProps {
  stocks: Stock[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ stocks }) => {
  const heldStocks = stocks.filter(s => !s.sellDate);

  if (heldStocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[16rem] bg-navy-dark rounded-lg">
        <p className="text-slate-400">No active holdings to display in the chart.</p>
      </div>
    );
  }
  
  const stocksWithPL = heldStocks.map(stock => {
    const investment = stock.buyPrice * stock.quantity;
    const pl = (stock.currentPrice - stock.buyPrice) * stock.quantity;
    const plPercent = investment > 0 ? (pl / investment) * 100 : 0;
    return { id: stock.id, name: stock.name, pl, investment, plPercent };
  });

  const maxPL = Math.max(...stocksWithPL.map(s => Math.abs(s.pl)));

  if (maxPL === 0) {
     return (
      <div className="flex items-center justify-center h-full min-h-[16rem] bg-navy-dark rounded-lg">
        <p className="text-slate-400">No profit or loss to display yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-dark p-4 rounded-lg flex flex-col">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">Profit & Loss by Stock</h3>
      <div className="flex-grow flex items-end h-64 space-x-2 md:space-x-4 overflow-x-auto p-4 justify-center">
        {stocksWithPL.map(stock => {
          // Cap bar height at 75% to ensure labels have space and don't get clipped
          const barHeight = maxPL > 0 ? (Math.abs(stock.pl) / maxPL) * 75 : 0;
          const isProfit = stock.pl >= 0;
          
          return (
            <div key={stock.id} className="flex flex-col items-center flex-shrink-0 w-16 text-center">
              <div className="relative flex items-end w-8 h-56">
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-max text-center"
                  style={{ bottom: `calc(${barHeight}% + 4px)` }}
                >
                  <div className={`font-semibold text-xs ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{stock.pl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className={`text-[10px] leading-tight ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    ({stock.plPercent.toFixed(2)}%)
                  </div>
                </div>
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ease-in-out ${isProfit ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ height: `${barHeight}%` }}
                ></div>
              </div>
              <span className="mt-2 text-xs text-slate-400 break-words">{stock.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceChart;