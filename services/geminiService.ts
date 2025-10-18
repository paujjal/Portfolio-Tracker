import { GoogleGenAI, Type } from "@google/genai";
import { Stock, AIAnalysis } from '../types';

export const getPortfolioAnalysis = async (stocks: Stock[]): Promise<AIAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (stocks.length === 0) {
    return {
      portfolioHealthScore: 0,
      keyObservations: "No stocks in the portfolio to analyze.",
      actionableInsights: "Add stocks to your portfolio to get actionable insights."
    };
  }
  
  const heldStocks = stocks.filter(s => !s.sellDate);
  if (heldStocks.length === 0) {
    return {
      portfolioHealthScore: 0,
      keyObservations: "No active holdings in the portfolio to analyze.",
      actionableInsights: "Add some active holdings to your portfolio to get actionable insights."
    };
  }

  const totalInvestment = heldStocks.reduce((acc, s) => acc + s.buyPrice * s.quantity, 0);

  const portfolioSummary = heldStocks.map(s => {
    const investment = s.buyPrice * s.quantity;
    const currentValue = s.currentPrice * s.quantity;
    const pl = currentValue - investment;
    const weight = totalInvestment > 0 ? (investment / totalInvestment * 100).toFixed(2) : 0;
    return `- ${s.name}: Investment: INR ${investment.toFixed(2)}, Current Value: INR ${currentValue.toFixed(2)}, P/L: INR ${pl.toFixed(2)}, Portfolio Weight: ${weight}%, Purchase Date: ${s.purchaseDate}`;
  }).join('\n');

  const prompt = `
    Analyze the following Indian stock portfolio for a retail investor. Provide a detailed analysis based on the provided data.
    The portfolio consists of:\n${portfolioSummary}
    Total Portfolio Investment in active holdings: INR ${totalInvestment.toFixed(2)}

    Please provide the analysis in a JSON format with the following structure:
    1.  **portfolioHealthScore**: An integer score from 1 to 10 (1=very risky, 10=very healthy) representing the overall health of the portfolio, considering diversification, performance, and concentration.
    2.  **keyObservations**: A string containing 2-3 bullet-pointed key observations about the portfolio's strengths and weaknesses. For example, comment on sector concentration, allocation between large/mid/small caps (if inferable), and overall performance.
    3.  **actionableInsights**: A string containing brief, educational, and actionable insights for each stock, categorized as 'Review', 'Hold', or 'Consider Accumulating'. This is not financial advice, but a heuristic guide. For each stock, provide a one-sentence rationale. Format the output with markdown for bolding. Example format:
        **Consider Accumulating:**
        *   RELIANCE: As a market leader, it shows consistent performance.
        **Hold:**
        *   TCS: Stable performer in the IT sector.
        **Review:**
        *   SMALLCAP_XYZ: High volatility and recent underperformance warrant a review of its fundamentals.

    Do not give direct financial advice to buy or sell. The insights should be educational and prompt the user to do their own research.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            portfolioHealthScore: {
              type: Type.INTEGER,
              description: "A health score for the portfolio from 1 to 10."
            },
            keyObservations: {
              type: Type.STRING,
              description: "Key observations about the portfolio."
            },
            actionableInsights: {
              type: Type.STRING,
              description: "Actionable insights categorized by stock."
            }
          }
        },
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error fetching analysis from Gemini API:", error);
    return {
      portfolioHealthScore: 0,
      keyObservations: "Could not retrieve analysis. The AI service may be temporarily unavailable.",
      actionableInsights: "Please try again later."
    };
  }
};