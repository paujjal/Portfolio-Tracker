export interface Stock {
  id: number;
  name: string;
  quantity: number;
  buyPrice: number;
  purchaseDate: string;
  currentPrice: number;
  sellPrice?: number;
  sellDate?: string;
}

export interface PortfolioMetrics {
  totalInvestment: number;
  grossPL: number;
  netPL: number;
  cagr: number;
  currentValue: number;
}

export enum Tab {
  Home = 'Home',
  Portfolio = 'Portfolio',
  Analysis = 'Analysis',
  About = 'About Me',
}

export interface AIAnalysis {
  portfolioHealthScore: number;
  keyObservations: string;
  actionableInsights: string;
}