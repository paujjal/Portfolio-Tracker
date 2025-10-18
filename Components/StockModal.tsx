import React, { useState, useEffect } from 'react';
import { Stock } from '../types';

interface StockModalProps {
  stock: Stock | null;
  onSave: (stock: Stock) => void;
  onClose: () => void;
}

const StockModal: React.FC<StockModalProps> = ({ stock, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Stock, 'id'> & { id?: number }>({
    name: '',
    quantity: 0,
    buyPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    currentPrice: 0,
    sellPrice: undefined,
    sellDate: undefined,
  });

  useEffect(() => {
    if (stock) {
      setFormData(stock);
    }
  }, [stock]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Stock);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-navy-light rounded-lg shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">{stock ? 'Edit Stock' : 'Add Stock'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-400">Stock Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-navy border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-400">Quantity</label>
              <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required className="mt-1 block w-full bg-navy border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="buyPrice" className="block text-sm font-medium text-slate-400">Buy Price</label>
              <input type="number" name="buyPrice" id="buyPrice" value={formData.buyPrice} onChange={handleChange} step="0.01" required className="mt-1 block w-full bg-navy border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>
          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-400">Purchase Date</label>
            <input type="date" name="purchaseDate" id="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required className="mt-1 block w-full bg-navy border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label htmlFor="currentPrice" className="block text-sm font-medium text-slate-400">Current Price</label>
            <input type="number" name="currentPrice" id="currentPrice" value={formData.currentPrice} onChange={handleChange} step="0.01" required className="mt-1 block w-full bg-navy border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <p className="text-sm text-slate-500">Leave Sell Price & Date blank for stocks you currently hold.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sellPrice" className="block text-sm font-medium text-slate-400">Sell Price</label>
              <input type="number" name="sellPrice" id="sellPrice" value={formData.sellPrice || ''} onChange={handleChange} step="0.01" className="mt-1 block w-full bg-navy border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="sellDate" className="block text-sm font-medium text-slate-400">Sell Date</label>
              <input type="date" name="sellDate" id="sellDate" value={formData.sellDate || ''} onChange={handleChange} className="mt-1 block w-full bg-navy border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition duration-300">Close</button>
            <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition duration-300">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;