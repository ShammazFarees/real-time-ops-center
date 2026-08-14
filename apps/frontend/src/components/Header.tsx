import React from 'react';
import { ShieldAlert, Activity, Cpu, Database, Radio, RefreshCw, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const Header: React.FC = () => {
  const { isConnected, incidents, isSimulating, setIsSimulating } = useSocket();

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;

  const triggerSeed = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    try {
      await fetch(`${backendUrl}/api/incidents/seed`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-dark-800 border-b border-dark-700 px-4 flex items-center justify-between shadow-lg z-30 relative">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-wide text-white uppercase font-mono">
              TACTICAL OPS CENTER
            </h1>
            <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
              LIVE MULTI-AGENT
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Real-Time Event-Driven Incident Orchestrator</p>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-dark-900/60 px-3 py-1.5 rounded-md border border-dark-700">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
          <span>SOCKET GATEWAY:</span>
          <span className={isConnected ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            {isConnected ? 'ONLINE' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-dark-900/60 px-3 py-1.5 rounded-md border border-dark-700">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI ENGINE:</span>
          <span className="text-cyan-400 font-bold">LANGGRAPH PIPELINE</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-dark-900/60 px-3 py-1.5 rounded-md border border-dark-700">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>QUEUE:</span>
          <span className="text-amber-400 font-bold">BULLMQ / REDIS</span>
        </div>
      </div>

      {/* Action Controls & Simulation Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={triggerSeed}
          className="flex items-center gap-1.5 text-xs font-medium bg-dark-700 hover:bg-dark-600 text-slate-200 px-3 py-1.5 rounded-md border border-slate-600 transition-colors"
          title="Inject sample emergency events"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inject Seed</span>
        </button>

        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
            isSimulating
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-dark-700 border-slate-600 text-slate-400'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-bounce' : 'text-slate-400'}`} />
          <span>{isSimulating ? 'STREAM ACTIVE' : 'STREAM PAUSED'}</span>
        </button>

        {criticalCount > 0 && (
          <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-2.5 py-1 rounded-md animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            <span>{criticalCount} CRITICAL</span>
          </div>
        )}
      </div>
    </header>
  );
};
