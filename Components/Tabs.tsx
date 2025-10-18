import React from 'react';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = Object.values(Tab);

  return (
    <nav className="flex flex-wrap border-b border-slate-700">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base focus:outline-none transition-colors duration-300 ${
            activeTab === tab
              ? 'border-b-2 border-cyan-400 text-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;