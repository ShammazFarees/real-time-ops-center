import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Incident } from '../types/incident';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  incidents: Incident[];
  selectedIncident: Incident | null;
  setSelectedIncident: (inc: Incident | null) => void;
  updateIncidentStep: (incidentId: string, stepNumber: number) => void;
  dispatchUnit: (incidentId: string, unitId: string) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  incidents: [],
  selectedIncident: null,
  setSelectedIncident: () => {},
  updateIncidentStep: () => {},
  dispatchUnit: () => {},
  isSimulating: false,
  setIsSimulating: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 5,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('[SOCKET CLIENT] Connected to backend gateway');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[SOCKET CLIENT] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('incidents:snapshot', (snapshot: Incident[]) => {
      console.log('[SOCKET CLIENT] Received snapshot:', snapshot.length);
      setIncidents(snapshot);
      if (snapshot.length > 0 && !selectedIncident) {
        setSelectedIncident(snapshot[0]);
      }
    });

    newSocket.on('incident:new', (newInc: Incident) => {
      console.log('[SOCKET CLIENT] New incoming incident:', newInc.incidentId);
      setIncidents(prev => {
        const exists = prev.some(i => i.incidentId === newInc.incidentId);
        if (exists) {
          return prev.map(i => i.incidentId === newInc.incidentId ? newInc : i);
        }
        return [newInc, ...prev];
      });
      setSelectedIncident(newInc);
    });

    newSocket.on('incident:updated', (updatedInc: Incident) => {
      setIncidents(prev => prev.map(i => i.incidentId === updatedInc.incidentId ? updatedInc : i));
      setSelectedIncident(prev => prev?.incidentId === updatedInc.incidentId ? updatedInc : prev);
    });

    setSocket(newSocket);

    // Automatic polling fallback for serverless environments (e.g. Vercel)
    const pollInterval = setInterval(async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/incidents`);
        if (res.ok) {
          const list: Incident[] = await res.json();
          if (list && list.length > 0) {
            setIncidents(list);
            setIsConnected(true);
          }
        }
      } catch (e) {
        // Silently ignore polling errors if web socket is active
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      newSocket.close();
    };
  }, []);

  const updateIncidentStep = async (incidentId: string, stepNumber: number) => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL || '';
    try {
      const res = await fetch(`${socketUrl}/api/incidents/${incidentId}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleStepNumber: stepNumber })
      });
      if (res.ok) {
        const updatedInc = await res.json();
        setIncidents(prev => prev.map(i => i.incidentId === updatedInc.incidentId ? updatedInc : i));
        setSelectedIncident(prev => prev?.incidentId === updatedInc.incidentId ? updatedInc : prev);
      }
    } catch (err) {
      console.error('[DISPATCH ERROR]', err);
    }
  };

  const dispatchUnit = async (incidentId: string, unitId: string) => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL || '';
    try {
      const res = await fetch(`${socketUrl}/api/incidents/${incidentId}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS', assignedUnitId: unitId })
      });
      if (res.ok) {
        const updatedInc = await res.json();
        setIncidents(prev => prev.map(i => i.incidentId === updatedInc.incidentId ? updatedInc : i));
        setSelectedIncident(prev => prev?.incidentId === updatedInc.incidentId ? updatedInc : prev);
      }
    } catch (err) {
      console.error('[DISPATCH ERROR]', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        incidents,
        selectedIncident,
        setSelectedIncident,
        updateIncidentStep,
        dispatchUnit,
        isSimulating,
        setIsSimulating
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
