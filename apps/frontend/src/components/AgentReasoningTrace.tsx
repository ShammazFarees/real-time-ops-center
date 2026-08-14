import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, CheckCircle, ShieldCheck, Navigation, FileText } from 'lucide-react';
import { ReasoningStep } from '../types/incident';

interface AgentReasoningTraceProps {
  trace?: ReasoningStep[];
  confidence?: number;
}

export const AgentReasoningTrace: React.FC<AgentReasoningTraceProps> = ({ trace, confidence }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!trace || trace.length === 0) {
    return (
      <div className="bg-dark-900/60 rounded-lg p-3 border border-dark-700 font-mono text-xs text-slate-400">
        AI Reasoning Trace initializing...
      </div>
    );
  }

  const getAgentIcon = (index: number) => {
    switch (index) {
      case 0:
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 1:
        return <Navigation className="w-4 h-4 text-cyan-400" />;
      default:
        return <FileText className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-dark-900/80 rounded-lg border border-dark-700 overflow-hidden shadow-md">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-dark-800/80 hover:bg-dark-700/60 flex items-center justify-between transition-colors border-b border-dark-700/60 text-left"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
            AI AGENT REASONING TRACE
          </span>
          {confidence && (
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
              {(confidence * 100).toFixed(0)}% CONFIDENCE
            </span>
          )}
        </div>

        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3 space-y-3 font-mono text-xs">
          {trace.map((step, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-cyan-500/40 space-y-1">
              {/* Dot Icon */}
              <div className="absolute -left-[9px] top-0 bg-dark-900 p-0.5 rounded-full">
                {getAgentIcon(idx)}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-cyan-300">{step.agentName}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-slate-200 font-semibold text-xs">{step.stepSummary}</p>
              <p className="text-slate-400 text-[11px] font-sans bg-dark-950/60 p-2 rounded border border-dark-700/60">
                {step.details}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
