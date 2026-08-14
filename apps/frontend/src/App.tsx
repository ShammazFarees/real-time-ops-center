import React from 'react';
import { SocketProvider } from './context/SocketContext';
import { Header } from './components/Header';
import { IncidentFeed } from './components/IncidentFeed';
import { IncidentMap } from './components/IncidentMap';
import { IncidentInspector } from './components/IncidentInspector';

export const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-dark-900 text-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Streaming Event Feed */}
        <IncidentFeed />

        {/* Center Panel: Geospatial Leaflet Map */}
        <IncidentMap />

        {/* Right Panel: Incident Inspector & AI Reasoning */}
        <IncidentInspector />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
};

export default App;
