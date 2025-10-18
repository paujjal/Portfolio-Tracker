import React from 'react';

const AboutMePage: React.FC = () => {
  return (
    <div className="space-y-6 p-4 text-slate-300 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white text-center sm:text-left">About Ujjal Paul</h2>
      
      <div className="bg-navy-dark p-6 rounded-lg shadow-lg">
        <p className="mb-4 leading-relaxed">
          My name is Ujjal Paul, and I have been actively involved in the equity market since 2008. With 15 years of investing experience, I have developed a keen eye for identifying long-term growth opportunities. My journey as a dedicated investor has taught me the value of patience and strategic thinking.
        </p>
        <p className="mb-4 leading-relaxed">
          Over the years, I have built a robust and diversified portfolio that reflects my commitment to sustainable wealth creation. Driven by a passion for financial markets, I constantly seek new insights and trends to stay ahead. I believe in the power of disciplined investing and continuous learning.
        </p>
        <p className="mb-4 leading-relaxed">
          My goal is to achieve consistent growth while helping others understand the exciting world of equities. Let's connect and explore the limitless potential of smart investing together. Happy Investing.
        </p>
        <p className="mt-6 pt-4 border-t border-slate-700 text-slate-400 text-sm">
          <strong>P.S.</strong> - I am not a SEBI registered analyst. Please do proper research before investing.
        </p>
      </div>

      <div className="bg-navy-dark p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Contact</h3>
        <ul className="space-y-2">
          <li>
            <strong>Email:</strong> <a href="mailto:paujjal@gmail.com" className="text-cyan-400 hover:underline">paujjal@gmail.com</a>
          </li>
          <li>
            <strong>Phone:</strong> <span className="text-cyan-400">9831291631</span> (WhatsApp / Ping before call)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AboutMePage;