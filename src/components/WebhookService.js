// Service de gestion des webhooks N8N
import axios from 'axios';
import toast from 'react-hot-toast';

class WebhookService {
  constructor() {
    this.baseURL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook';
    this.apiKey = process.env.REACT_APP_N8N_API_KEY;
    
    // Configuration axios avec intercepteurs
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Intercepteurs pour logging et gestion d'erreurs
    this.setupInterceptors();
    
    // Queue pour les requêtes en attente
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    // Cache pour éviter les requêtes dupliquées
    this.requestCache = new Map();
    this.cacheTimeout = 5000; // 5 secondes
  }

  setupInterceptors() {
    // Intercepteur de requête
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 N8N Webhook Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          headers: config.headers
        });
        
        // Ajouter timestamp et ID de session
        if (config.data) {
          config.data.metadata = {
            ...config.data.metadata,
            timestamp: new Date().toISOString(),
            sessionId: localStorage.getItem('sessionId') || this.generateSessionId(),
            userAgent: navigator.userAgent,
            source: 'frontend-webhook-service'
          };
        }
        
        return config;
      },
      (error) => {
        console.error('❌ N8N Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ N8N Webhook Response: ${response.config.url}`, {
          status: response.status,
          data: response.data,
          executionTime: response.headers['x-execution-time']
        });
        
        // Mettre en cache la réponse si nécessaire
        if (response.config.method === 'get') {
          this.cacheResponse(response.config.url, response.data);
        }
        
        return response;
      },
      (error) => {
        console.error('❌ N8N Response Error:', error);
        
        // Gestion des erreurs spécifiques
        if (error.code === 'ECONNABORTED') {
          toast.error('Timeout: La requête N8N a pris trop de temps');
        } else if (error.response?.status === 429) {
          toast.error('Trop de requêtes: Veuillez patienter');
          // Ajouter à la queue pour retry
          this.addToQueue(error.config);
        } else if (error.response?.status >= 500) {
          toast.error('Erreur serveur N8N: Service temporairement indisponible');
        } else if (error.response?.status === 401) {
          toast.error('Erreur d\'authentification N8N');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Générer un ID de session unique
  generateSessionId() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
    return sessionId;
  }

  // Mettre en cache une réponse
  cacheResponse(url, data) {
    this.requestCache.set(url, {
      data,
      timestamp: Date.now()
    });
    
    // Nettoyer le cache après timeout
    setTimeout(() => {
      this.requestCache.delete(url);
    }, this.cacheTimeout);
  }

  // Vérifier le cache
  getCachedResponse(url) {
    const cached = this.requestCache.get(url);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Ajouter une requête à la queue
  addToQueue(config) {
    this.requestQueue.push(config);
    this.processQueue();
  }

  // Traiter la queue de requêtes
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const config = this.requestQueue.shift();
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s entre les requêtes
        await this.client.request(config);
      } catch (error) {
        console.error('Erreur lors du traitement de la queue:', error);
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Méthodes webhook spécialisées

  // Agent Marketing Assistant
  async queryMarketingAgent(message, context = {}) {
    const endpoint = '/marketing-assistant';
    const payload = {
      action: 'query_agent',
      data: {
        user_message: message,
        context: {
          user_id: localStorage.getItem('userId') || 'anonymous',
          session_id: localStorage.getItem('sessionId') || this.generateSessionId(),
          page_context: window.location.pathname,
          timestamp: new Date().toISOString(),
          ...context
        }
      }
    };

    try {
      const response = await this.client.post(endpoint, payload);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur agent marketing: ${error.message}`);
    }
  }

  // Synchronisation des données
  async triggerDataSync(platforms = [], options = {}) {
    const endpoint = '/data-sync';
    const payload = {
      action: 'sync_data',
      data: {
        platforms: platforms.length > 0 ? platforms : ['facebook', 'google', 'linkedin', 'instagram'],
        sync_type: options.syncType || 'incremental',
        force_refresh: options.forceRefresh || false,
        date_range: options.dateRange || {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
          end: new Date().toISOString()
        }
      }
    };

    try {
      const response = await this.client.post(endpoint, payload);
      if (response.data.success) {
        toast.success('Synchronisation des données réussie');
      }
      return response.data;
    } catch (error) {
      throw new Error(`Erreur synchronisation: ${error.message}`);
    }
  }

  // Traitement des leads
  async processLead(leadData, actions = []) {
    const endpoint = '/lead-processing';
    const payload = {
      action: 'process_lead',
      data: {
        lead: leadData,
        actions: actions.length > 0 ? actions : ['score', 'classify', 'assign'],
        automation_rules: {
          auto_score: true,
          auto_assign: true,
          trigger_workflows: true,
          send_notifications: true
        }
      }
    };

    try {
      const response = await this.client.post(endpoint, payload);
      if (response.data.success) {
        toast.success('Lead traité avec succès');
      }
      return response.data;
    } catch (error) {
      throw new Error(`Erreur traitement lead: ${error.message}`);
    }
  }

  // Optimisation des campagnes
  async optimizeCampaigns(campaignIds = [], optimizationType = 'budget') {
    const endpoint = '/campaign-optimizer';
    const payload = {
      action: 'optimize_campaigns',
      data: {
        campaign_ids: campaignIds,
        optimization_type: optimizationType,
        parameters: {
          auto_apply: false, // Sécurité: ne pas appliquer automatiquement
          min_budget: 10,
          max_budget_increase: 50, // % max d'augmentation
          performance_threshold: 2.0 // ROI minimum
        }
      }
    };

    try {
      const response = await this.client.post(endpoint, payload);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur optimisation campagnes: ${error.message}`);
    }
  }

  // Génération de contenu
  async generateContent(contentType, parameters = {}) {
    const endpoint = '/content-scheduler';
    const payload = {
      action: 'generate_content',
      data: {
        content_type: contentType,
        parameters: {
          tone: 'professional',
          language: 'fr',
          platform: 'multi',
          length: 'medium',
          include_hashtags: true,
          include_cta: true,
          ...parameters
        },
        auto_schedule: false
      }
    };

    try {
      const response = await this.client.post(endpoint, payload);
      if (response.data.success) {
        toast.success('Contenu généré avec succès');
      }
      return response.data;
    } catch (error) {
      throw new Error(`Erreur génération contenu: ${error.message}`);
    }
  }

  // Automation email
  async triggerEmailAutomation(automationType, recipientData, options = {}) {
    const endpoint = '/email-automation';
    const payload = {
      action: 'trigger_automation',
      data: {
        automation_type: automationType,
        recipients: Array.isArray(recipientData) ? recipientData : [recipientData],
        options: {
          send_immediately: options.sendImmediately || false,
          personalize: options.personalize !== false,
          track_opens: options.trackOpens !== false,
          track_clicks: options.trackClicks !== false,
          ...options
        }
      }
    };

    try {
      const response = await this.client.post(endpoint, payload);
      if (response.data.success) {
        toast.success('Automation email déclenchée');
      }
      return response.data;
    } catch (error) {
      throw new Error(`Erreur automation email: ${error.message}`);
    }
  }

  // Récupérer les métriques en temps réel
  async getRealtimeMetrics(platforms = [], dateRange = null) {
    const endpoint = '/realtime-metrics';
    
    // Vérifier le cache d'abord
    const cacheKey = `${endpoint}_${platforms.join(',')}_${JSON.stringify(dateRange)}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const payload = {
      action: 'get_metrics',
      data: {
        platforms: platforms.length > 0 ? platforms : ['all'],
        date_range: dateRange || {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24h
          end: new Date().toISOString()
        },
        metrics: ['revenue', 'spend', 'conversions', 'clicks', 'impressions', 'leads']
      }
    };

    try {
      const response = await this.client.post(endpoint, payload);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur métriques temps réel: ${error.message}`);
    }
  }

  // Tester la connexion N8N
  async testConnection() {
    const endpoint = '/health-check';
    
    try {
      const response = await this.client.get(endpoint);
      return {
        connected: true,
        status: response.status,
        latency: response.headers['x-response-time'] || 'N/A',
        version: response.data.version || 'N/A'
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        status: error.response?.status || 'N/A'
      };
    }
  }

  // Récupérer les logs d'exécution
  async getExecutionLogs(limit = 50) {
    const endpoint = '/execution-logs';
    
    try {
      const response = await this.client.get(`${endpoint}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur récupération logs: ${error.message}`);
    }
  }

  // Méthodes utilitaires

  // Valider la configuration
  isConfigured() {
    return !!(this.baseURL && this.apiKey);
  }

  // Obtenir les statistiques du service
  getStats() {
    return {
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      cacheSize: this.requestCache.size,
      queueSize: this.requestQueue.length,
      isProcessingQueue: this.isProcessingQueue
    };
  }

  // Nettoyer le cache et la queue
  cleanup() {
    this.requestCache.clear();
    this.requestQueue.length = 0;
    this.isProcessingQueue = false;
  }

  // Méthode pour les requêtes personnalisées
  async customRequest(endpoint, method = 'POST', data = {}) {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined
      });
      return response.data;
    } catch (error) {
      throw new Error(`Erreur requête personnalisée: ${error.message}`);
    }
  }
}

// Instance singleton du service
const webhookService = new WebhookService();

// Exporter l'instance et la classe
export default webhookService;
export { WebhookService };

// Fonctions utilitaires pour les composants React
export const useWebhookService = () => {
  return {
    service: webhookService,
    isConfigured: webhookService.isConfigured(),
    stats: webhookService.getStats()
  };
};

// Hook pour tester la connexion
export const useConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await webhookService.testConnection();
      setConnectionStatus(result);
      return result;
    } catch (error) {
      const errorResult = {
        connected: false,
        error: error.message
      };
      setConnectionStatus(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connectionStatus,
    isLoading,
    testConnection
  };
};