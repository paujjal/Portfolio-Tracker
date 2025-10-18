import { useMemo } from 'react';
import { Stock, PortfolioMetrics } from '../types';

export const usePortfolioCalculations = (stocks: Stock[], fees: number): PortfolioMetrics => {
  return useMemo(() => {
    const totalInvestment = stocks.reduce((acc, stock) => {
      return acc + stock.buyPrice * stock.quantity;
    }, 0);

    let grossPL = 0;
    let currentValue = 0;

    stocks.forEach(stock => {
      if (stock.sellPrice && stock.sellDate) {
        // Realized P/L
        grossPL += (stock.sellPrice - stock.buyPrice) * stock.quantity;
        // Sold stocks don't contribute to current value, but their cost basis is part of totalInvestment
      } else {
        // Unrealized P/L
        grossPL += (stock.currentPrice - stock.buyPrice) * stock.quantity;
        currentValue += stock.currentPrice * stock.quantity;
      }
    });
    
    // For sold stocks, their original investment is part of totalInvestment, but not part of currentValue
    // We must add the cash received from sale to the current value
    const cashFromSales = stocks
      .filter(s => s.sellPrice && s.sellDate)
      .reduce((acc, s) => acc + (s.sellPrice! * s.quantity), 0);

    const portfolioCurrentValue = currentValue + cashFromSales;

    const netPL = grossPL - fees;

    let cagr = 0;
    if (totalInvestment > 0 && stocks.length > 0) {
      const earliestDate = stocks.reduce((earliest, stock) => {
        const stockDate = new Date(stock.purchaseDate);
        return stockDate < earliest ? stockDate : earliest;
      }, new Date());
      
      const years = (new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      
      if (years > 0) {
        const finalValue = totalInvestment + grossPL;
        cagr = (Math.pow(finalValue / totalInvestment, 1 / years) - 1) * 100;
      }
    }

    return {
      totalInvestment,
      grossPL,
      netPL,
      cagr: isNaN(cagr) || !isFinite(cagr) ? 0 : cagr,
      currentValue: portfolioCurrentValue
    };
  }, [stocks, fees]);
};