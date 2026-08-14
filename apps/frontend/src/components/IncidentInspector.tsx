import React from 'react';
import { ShieldAlert, CheckSquare, Square, Truck, Send, Radio, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { AgentReasoningTrace } from './AgentReasoningTrace';

export const IncidentInspector: React.FC = () => {
  const { selectedIncident, updateIncidentStep, dispatchUnit } = useSocket();

  if (!selectedIncident) {
    return (
      <div className="w-full lg:w-96 xl:w-[28rem] bg-dark-800 border-l border-dark-700 h-[calc(100vh-4rem)] p-6 flex flex-col items-center justify-center text-center font-mono text-xs text-slate-500">
        <ShieldAlert className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
        <p className="font-bold text-slate-400">NO INCIDENT SELECTED</p>
        <p className="text-slate-500 mt-1">Select an emergency incident from the left feed or geospatial map to inspect real-time AI reasoning and execute dispatch commands.</p>
      </div>
    );
  }

  const ai = selectedIncident.aiAnalysis;
  const isResolved = selectedIncident.status === 'RESOLVED';
  const isInProgress = selectedIncident.status === 'IN_PROGRESS';

  return (
    <div className="w-full lg:w-96 xl:w-[28rem] bg-dark-800 border-l border-dark-700 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto">
      {/* Header Bar */}
      <div className="p-4 border-b border-dark-700 bg-dark-800/90 sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
            {selectedIncident.incidentId}
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                selectedIncident.severity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              }`}
            >
              {selectedIncident.severity}
            </span>

            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                isResolved
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : isInProgress
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
            >
              {selectedIncident.status}
            </span>
          </div>
        </div>

        <h2 className="text-base font-bold text-white font-mono leading-tight">
          {selectedIncident.title}
        </h2>
      </div>

      <div className="p-4 space-y-4 font-sans text-xs">
        {/* Raw Signal Card */}
        <div className="bg-dark-900/90 rounded-lg p-3 border border-dark-700 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-red-400" />
              RAW TELEMETRY SIGNAL
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(selectedIncident.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-slate-200 font-mono text-xs leading-relaxed bg-dark-950 p-2.5 rounded border border-dark-800">
            {selectedIncident.rawPayload}
          </p>
        </div>

        {/* AI Agent Reasoning Trace */}
        <AgentReasoningTrace trace={ai?.reasoningTrace} confidence={ai?.confidence} />

        {/* Operational Responder Action Checklist */}
        <div className="bg-dark-900/90 rounded-lg p-3.5 border border-dark-700 space-y-3">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <span className="font-mono font-bold text-xs text-white uppercase flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              ACTION CHECKLIST ({ai?.actionPlan?.filter(s => s.completed).length || 0} / {ai?.actionPlan?.length || 0})
            </span>
          </div>

          <div className="space-y-2">
            {ai?.actionPlan?.map(step => (
              <div
                key={step.stepNumber}
                onClick={() => updateIncidentStep(selectedIncident.incidentId, step.stepNumber)}
                className={`p-2.5 rounded border cursor-pointer transition-all flex items-start gap-2.5 ${
                  step.completed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400 line-through'
                    : 'bg-dark-800 hover:bg-dark-700/60 border-dark-700 text-slate-200'
                }`}
              >
                {step.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-cyan-400">ROLE: {step.assignedRole}</span>
                    <span
                      className={`font-bold px-1.5 rounded ${
                        step.priority === 'URGENT'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {step.priority}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-tight">{step.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Units & Dispatch Actions */}
        <div className="bg-dark-900/90 rounded-lg p-3.5 border border-dark-700 space-y-3">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <span className="font-mono font-bold text-xs text-white uppercase flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              RECOMMENDED RESPONSE UNITS
            </span>
          </div>

          <div className="space-y-2">
            {ai?.suggestedUnits?.map(unit => {
              const isDispatched = selectedIncident.assignedUnitId === unit.unitId;

              return (
                <div
                  key={unit.unitId}
                  className="p-2.5 rounded bg-dark-800 border border-dark-700 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold font-mono text-xs text-slate-100">{unit.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3">
                      <span>Type: {unit.unitType}</span>
                      <span>ETA: <strong className="text-emerald-400">{unit.etaMinutes} mins</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => dispatchUnit(selectedIncident.incidentId, unit.unitId)}
                    disabled={isDispatched}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isDispatched
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 cursor-default'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                    }`}
                  >
                    <Send className="w-3 h-3" />
                    <span>{isDispatched ? 'DISPATCHED' : 'DISPATCH'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Broadcast Message Box */}
        {ai?.broadcastMessage && (
          <div className="bg-dark-900/90 rounded-lg p-3 border border-dark-700 space-y-1.5">
            <span className="font-mono text-[11px] font-bold text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              AUTOMATED EMERGENCY BROADCAST
            </span>
            <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap bg-dark-950 p-2.5 rounded border border-red-500/20">
              {ai.broadcastMessage}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
