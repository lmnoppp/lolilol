import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const useN8NWebhook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const abortControllerRef = useRef(null);

  const webhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL;
  const apiKey = process.env.REACT_APP_N8N_API_KEY;

  // Configuration axios avec intercepteurs
  const axiosInstance = axios.create({
    baseURL: webhookUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // Intercepteur pour les requêtes
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log('🚀 N8N Request:', config);
      return config;
    },
    (error) => {
      console.error('❌ N8N Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Intercepteur pour les réponses
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log('✅ N8N Response:', response.data);
      return response;
    },
    (error) => {
      console.error('❌ N8N Response Error:', error);
      if (error.code === 'ECONNABORTED') {
        error.message = 'Timeout: La requête a pris trop de temps';
      }
      return Promise.reject(error);
    }
  );

  // Fonction générique pour envoyer des webhooks
  const sendWebhook = useCallback(async (endpoint, data, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau contrôleur d'annulation
      abortControllerRef.current = new AbortController();

      const requestData = {
        action: endpoint,
        data: {
          user_id: localStorage.getItem('userId') || 'anonymous',
          timestamp: new Date().toISOString(),
          session_id: localStorage.getItem('sessionId') || generateSessionId(),
          ...data
        },
        metadata: {
          source: 'frontend',
          version: '1.0.0',
          ...options.metadata
        }
      };

      const response = await axiosInstance.post(`/webhook/${endpoint}`, requestData, {
        signal: abortControllerRef.current.signal,
        ...options
      });

      setLastResponse(response.data);
      return response.data;

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return null;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  // Agent IA Marketing Assistant
  const queryMarketingAgent = useCallback(async (message, context = {}) => {
    return await sendWebhook('marketing-assistant', {
      user_message: message,
      context: {
        current_page: window.location.pathname,
        user_preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
        ...context
      }
    });
  }, [sendWebhook]);

  // Synchronisation des données
  const triggerDataSync = useCallback(async (platforms = []) => {
    return await sendWebhook('data-sync', {
      platforms: platforms.length > 0 ? platforms : ['facebook', 'google', 'linkedin', 'instagram'],
      sync_type: 'full',
      force_refresh: true
    });
  }, [sendWebhook]);

  // Traitement des leads
  const processLead = useCallback(async (leadData) => {
    return await sendWebhook('lead-processing', {
      lead: leadData,
      auto_score: true,
      trigger_workflows: true
    });
  }, [sendWebhook]);

  // Optimisation des campagnes
  const optimizeCampaigns = useCallback(async (campaignIds = [], optimizationType = 'budget') => {
    return await sendWebhook('campaign-optimizer', {
      campaign_ids: campaignIds,
      optimization_type: optimizationType,
      auto_apply: false // Sécurité: demander confirmation avant application
    });
  }, [sendWebhook]);

  // Génération de contenu
  const generateContent = useCallback(async (contentType, parameters) => {
    return await sendWebhook('content-scheduler', {
      content_type: contentType,
      parameters: {
        tone: 'professional',
        language: 'fr',
        platform: 'multi',
        ...parameters
      },
      auto_schedule: false
    });
  }, [sendWebhook]);

  // Automation email
  const triggerEmailAutomation = useCallback(async (automationType, recipientData) => {
    return await sendWebhook('email-automation', {
      automation_type: automationType,
      recipients: Array.isArray(recipientData) ? recipientData : [recipientData],
      send_immediately: false
    });
  }, [sendWebhook]);

  // Annuler les requêtes en cours
  const cancelRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Réinitialiser les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Utilitaire pour générer un ID de session
  const generateSessionId = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
    return sessionId;
  };

  return {
    // États
    loading,
    error,
    lastResponse,

    // Actions génériques
    sendWebhook,
    cancelRequests,
    clearError,

    // Actions spécialisées
    queryMarketingAgent,
    triggerDataSync,
    processLead,
    optimizeCampaigns,
    generateContent,
    triggerEmailAutomation,

    // Utilitaires
    isConnected: !error && webhookUrl && apiKey,
    hasActiveRequest: loading,
  };
};

export default useN8NWebhook;