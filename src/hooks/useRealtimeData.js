import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const useRealtimeData = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const websocketUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Initialiser la connexion WebSocket
  const initializeSocket = useCallback(() => {
    try {
      if (socketRef.current?.connected) {
        return; // Déjà connecté
      }

      console.log('🔌 Initialisation de la connexion WebSocket...', websocketUrl);

      socketRef.current = io(websocketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: reconnectDelay,
        reconnectionAttempts: maxReconnectAttempts,
        forceNew: false,
        autoConnect: true
      });

      // Événements de connexion
      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket connecté');
        setConnected(true);
        setError(null);
        setConnectionAttempts(0);
        
        // S'authentifier avec l'ID utilisateur
        const userId = localStorage.getItem('userId') || 'anonymous';
        socketRef.current.emit('authenticate', { userId });
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ WebSocket déconnecté:', reason);
        setConnected(false);
        
        if (reason === 'io server disconnect') {
          // Le serveur a fermé la connexion, reconnecter manuellement
          setTimeout(() => {
            if (connectionAttempts < maxReconnectAttempts) {
              console.log('🔄 Tentative de reconnexion...');
              setConnectionAttempts(prev => prev + 1);
              socketRef.current?.connect();
            }
          }, reconnectDelay);
        }
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('❌ Erreur de connexion WebSocket:', err);
        setError(`Erreur de connexion: ${err.message}`);
        setConnected(false);
      });

      // Événements de données temps réel
      socketRef.current.on('metrics_update', (newData) => {
        console.log('📊 Mise à jour des métriques:', newData);
        setData(prevData => ({
          ...prevData,
          metrics: { ...prevData?.metrics, ...newData }
        }));
        setLastUpdate(new Date());
      });

      socketRef.current.on('campaigns_update', (campaigns) => {
        console.log('🎯 Mise à jour des campagnes:', campaigns);
        setData(prevData => ({
          ...prevData,
          campaigns: campaigns
        }));
        setLastUpdate(new Date());
      });

      socketRef.current.on('leads_update', (leads) => {
        console.log('👥 Mise à jour des leads:', leads);
        setData(prevData => ({
          ...prevData,
          leads: leads
        }));
        setLastUpdate(new Date());
      });

      socketRef.current.on('content_update', (content) => {
        console.log('📝 Mise à jour du contenu:', content);
        setData(prevData => ({
          ...prevData,
          content: content
        }));
        setLastUpdate(new Date());
      });

      socketRef.current.on('notification', (notification) => {
        console.log('🔔 Nouvelle notification:', notification);
        setData(prevData => ({
          ...prevData,
          notifications: [...(prevData?.notifications || []), notification]
        }));
        setLastUpdate(new Date());
      });

      socketRef.current.on('ai_response', (response) => {
        console.log('🤖 Réponse de l\'IA:', response);
        setData(prevData => ({
          ...prevData,
          aiResponses: [...(prevData?.aiResponses || []), response]
        }));
        setLastUpdate(new Date());
      });

      // Événement générique pour toute mise à jour
      socketRef.current.on('data_update', (updateData) => {
        console.log('🔄 Mise à jour générale:', updateData);
        setData(prevData => ({
          ...prevData,
          ...updateData
        }));
        setLastUpdate(new Date());
      });

    } catch (err) {
      console.error('❌ Erreur lors de l\'initialisation WebSocket:', err);
      setError(`Erreur d'initialisation: ${err.message}`);
    }
  }, [websocketUrl, connectionAttempts, maxReconnectAttempts, reconnectDelay]);

  // Envoyer des données via WebSocket
  const sendData = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    } else {
      console.warn('⚠️ WebSocket non connecté, impossible d\'envoyer:', event, data);
      return false;
    }
  }, []);

  // S'abonner à des événements spécifiques
  const subscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current?.off(event, callback);
    }
    return () => {};
  }, []);

  // Se désabonner d'un événement
  const unsubscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Demander une mise à jour manuelle des données
  const requestUpdate = useCallback((dataType = 'all') => {
    return sendData('request_update', { 
      type: dataType,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId') || 'anonymous'
    });
  }, [sendData]);

  // Rejoindre une room spécifique
  const joinRoom = useCallback((roomName) => {
    return sendData('join_room', { room: roomName });
  }, [sendData]);

  // Quitter une room
  const leaveRoom = useCallback((roomName) => {
    return sendData('leave_room', { room: roomName });
  }, [sendData]);

  // Nettoyer la connexion
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setConnected(false);
    setError(null);
  }, []);

  // Reconnecter manuellement
  const reconnect = useCallback(() => {
    cleanup();
    setConnectionAttempts(0);
    setTimeout(initializeSocket, 1000);
  }, [cleanup, initializeSocket]);

  // Initialiser la connexion au montage du composant
  useEffect(() => {
    if (process.env.REACT_APP_ENABLE_REALTIME === 'true') {
      initializeSocket();
    }

    // Nettoyer au démontage
    return cleanup;
  }, [initializeSocket, cleanup]);

  // Gestion de la visibilité de la page (pause/reprise)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page cachée, pause la connexion
        console.log('📱 Page cachée, pause de la connexion WebSocket');
      } else {
        // Page visible, reprendre la connexion
        console.log('📱 Page visible, reprise de la connexion WebSocket');
        if (!connected && process.env.REACT_APP_ENABLE_REALTIME === 'true') {
          reconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connected, reconnect]);

  return {
    // États
    data,
    connected,
    error,
    lastUpdate,
    connectionAttempts,
    
    // Actions
    sendData,
    subscribe,
    unsubscribe,
    requestUpdate,
    joinRoom,
    leaveRoom,
    reconnect,
    cleanup,
    
    // Utilitaires
    isEnabled: process.env.REACT_APP_ENABLE_REALTIME === 'true',
    canSend: connected && socketRef.current?.connected,
    connectionStatus: connected ? 'connected' : (error ? 'error' : 'disconnected'),
    
    // Données spécialisées (avec fallbacks)
    metrics: data?.metrics || {},
    campaigns: data?.campaigns || [],
    leads: data?.leads || [],
    content: data?.content || [],
    notifications: data?.notifications || [],
    aiResponses: data?.aiResponses || []
  };
};

export default useRealtimeData;