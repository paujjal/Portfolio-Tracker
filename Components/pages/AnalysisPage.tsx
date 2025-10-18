import React, { useState, useEffect, useCallback } from 'react';
import { Stock, PortfolioMetrics, AIAnalysis } from '../../types';
import { getPortfolioAnalysis } from '../../services/geminiService';
import MetricCard from '../MetricCard';
import PortfolioPieChart from '../PortfolioPieChart';
import PerformanceChart from '../PerformanceChart';

interface AnalysisPageProps {
  clientName: string;
  metrics: PortfolioMetrics;
  stocks: Stock[];
}

interface ReportData {
  analysis: AIAnalysis | null;
  topWinners: StockPL[];
  topLosers: StockPL[];
}

interface StockPL {
  name: string;
  pl: number;
  plPercent: number;
}

const DetailedReportModal: React.FC<{ reportData: ReportData; onClose: () => void; stocks: Stock[]; clientName: string; metrics: PortfolioMetrics; }> = ({ reportData, onClose, stocks, clientName, metrics }) => {
  const exportWord = () => {
    const { analysis, topWinners, topLosers } = reportData;

    if (!analysis) {
        alert("Cannot generate report without analysis data.");
        return;
    }

    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Portfolio Report</title></head>
        <body>
            <div style="font-family: Arial, sans-serif; font-size: 11pt;">
                <h1 style="text-align: center; color: #0f172a;">Portfolio Report</h1>
                <p style="text-align: center;">For: <strong>${clientName}</strong></p>
                <p style="text-align: center; font-size: 9pt; color: #64748b;">Generated on: ${new Date().toLocaleDateString()}</p>
                
                <h2 style="color: #0e7490; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Portfolio Summary</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="background-color: #f1f5f9;">
                        <td style="border: 1px solid #e2e8f0; padding: 8px;">Total Investment</td>
                        <td style="border: 1px solid #e2e8f0; padding: 8px;">₹${metrics.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 8px;">Current Value</td>
                        <td style="border: 1px solid #e2e8f0; padding: 8px;">₹${metrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr style="background-color: #f1f5f9;">
                        <td style="border: 1px solid #e2e8f0; padding: 8px;">Net P/L</td>
                        <td style="border: 1px solid #e2e8f0; padding: 8px; color: ${metrics.netPL >= 0 ? '#166534' : '#991b1b'}; font-weight: bold;">₹${metrics.netPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 8px;">Portfolio CAGR</td>
                        <td style="border: 1px solid #e2e8f0; padding: 8px; color: ${metrics.cagr >= 0 ? '#166534' : '#991b1b'}; font-weight: bold;">${metrics.cagr.toFixed(2)}%</td>
                    </tr>
                </table>

                <h2 style="color: #0e7490; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Profit & Loss Breakdown</h2>
                <h3 style="color: #16a34a;">Top 3 Winners</h3>
                ${topWinners.length > 0 ? topWinners.map(s => `<p style="margin: 5px 0;"><strong>${s.name}:</strong> +₹${s.pl.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${s.plPercent.toFixed(2)}%)</p>`).join('') : '<p>No profitable positions.</p>'}
                
                <h3 style="color: #dc2626;">Top 3 Losers</h3>
                ${topLosers.length > 0 ? topLosers.map(s => `<p style="margin: 5px 0;"><strong>${s.name}:</strong> -₹${Math.abs(s.pl).toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${s.plPercent.toFixed(2)}%)</p>`).join('') : '<p>No losing positions.</p>'}
                
                <h2 style="color: #0e7490; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px;">AI-Powered Analysis</h2>
                <p><strong>Portfolio Health Score:</strong> <span style="font-size: 14pt; color: #06b6d4; font-weight: bold;">${analysis.portfolioHealthScore}/10</span></p>
                <h3>Key Observations</h3>
                <div style="background-color: #f1f5f9; padding: 10px; border-radius: 5px; margin-bottom: 15px;">${analysis.keyObservations.replace(/\n/g, '<br />')}</div>
                <h3>Actionable Insights</h3>
                <div style="background-color: #f1f5f9; padding: 10px; border-radius: 5px;">${analysis.actionableInsights.replace(/\n/g, '<br />')}</div>
            </div>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'portfolio_report.doc');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-navy-light rounded-lg shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto printable-area">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Portfolio Report</h2>
            <p className="text-slate-400">For: {clientName}</p>
            <p className="text-slate-500 text-sm">Generated on: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Total Investment" value={`₹${metrics.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={null} />
                <MetricCard label="Current Value" value={`₹${metrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={null} />
                <MetricCard label="Net P/L" value={`₹${metrics.netPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={metrics.netPL >= 0} />
                <MetricCard label="Portfolio CAGR" value={`${metrics.cagr.toFixed(2)}%`} isProfit={metrics.cagr >= 0} />
            </div>

           <div>
            <h3 className="text-xl font-semibold text-cyan-400 border-b border-slate-700 pb-2 mb-3">
              Portfolio Composition
            </h3>
            <PortfolioPieChart stocks={stocks} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-cyan-400 border-b border-slate-700 pb-2 mb-3">
              Profit & Loss Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Top 3 Winners</h4>
                    {reportData.topWinners.length > 0 ? reportData.topWinners.map((stock, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-navy-dark rounded mb-2">
                        <span className="font-medium text-white">{stock.name}</span>
                        <span className="text-green-400 font-semibold">
                        +₹{stock.pl.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({stock.plPercent.toFixed(2)}%)
                        </span>
                    </div>
                    )) : <p className="text-slate-400">No profitable positions.</p>}
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Top 3 Losers</h4>
                    {reportData.topLosers.length > 0 ? reportData.topLosers.map((stock, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-navy-dark rounded mb-2">
                        <span className="font-medium text-white">{stock.name}</span>
                        <span className="text-red-400 font-semibold">
                        -₹{Math.abs(stock.pl).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({stock.plPercent.toFixed(2)}%)
                        </span>
                    </div>
                    )) : <p className="text-slate-400">No losing positions.</p>}
                </div>
            </div>
          </div>
          
          {reportData.analysis && (
            <>
                <div>
                    <h3 className="text-xl font-semibold text-cyan-400 border-b border-slate-700 pb-2 mb-3">AI-Powered Analysis</h3>
                    <div className="flex items-center gap-4 bg-navy-dark p-4 rounded-lg">
                        <span className="text-base text-slate-300">Portfolio Health Score:</span>
                        <span className="text-3xl font-bold text-cyan-400">{reportData.analysis.portfolioHealthScore}/10</span>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">Key Observations</h4>
                    <p className="text-slate-300 whitespace-pre-wrap bg-navy-dark p-4 rounded-lg">{reportData.analysis.keyObservations}</p>
                </div>
                
                <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">Actionable Insights</h4>
                    <p className="text-slate-300 whitespace-pre-wrap bg-navy-dark p-4 rounded-lg">{reportData.analysis.actionableInsights}</p>
                </div>
            </>
          )}

        </div>

        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-700 no-print">
          <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition duration-300">Close</button>
          <button onClick={exportWord} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition duration-300">Download Word</button>
        </div>
      </div>
    </div>
  );
};


const AnalysisPage: React.FC<AnalysisPageProps> = ({ clientName, metrics, stocks }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReportVisible, setIsReportVisible] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (stocks.length > 0) {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPortfolioAnalysis(stocks);
        setAnalysis(result);
      } catch (err) {
        setError("Failed to fetch analysis.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
        setAnalysis(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(stocks)]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const getReportData = (): ReportData => {
    const stocksWithPL = stocks
      .filter(s => !s.sellDate) // Correctly filter for held stocks
      .map(stock => {
        const investment = stock.buyPrice * stock.quantity;
        const pl = (stock.currentPrice - stock.buyPrice) * stock.quantity;
        const plPercent = investment > 0 ? (pl / investment) * 100 : 0;
        return { name: stock.name, pl, plPercent };
      });
    
    const topWinners = [...stocksWithPL].filter(s => s.pl > 0).sort((a, b) => b.pl - a.pl).slice(0, 3);
    const topLosers = [...stocksWithPL].filter(s => s.pl < 0).sort((a, b) => a.pl - b.pl).slice(0, 3);

    return {
      topWinners,
      topLosers,
      analysis,
    };
  };

  return (
    <div className="space-y-8">
      <div className="bg-navy p-4 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold text-white mb-4">{clientName}'s Analysis</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Investment" value={`₹${metrics.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={null} />
          <MetricCard label="Current Value" value={`₹${metrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={null} />
          <MetricCard label="Net P/L" value={`₹${metrics.netPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} isProfit={metrics.netPL >= 0} />
          <MetricCard label="Portfolio CAGR" value={`${metrics.cagr.toFixed(2)}%`} isProfit={metrics.cagr >= 0} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-navy-dark p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4 text-center">Portfolio Composition</h3>
          <PortfolioPieChart stocks={stocks} />
        </div>
        <div className="bg-navy-dark p-6 rounded-lg shadow-lg">
          <PerformanceChart stocks={stocks} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <div role="status" className="flex justify-center items-center">
            <svg aria-hidden="true" className="w-8 h-8 text-slate-600 animate-spin fill-cyan-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-lg text-cyan-400 mt-4">Generating AI-powered analysis...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-900 bg-opacity-50 rounded-lg">
          <p className="text-lg text-red-400">{error}</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6 bg-navy-dark p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-cyan-400 mb-2 sm:mb-0">AI-Powered Analysis</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Portfolio Health Score</span>
                    <span className="text-2xl font-bold text-cyan-400">{analysis.portfolioHealthScore}/10</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">Key Observations</h4>
                    <div className="bg-navy p-4 rounded-lg h-full">
                        <p className="text-slate-300 whitespace-pre-wrap">{analysis.keyObservations}</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">Actionable Insights</h4>
                    <div className="bg-navy p-4 rounded-lg h-full">
                        <p className="text-slate-300 whitespace-pre-wrap">{analysis.actionableInsights}</p>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-navy-dark rounded-lg">
            <p className="text-slate-400">Add stocks to your portfolio to generate an analysis.</p>
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <button
            onClick={() => setIsReportVisible(true)}
            disabled={isLoading || !analysis || stocks.length === 0}
            className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 transition duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed shadow-lg"
        >
            Show Detailed Report
        </button>
      </div>

      {isReportVisible && <DetailedReportModal reportData={getReportData()} onClose={() => setIsReportVisible(false)} stocks={stocks} clientName={clientName} metrics={metrics} />}
    </div>
  );
};

export default AnalysisPage;