import React, { useState, useEffect } from 'react';
import { Stock, PortfolioMetrics, Tab } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import HomePage from './components/pages/HomePage';
import PortfolioPage from './components/pages/PortfolioPage';
import AnalysisPage from './components/pages/AnalysisPage';
import AboutMePage from './components/pages/AboutMePage';
import { usePortfolioCalculations } from './hooks/usePortfolioCalculations';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [clientName, setClientName] = useState<string>('Your Name');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [fees, setFees] = useState<number>(0);

  useEffect(() => {
    try {
      const savedClientName = localStorage.getItem('clientName');
      const savedStocks = localStorage.getItem('stocks');
      const savedFees = localStorage.getItem('fees');

      if (savedClientName) setClientName(JSON.parse(savedClientName));
      if (savedStocks) setStocks(JSON.parse(savedStocks));
      if (savedFees) setFees(JSON.parse(savedFees));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('clientName', JSON.stringify(clientName));
    } catch (error) {
      console.error("Failed to save client name to localStorage", error);
    }
  }, [clientName]);
  
  useEffect(() => {
    try {
      localStorage.setItem('stocks', JSON.stringify(stocks));
    } catch (error) {
      console.error("Failed to save stocks to localStorage", error);
    }
  }, [stocks]);

  useEffect(() => {
    try {
      localStorage.setItem('fees', JSON.stringify(fees));
    } catch (error) {
      console.error("Failed to save fees to localStorage", error);
    }
  }, [fees]);
  
  const portfolioMetrics: PortfolioMetrics = usePortfolioCalculations(stocks, fees);

  const addStock = (stock: Stock) => {
    setStocks([...stocks, { ...stock, id: Date.now() }]);
  };

  const updateStock = (updatedStock: Stock) => {
    setStocks(stocks.map(stock => stock.id === updatedStock.id ? updatedStock : stock));
  };

  const deleteStock = (stockId: number) => {
    setStocks(stocks.filter(stock => stock.id !== stockId));
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Home:
        return <HomePage clientName={clientName} setClientName={setClientName} metrics={portfolioMetrics} />;
      case Tab.Portfolio:
        return <PortfolioPage 
                  stocks={stocks} 
                  addStock={addStock}
                  updateStock={updateStock}
                  deleteStock={deleteStock}
                  clientName={clientName}
                  fees={fees}
                  setFees={setFees}
                  metrics={portfolioMetrics}
                />;
      case Tab.Analysis:
        return <AnalysisPage stocks={stocks} clientName={clientName} metrics={portfolioMetrics} />;
      case Tab.About:
        return <AboutMePage />;
      default:
        return <HomePage clientName={clientName} setClientName={setClientName} metrics={portfolioMetrics} />;
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="mt-6 bg-navy-light p-4 sm:p-6 rounded-lg shadow-2xl">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;