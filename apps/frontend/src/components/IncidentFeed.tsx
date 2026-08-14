import React, { useState } from 'react';
import { Flame, Activity, ShieldAlert, AlertTriangle, Clock, MapPin, ChevronRight, Filter } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { Incident, SeverityLevel } from '../types/incident';

export const IncidentFeed: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncident } = useSocket();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FIRE':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'MEDICAL':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSeverityBadgeClass = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  return (
    <div className="w-full lg:w-80 xl:w-96 bg-dark-800 border-r border-dark-700 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header Bar */}
      <div className="p-3 border-b border-dark-700 flex flex-col gap-2 bg-dark-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              INCIDENT FEED ({filteredIncidents.length})
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-dark-900 px-2 py-0.5 rounded border border-dark-700">
            REAL-TIME LOG
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-mono">
          <Filter className="w-3 h-3 text-slate-500 mr-1 shrink-0" />
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
            <button
              key={level}
              onClick={() => setFilterSeverity(level)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors shrink-0 ${
                filterSeverity === level
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                  : 'bg-dark-900 text-slate-400 hover:text-slate-200 border border-dark-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30 animate-spin" />
            Awaiting emergency telemetry events...
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const isSelected = selectedIncident?.incidentId === inc.incidentId;
            const createdTime = new Date(inc.createdAt || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={inc.incidentId}
                onClick={() => setSelectedIncident(inc)}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-dark-700/80 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-dark-900/50 hover:bg-dark-700/40 border-dark-700/80'
                }`}
              >
                {/* Header line */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(inc.category)}
                    <span className="text-xs font-bold text-slate-200 font-mono">
                      {inc.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${getSeverityBadgeClass(
                      inc.severity
                    )}`}
                  >
                    {inc.severity}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1 group-hover:text-cyan-300 transition-colors">
                  {inc.title}
                </h3>

                {/* Raw snippet */}
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 font-sans">
                  {inc.rawPayload}
                </p>

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-dark-700/60 pt-1.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>
                      {inc.location?.coordinates[1]?.toFixed(3)}, {inc.location?.coordinates[0]?.toFixed(3)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{createdTime}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
