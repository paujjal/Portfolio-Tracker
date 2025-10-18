import React, { useState } from 'react';
import { Stock, PortfolioMetrics } from '../../types';
import StockModal from '../StockModal';

interface PortfolioPageProps {
  stocks: Stock[];
  addStock: (stock: Stock) => void;
  updateStock: (stock: Stock) => void;
  deleteStock: (stockId: number) => void;
  clientName: string;
  fees: number;
  setFees: (fees: number) => void;
  metrics: PortfolioMetrics;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ stocks, addStock, updateStock, deleteStock, clientName, fees, setFees, metrics }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  const handleAddStock = () => {
    setEditingStock(null);
    setIsModalOpen(true);
  };

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setIsModalOpen(true);
  };

  const handleSaveStock = (stock: Stock) => {
    if (stock.id) {
      updateStock(stock);
    } else {
      addStock(stock);
    }
    setIsModalOpen(false);
  };

  const downloadExcel = () => {
    if (stocks.length === 0) {
      alert("No stocks to download.");
      return;
    }

    const headers = [
      "Stock Name",
      "Quantity",
      "Buy Price",
      "Purchase Date",
      "Current Price",
      "Sell Price",
      "Sell Date",
    ];

    const formatCurrency = (value: number) => `"${value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}"`;
    
    const summaryData = [
      `Client Name:,${clientName}`,
      `Total Investment:,${formatCurrency(metrics.totalInvestment)}`,
      `Gross P/L:,${formatCurrency(metrics.grossPL)}`,
      `Net P/L:,${formatCurrency(metrics.netPL)}`,
      `Portfolio CAGR:,${metrics.cagr.toFixed(2)}%`
    ].join('\n');

    const stockData = stocks.map(stock => [
        `"${stock.name.replace(/"/g, '""')}"`,
        stock.quantity,
        stock.buyPrice,
        stock.purchaseDate,
        stock.currentPrice,
        stock.sellPrice || '',
        stock.sellDate || ''
      ].join(',')
    );

    const csvContent = `${summaryData}\n\n${headers.join(',')}\n${stockData.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-t;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'portfolio_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={handleAddStock}
            className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition duration-300 shadow-md"
          >
            Add Stock
          </button>
          <button
            onClick={downloadExcel}
            className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition duration-300 shadow-md"
          >
            Download Excel
          </button>
        </div>
      </div>
      
      <div className="bg-navy p-4 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold text-white mb-4">{clientName}'s Portfolio Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-navy-dark p-3 rounded-lg text-center">
                <div className="text-sm text-slate-400">Total Investment</div>
                <div className="text-xl font-semibold">₹{metrics.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-navy-dark p-3 rounded-lg text-center">
                <div className="text-sm text-slate-400">Gross P/L</div>
                <div className={`text-xl font-semibold ${metrics.grossPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{metrics.grossPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-navy-dark p-3 rounded-lg text-center">
                <div className="text-sm text-slate-400">Fees</div>
                <input 
                    type="number"
                    value={fees}
                    onChange={(e) => setFees(Number(e.target.value))}
                    className="bg-navy-light w-full text-center text-xl font-semibold text-white p-0 m-0 border-0 focus:ring-0"
                />
            </div>
            <div className="bg-navy-dark p-3 rounded-lg text-center">
                <div className="text-sm text-slate-400">Net P/L</div>
                <div className={`text-xl font-semibold ${metrics.netPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{metrics.netPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-navy-dark p-3 rounded-lg text-center">
                <div className="text-sm text-slate-400">Portfolio CAGR</div>
                <div className={`text-xl font-semibold ${metrics.cagr >= 0 ? 'text-green-400' : 'text-red-400'}`}>{metrics.cagr.toFixed(2)}%</div>
            </div>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-navy-dark rounded-lg shadow-lg">
        <table className="min-w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-cyan-400 uppercase bg-navy">
            <tr>
              <th scope="col" className="px-6 py-3">Stock Name</th>
              <th scope="col" className="px-6 py-3">Quantity</th>
              <th scope="col" className="px-6 py-3">Buy Price</th>
              <th scope="col" className="px-6 py-3">Purchase Date</th>
              <th scope="col" className="px-6 py-3">Current Price</th>
              <th scope="col" className="px-6 py-3">P/L</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => {
              const pl = (stock.currentPrice - stock.buyPrice) * stock.quantity;
              const isProfit = pl >= 0;
              return (
                <tr key={stock.id} className="bg-navy-light border-b border-slate-800 hover:bg-navy">
                  <td className="px-6 py-4 font-medium text-white">{stock.name}</td>
                  <td className="px-6 py-4">{stock.quantity}</td>
                  <td className="px-6 py-4">₹{stock.buyPrice.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">{stock.purchaseDate}</td>
                  <td className="px-6 py-4">₹{stock.currentPrice.toLocaleString('en-IN')}</td>
                  <td className={`px-6 py-4 font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{pl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditStock(stock)} className="font-medium text-cyan-400 hover:underline mr-4">Edit</button>
                    <button onClick={() => deleteStock(stock.id)} className="font-medium text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              );
            })}
            {stocks.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No stocks added yet. Click 'Add Stock' to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <StockModal
          stock={editingStock}
          onSave={handleSaveStock}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PortfolioPage;