import { GoogleGenAI, Type } from '@google/genai';

let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Is the API_KEY set?", error);
}

export const getPortfolioAnalysis = async (stocks) => {
  if (stocks.length === 0) {
    return {
      portfolioHealthScore: 0,
      keyObservations: "No stocks in the portfolio to analyze.",
      actionableInsights: "Add stocks to your portfolio to get actionable insights."
    };
  }

  if (!ai) {
    return {
      portfolioHealthScore: 0,
      keyObservations: "AI Service Error: Could not initialize the AI service. Please check if the API key is correctly configured in your environment.",
      actionableInsights: "The application is missing a valid API key. Please ensure it is set up correctly."
    };
  }

  try {
    const heldStocks = stocks.filter(s => !s.sellDate);
    const portfolioSummary = heldStocks.map(s => 
      `- ${s.name}: Investment: INR ${(s.buyPrice * s.quantity).toFixed(2)}, Purchase Date: ${s.purchaseDate}`
    ).join('\\n');

    const prompt = `Analyze the following Indian stock portfolio. Provide a health score, key observations, and actionable insights. This is for an educational tool, not financial advice. Portfolio Data:\\n${portfolioSummary}`;
    
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
              description: "An integer from 1 to 10 (1=very risky, 10=very healthy)."
            },
            keyObservations: {
              type: Type.STRING,
              description: "A string with 2-3 bullet-pointed observations about the portfolio's health. Use '-' for bullet points and '\\n' for new lines."
            },
            actionableInsights: {
              type: Type.STRING,
              description: "A string with brief, educational insights for key stocks. Use '*' for bolding and '\\n' for new lines."
            }
          },
          required: ["portfolioHealthScore", "keyObservations", "actionableInsights"]
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("The AI model returned an empty response. This may be due to content safety restrictions.");
    }

    const analysisResult = JSON.parse(responseText);
    return analysisResult;

  } catch (error) {
    console.error("Error fetching analysis directly from Gemini:", error);
    let errorMessage = `An error occurred while fetching the analysis.`;
    if (error.message.includes('API key not valid')) {
        errorMessage = 'The provided API Key is not valid. Please check your key and try again.';
    } else if (error.message.includes('fetch-failed')) {
        errorMessage = 'A network error occurred. Please check your internet connection.';
    } else {
        errorMessage = error.message;
    }

    return {
      portfolioHealthScore: 0,
      keyObservations: `AI Service Error: ${errorMessage}`,
      actionableInsights: "Could not get a response from the AI model. Please check the console for more details and ensure your API key is valid and has sufficient quota."
    };
  }
};