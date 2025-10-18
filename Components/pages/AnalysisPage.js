import React, { useMemo } from 'react';
import PortfolioPieChart from '../PortfolioPieChart.js';
import PerformanceChart from '../PerformanceChart.js';

const renderMarkdownList = (items) => {
  if (!items || items.length === 0) return null;
  return React.createElement('ul', { className: 'list-disc list-inside space-y-1' },
    ...items.map((item, index) => React.createElement('li', { key: index }, item))
  );
};

const AnalysisPage = ({ stocks, clientName, metrics }) => {
  const heldStocks = stocks.filter(s => !s.sellDate);

  const analysis = useMemo(() => {
    if (heldStocks.length === 0) {
      return {
        portfolioHealthScore: 0,
        keyObservations: ["No active stocks in the portfolio to analyze."],
        actionableInsights: ["Add stocks to your portfolio to generate a report."],
      };
    }

    let score = 50;
    const observations = [];
    const insights = [];

    // Metric 1: Profitability
    if (metrics.netPL > 0) {
      score += 15;
      observations.push(`The portfolio has a positive Net P/L of ₹${metrics.netPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}, which is a good sign of overall performance.`);
    } else {
      score -= 10;
      observations.push(`The portfolio currently has a Net P/L of ₹${metrics.netPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`);
    }

    // Metric 2: CAGR
    if (metrics.cagr > 15) {
      score += 15;
      insights.push(`A CAGR of ${metrics.cagr.toFixed(2)}% is excellent. Continue your current strategy while monitoring market conditions.`);
    } else if (metrics.cagr > 8) {
      score += 5;
      insights.push(`A CAGR of ${metrics.cagr.toFixed(2)}% indicates steady growth. Review your holdings to identify opportunities for optimization.`);
    } else {
       insights.push(`The current CAGR is ${metrics.cagr.toFixed(2)}%. Consider re-evaluating underperforming assets to boost long-term growth.`);
    }

    // Metric 3: Diversification
    const totalValue = heldStocks.reduce((acc, stock) => acc + stock.currentPrice * stock.quantity, 0);
    const stockConcentrations = heldStocks.map(s => ({ name: s.name, percentage: (s.currentPrice * s.quantity / totalValue) * 100 }));
    const mostConcentrated = stockConcentrations.sort((a,b) => b.percentage - a.percentage)[0];

    if (heldStocks.length < 3) {
      score -= 10;
      observations.push(`The portfolio is highly concentrated with only ${heldStocks.length} stock(s).`);
      insights.push("Consider adding more stocks from different sectors to improve diversification and reduce risk.");
    } else if (mostConcentrated && mostConcentrated.percentage > 40) {
      score -= 5;
      observations.push(`High concentration in ${mostConcentrated.name}, which makes up ${mostConcentrated.percentage.toFixed(2)}% of your holdings.`);
      insights.push("High concentration can increase risk. Consider rebalancing to reduce dependency on a single stock's performance.");
    } else {
      score += 10;
      observations.push(`The portfolio shows good diversification across ${heldStocks.length} stocks.`);
    }

    // Metric 4: Top/Bottom Performers
    const stocksWithPL = heldStocks.map(stock => {
        const pl = (stock.currentPrice - stock.buyPrice) * stock.quantity;
        return { name: stock.name, pl };
    }).sort((a,b) => b.pl - a.pl);

    if (stocksWithPL.length > 0) {
        const bestPerformer = stocksWithPL[0];
        const worstPerformer = stocksWithPL[stocksWithPL.length - 1];
        if (bestPerformer.pl > 0) {
            observations.push(`Your top performer is ${bestPerformer.name} with a profit of ₹${bestPerformer.pl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`);
        }
        if (worstPerformer.pl < 0) {
            insights.push(`Review your position in ${worstPerformer.name}, which is the largest detractor with a loss of ₹${worstPerformer.pl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`);
        }
    }


    return {
      portfolioHealthScore: Math.max(0, Math.min(100, Math.round(score))),
      keyObservations: observations,
      actionableInsights: insights,
    };
  }, [stocks, metrics]);

  const handleExportWord = () => {
    const listToHtml = (items) => {
      if (!items || items.length === 0) return '';
      return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
  
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Portfolio Analysis Report</title></head>
      <body>
        <h1>Portfolio Analysis Report for ${clientName}</h1>
        <h2>Portfolio Health Score: ${analysis.portfolioHealthScore} / 100</h2>
        <hr/>
        <h3>Key Observations</h3>
        ${listToHtml(analysis.keyObservations)}
        <br/>
        <h3>Actionable Insights</h3>
        ${listToHtml(analysis.actionableInsights)}
        <br/>
        <p><i>Disclaimer: This report is generated based on portfolio data and is not financial advice.</i></p>
      </body>
      </html>
    `;
  
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Portfolio_Analysis_Report.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const scoreColor = (score) => {
    if (score > 75) return 'text-green-400';
    if (score > 50) return 'text-yellow-400';
    return 'text-red-400';
  }

  const renderAnalysisReport = () => React.createElement('div', { className: "bg-navy-dark p-6 rounded-lg shadow-2xl" },
    React.createElement('h3', { className: "text-2xl font-bold text-cyan-400 mb-6 text-center" }, "Portfolio Performance Report"),
    React.createElement('div', { className: "text-left space-y-6" },
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8" },
        React.createElement('div', { className: "bg-navy p-6 rounded-lg flex flex-col items-center justify-center text-center shadow-inner" },
          React.createElement('h4', { className: "text-lg font-semibold text-slate-300 mb-2" }, "Portfolio Health Score"),
          React.createElement('p', { className: `text-6xl font-bold ${scoreColor(analysis.portfolioHealthScore)}` },
            analysis.portfolioHealthScore,
            React.createElement('span', { className: "text-4xl text-slate-400" }, "/100")
          )
        ),
        React.createElement('div', { className: "md:col-span-2 bg-navy p-6 rounded-lg shadow-inner space-y-4" },
          React.createElement('div', null,
            React.createElement('h4', { className: "text-lg font-semibold text-cyan-500 mb-2" }, "Key Observations"),
            React.createElement('div', { className: "text-slate-300 max-w-none" },
              renderMarkdownList(analysis.keyObservations)
            )
          ),
          React.createElement('div', { className: "border-t border-slate-700 my-4" }),
          React.createElement('div', null,
            React.createElement('h4', { className: "text-lg font-semibold text-cyan-500 mb-2" }, "Actionable Insights"),
            React.createElement('div', { className: "text-slate-300 max-w-none" },
              renderMarkdownList(analysis.actionableInsights)
            )
          )
        )
      ),
      heldStocks.length > 0 && React.createElement('div', { className: "text-center pt-4" },
        React.createElement('button', {
          onClick: handleExportWord,
          className: "bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition duration-300 shadow-md"
        }, "Export Report to Word")
      )
    )
  );

  return React.createElement('div', { className: "space-y-8 animate-fadeIn" },
    React.createElement('h2', { className: "text-3xl font-bold text-white text-center" }, "Portfolio Analysis"),
    React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
      React.createElement('div', { className: "bg-navy-light p-4 rounded-lg shadow-lg" },
        React.createElement('h3', { className: "text-lg font-semibold text-cyan-400 mb-4 text-center" }, "Asset Allocation"),
        React.createElement(PortfolioPieChart, { stocks: stocks })
      ),
      React.createElement('div', { className: "bg-navy-light p-4 rounded-lg shadow-lg" },
        React.createElement('h3', { className: "text-lg font-semibold text-cyan-400 mb-4 text-center" }, "Profit & Loss by Stock"),
        React.createElement(PerformanceChart, { stocks: stocks })
      )
    ),
    renderAnalysisReport()
  );
};

export default AnalysisPage;