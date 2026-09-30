import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0f17] relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 65%)',
        }}
      />

      <div className="w-full max-w-md surface-card p-8 rounded-2xl border border-[rgba(5,23,71,0.08)] shadow-2xl relative z-10 text-center space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Compass className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <span className="text-caption font-bold uppercase tracking-wider text-indigo-400 block">
            Error 404
          </span>
          <h1 className="text-h1 font-bold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-small text-slate-300 max-w-xs mx-auto">
            The requested operational view does not exist or has been relocated within the DropShipHub network.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center justify-center space-x-2 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center justify-center space-x-2 text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};
