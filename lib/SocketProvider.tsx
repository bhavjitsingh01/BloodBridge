'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const namespace = getNamespaceForRole(user.role);

    const newSocket = io(`${socketUrl}${namespace}`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);
      console.log(`Socket.IO connected to ${namespace}`);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (err: any) => {
      setError(err.message);
      console.error('Socket.IO connection error:', err);
    });

    // Listen for emergency events
    newSocket.on('emergency_created', (data) => {
      console.log('Emergency created:', data);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('emergency_created', { detail: data }));
    });

    // Listen for inventory updates
    newSocket.on('inventory_updated', (data) => {
      console.log('Inventory updated:', data);
      window.dispatchEvent(new CustomEvent('inventory_updated', { detail: data }));
    });

    // Listen for shortage predictions
    newSocket.on('shortage_prediction', (data) => {
      console.log('Shortage prediction:', data);
      window.dispatchEvent(new CustomEvent('shortage_prediction', { detail: data }));
    });

    // Listen for notifications
    newSocket.on('new_notification', (data) => {
      console.log('New notification:', data);
      window.dispatchEvent(new CustomEvent('new_notification', { detail: data }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}

function getNamespaceForRole(role: string): string {
  const namespaceMap: Record<string, string> = {
    Hospital: '/hospital',
    BloodBank: '/blood-bank',
    Donor: '/donor',
    Admin: '/admin',
  };
  return namespaceMap[role] || '/hospital';
}

// Hook to listen to real-time events
export function useRealtimeEvent(
  event: string,
  callback: (data: any) => void
) {
  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      callback(customEvent.detail);
    };

    window.addEventListener(event, handleEvent);
    return () => {
      window.removeEventListener(event, handleEvent);
    };
  }, [event, callback]);
}
