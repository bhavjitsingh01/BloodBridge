import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

export function useSocket(userRole: string): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) {
      setError('No authentication token found');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const namespace = getNamespaceForRole(userRole);

    const newSocket = io(`${socketUrl}${namespace}`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);
      console.log(`Connected to ${namespace} namespace`);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log(`Disconnected from ${namespace} namespace`);
    });

    newSocket.on('connect_error', (err: any) => {
      setError(err.message);
      console.error('Socket connection error:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userRole]);

  const emit = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, [socket]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  return { socket, connected, error, emit, on, off };
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

export function useSocketEvent(
  socket: Socket | null,
  event: string,
  callback: (data: any) => void
): void {
  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
}

export function useSocketEmit(socket: Socket | null) {
  return useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, [socket]);
}
