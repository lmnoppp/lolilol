// Agent IA - Utilitaires et configuration
export class AIAgent {
  constructor(config = {}) {
    this.config = {
      name: 'Marketing Intelligence Agent',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
      language: 'fr',
      ...config
    };
    
    this.tools = [
      'database_query_tool',
      'facebook_ads_tool',
      'google_ads_tool',
      'email_automation_tool',
      'content_generator_tool',
      'crm_management_tool',
      'analytics_tool',
      'lead_scoring_tool'
    ];

    this.conversationHistory = [];
    this.context = {};
  }

  // Système de prompt intelligent
  getSystemPrompt() {
    return `Tu es un expert en marketing digital avec accès à des outils spécialisés.

RÔLE ET EXPERTISE:
- Expert en marketing digital, growth hacking et automation
- Spécialiste des plateformes publicitaires (Facebook, Google, LinkedIn)
- Analyste de données marketing et ROI
- Conseiller en stratégie de contenu et lead generation
- Expert en CRM et scoring de prospects

OUTILS DISPONIBLES:
${this.tools.map(tool => `- ${tool}`).join('\n')}

INSTRUCTIONS:
1. Réponds toujours en français avec un ton professionnel mais accessible
2. Utilise les outils appropriés pour répondre aux questions
3. Fournis des insights actionables basés sur les données
4. Propose des optimisations concrètes pour améliorer les performances
5. Explique tes recommandations avec des métriques claires
6. Reste focalisé sur les objectifs business et ROI

CONTEXTE ACTUEL:
- Plateforme: Marketing Dashboard N8N
- Utilisateur: ${this.context.userName || 'Utilisateur'}
- Date: ${new Date().toLocaleDateString('fr-FR')}
- Session: ${this.context.sessionId || 'Nouvelle session'}

Réponds de manière concise et actionnable.`;
  }

  // Analyser l'intention de l'utilisateur
  analyzeIntent(message) {
    const intents = {
      // Analyse et reporting
      analytics: [
        'performance', 'roi', 'conversion', 'analyse', 'rapport', 'métriques',
        'statistiques', 'résultats', 'bilan', 'kpi', 'dashboard'
      ],
      
      // Gestion des campagnes
      campaigns: [
        'campagne', 'publicité', 'ads', 'budget', 'enchères', 'optimisation',
        'facebook', 'google', 'linkedin', 'instagram', 'social'
      ],
      
      // Lead management
      leads: [
        'lead', 'prospect', 'client', 'scoring', 'qualification', 'conversion',
        'pipeline', 'crm', 'suivi', 'relance'
      ],
      
      // Création de contenu
      content: [
        'contenu', 'post', 'article', 'rédaction', 'création', 'publication',
        'planification', 'calendrier', 'social media', 'blog'
      ],
      
      // Email marketing
      email: [
        'email', 'newsletter', 'séquence', 'automation', 'nurturing',
        'mailchimp', 'sendgrid', 'campagne email'
      ],
      
      // Stratégie générale
      strategy: [
        'stratégie', 'plan', 'objectif', 'croissance', 'growth', 'acquisition',
        'rétention', 'fidélisation', 'recommandation'
      ]
    };

    const messageLower = message.toLowerCase();
    const detectedIntents = {};

    Object.entries(intents).forEach(([intent, keywords]) => {
      const matches = keywords.filter(keyword => messageLower.includes(keyword));
      if (matches.length > 0) {
        detectedIntents[intent] = matches.length;
      }
    });

    // Retourner l'intention avec le plus de matches
    const primaryIntent = Object.entries(detectedIntents)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';

    return {
      primary: primaryIntent,
      confidence: Math.max(...Object.values(detectedIntents), 0) / 10,
      all: detectedIntents
    };
  }

  // Sélectionner les outils appropriés selon l'intention
  selectTools(intent, message) {
    const toolMapping = {
      analytics: ['database_query_tool', 'analytics_tool'],
      campaigns: ['facebook_ads_tool', 'google_ads_tool', 'analytics_tool'],
      leads: ['crm_management_tool', 'lead_scoring_tool', 'database_query_tool'],
      content: ['content_generator_tool', 'database_query_tool'],
      email: ['email_automation_tool', 'crm_management_tool'],
      strategy: ['analytics_tool', 'database_query_tool'],
      general: ['database_query_tool']
    };

    return toolMapping[intent.primary] || toolMapping.general;
  }

  // Formatter la requête pour N8N
  formatRequest(message, context = {}) {
    const intent = this.analyzeIntent(message);
    const selectedTools = this.selectTools(intent, message);
    
    return {
      user_message: message,
      system_prompt: this.getSystemPrompt(),
      tools: selectedTools,
      context: {
        ...this.context,
        ...context,
        intent: intent,
        conversation_history: this.conversationHistory.slice(-5), // Garder les 5 derniers échanges
        timestamp: new Date().toISOString()
      },
      config: {
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        model: this.config.model
      }
    };
  }

  // Traiter la réponse de l'IA
  processResponse(response) {
    if (!response || !response.success) {
      return {
        text: "Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?",
        type: 'error',
        tools_used: [],
        data: null
      };
    }

    const processedResponse = {
      text: response.data?.result || response.data?.message || "Réponse reçue",
      type: 'success',
      tools_used: response.data?.tools_used || [],
      execution_time: response.data?.execution_time || 0,
      data: response.data?.data || null,
      recommendations: response.data?.recommendations || [],
      timestamp: new Date().toISOString()
    };

    // Ajouter à l'historique de conversation
    this.addToHistory('assistant', processedResponse.text, processedResponse);

    return processedResponse;
  }

  // Ajouter à l'historique de conversation
  addToHistory(role, content, metadata = {}) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    });

    // Limiter l'historique à 20 échanges
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  // Mettre à jour le contexte
  updateContext(newContext) {
    this.context = {
      ...this.context,
      ...newContext
    };
  }

  // Obtenir des suggestions basées sur l'historique
  getSuggestions() {
    const recentIntents = this.conversationHistory
      .slice(-5)
      .map(msg => this.analyzeIntent(msg.content).primary)
      .filter((intent, index, arr) => arr.indexOf(intent) === index);

    const suggestionsByIntent = {
      analytics: [
        "Montre-moi les performances de cette semaine",
        "Quel est mon ROI par plateforme ?",
        "Analyse mes conversions du mois dernier"
      ],
      campaigns: [
        "Optimise mes campagnes Facebook",
        "Augmente le budget des campagnes performantes",
        "Crée une nouvelle campagne Google Ads"
      ],
      leads: [
        "Score mes nouveaux prospects",
        "Relance les leads chauds",
        "Analyse la qualité de mes leads"
      ],
      content: [
        "Génère 5 posts LinkedIn",
        "Crée un article de blog sur le marketing",
        "Planifie le contenu de la semaine"
      ],
      email: [
        "Lance une campagne de nurturing",
        "Segmente ma liste email",
        "Crée une séquence de bienvenue"
      ]
    };

    // Mélanger les suggestions basées sur les intentions récentes
    let suggestions = [];
    recentIntents.forEach(intent => {
      if (suggestionsByIntent[intent]) {
        suggestions.push(...suggestionsByIntent[intent]);
      }
    });

    // Ajouter des suggestions générales si pas assez
    if (suggestions.length < 3) {
      suggestions.push(
        "Montre-moi un résumé de mes performances",
        "Quelles sont mes meilleures opportunités ?",
        "Comment puis-je améliorer mon ROI ?"
      );
    }

    // Retourner 3 suggestions uniques
    return [...new Set(suggestions)].slice(0, 3);
  }

  // Réinitialiser la session
  resetSession() {
    this.conversationHistory = [];
    this.context = {};
  }

  // Exporter l'historique de conversation
  exportHistory() {
    return {
      history: this.conversationHistory,
      context: this.context,
      config: this.config,
      exported_at: new Date().toISOString()
    };
  }

  // Importer un historique de conversation
  importHistory(data) {
    if (data.history) {
      this.conversationHistory = data.history;
    }
    if (data.context) {
      this.context = data.context;
    }
    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }
}

// Instance globale de l'agent IA
export const marketingAgent = new AIAgent({
  name: 'Marketing Intelligence Hub Agent',
  language: 'fr',
  temperature: 0.3
});

// Utilitaires pour l'interface
export const aiUtils = {
  // Formatter les outils utilisés pour l'affichage
  formatToolsUsed: (tools) => {
    const toolNames = {
      'database_query_tool': '🗄️ Base de données',
      'facebook_ads_tool': '📘 Facebook Ads',
      'google_ads_tool': '🔍 Google Ads',
      'email_automation_tool': '📧 Email Marketing',
      'content_generator_tool': '✍️ Générateur de contenu',
      'crm_management_tool': '👥 CRM',
      'analytics_tool': '📊 Analytics',
      'lead_scoring_tool': '🎯 Scoring de leads'
    };

    return tools.map(tool => toolNames[tool] || tool);
  },

  // Formatter le temps d'exécution
  formatExecutionTime: (time) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  },

  // Générer un ID de session unique
  generateSessionId: () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Valider une requête utilisateur
  validateUserInput: (input) => {
    if (!input || input.trim().length === 0) {
      return { valid: false, error: 'Veuillez saisir un message' };
    }
    
    if (input.length > 1000) {
      return { valid: false, error: 'Message trop long (max 1000 caractères)' };
    }

    // Filtrer les contenus potentiellement dangereux
    const dangerousPatterns = [
      /script/i,
      /javascript/i,
      /eval\(/i,
      /onclick/i,
      /onerror/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        return { valid: false, error: 'Contenu non autorisé détecté' };
      }
    }

    return { valid: true };
  },

  // Extraire les métriques d'une réponse
  extractMetrics: (response) => {
    if (!response.data) return [];

    const metrics = [];
    const text = response.text || '';

    // Rechercher des patterns de métriques
    const patterns = [
      /ROI.*?(\d+(?:\.\d+)?%)/gi,
      /CAC.*?(\d+(?:\.\d+)?€)/gi,
      /conversion.*?(\d+(?:\.\d+)?%)/gi,
      /CTR.*?(\d+(?:\.\d+)?%)/gi,
      /CPC.*?(\d+(?:\.\d+)?€)/gi
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        metrics.push(...matches);
      }
    });

    return metrics;
  }
};