import React from 'react';
import { PortfolioMetrics } from '../../types';
import MetricCard from '../MetricCard';

interface HomePageProps {
  clientName: string;
  setClientName: (name: string) => void;
  metrics: PortfolioMetrics;
}

const investorQuotes = [
  {
    quote: "The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett"
  },
  {
    quote: "Know what you own, and know why you own it.",
    author: "Peter Lynch"
  },
  {
    quote: "The intelligent investor is a realist who sells to optimists and buys from pessimists.",
    author: "Benjamin Graham"
  },
  {
    quote: "In investing, what is comfortable is rarely profitable.",
    author: "Robert Arnott"
  }
];

const HomePage: React.FC<HomePageProps> = ({ clientName, setClientName, metrics }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center">
        <label htmlFor="clientName" className="text-lg text-slate-400">Client Name</label>
        <input
          id="clientName"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="mt-1 block w-full max-w-sm mx-auto bg-navy border border-slate-600 rounded-md py-2 px-3 text-white text-center text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Total Investment" value={`₹${metrics.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={null} />
        <MetricCard label="Gross P/L" value={`₹${metrics.grossPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={metrics.grossPL >= 0} />
        <MetricCard label="Net P/L" value={`₹${metrics.netPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={metrics.netPL >= 0} />
        <MetricCard label="Portfolio CAGR" value={`${metrics.cagr.toFixed(2)}%`} isProfit={metrics.cagr >= 0} />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-center text-cyan-400 mb-4">Words of Wisdom</h3>
        <div className="space-y-4">
          {investorQuotes.slice(0, 3).map((q, index) => (
            <blockquote key={index} className="bg-navy-dark p-4 rounded-lg border-l-4 border-cyan-600">
              <p className="text-slate-300 italic">"{q.quote}"</p>
              <footer className="text-right text-slate-400 mt-2">- {q.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;