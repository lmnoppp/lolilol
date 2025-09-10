import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader, 
  Sparkles, 
  Brain,
  Zap,
  Database,
  Target,
  TrendingUp,
  MessageSquare,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import useN8NWebhook from '../hooks/useN8NWebhook';
import { marketingAgent, aiUtils } from '../utils/aiAgent';
import { formatters } from '../utils/dataFormatter';
import toast from 'react-hot-toast';

const ChatAgent = ({ isOpen, onToggle, className = '' }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "👋 Salut ! Je suis votre assistant marketing IA. Je peux vous aider à analyser vos performances, optimiser vos campagnes, gérer vos leads et bien plus encore. Que souhaitez-vous savoir ?",
      timestamp: new Date(),
      tools_used: [],
      type: 'welcome'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { queryMarketingAgent, loading, error } = useN8NWebhook();

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Initialiser l'agent avec le contexte utilisateur
  useEffect(() => {
    marketingAgent.updateContext({
      userId: localStorage.getItem('userId') || 'anonymous',
      sessionId: localStorage.getItem('sessionId') || aiUtils.generateSessionId(),
      userName: localStorage.getItem('userName') || 'Utilisateur',
      currentPage: window.location.pathname
    });
  }, []);

  // Gérer l'envoi des messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Valider l'input utilisateur
    const validation = aiUtils.validateUserInput(userMessage);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Ajouter le message utilisateur
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    // Ajouter à l'historique de l'agent
    marketingAgent.addToHistory('user', userMessage);

    try {
      // Formatter la requête pour N8N
      const request = marketingAgent.formatRequest(userMessage, {
        previous_messages: messages.slice(-3), // Contexte des 3 derniers messages
        user_intent: marketingAgent.analyzeIntent(userMessage)
      });

      // Envoyer la requête à l'agent N8N
      const response = await queryMarketingAgent(request.user_message, request.context);
      
      // Traiter la réponse
      const processedResponse = marketingAgent.processResponse(response);
      
      // Ajouter la réponse de l'IA
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: processedResponse.text,
        timestamp: new Date(),
        tools_used: processedResponse.tools_used,
        execution_time: processedResponse.execution_time,
        data: processedResponse.data,
        recommendations: processedResponse.recommendations,
        type: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Afficher une notification de succès si des outils ont été utilisés
      if (processedResponse.tools_used.length > 0) {
        toast.success(`Analyse effectuée avec ${processedResponse.tools_used.length} outil(s)`);
      }

    } catch (err) {
      console.error('Erreur lors de la communication avec l\'agent:', err);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Désolé, je rencontre une difficulté technique : ${err.message}. Pouvez-vous réessayer ou reformuler votre question ?`,
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erreur de communication avec l\'agent IA');
    } finally {
      setIsTyping(false);
    }
  };

  // Gérer les suggestions rapides
  const handleQuickSuggestion = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  // Obtenir les suggestions basées sur l'historique
  const suggestions = marketingAgent.getSuggestions();

  // Composant Message
  const Message = ({ message }) => {
    const isUser = message.role === 'user';
    const isError = message.type === 'error';
    const isWelcome = message.type === 'welcome';

    return (
      <motion.div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          {/* Avatar */}
          <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser 
                ? 'bg-primary-500 text-white' 
                : isError 
                  ? 'bg-red-500 text-white'
                  : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'
            }`}>
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message bubble */}
            <div className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-primary-500 text-white'
                : isError
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                  : isWelcome
                    ? 'bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/30 text-slate-200'
                    : 'bg-dark-800/60 border border-primary-500/20 text-slate-200 backdrop-blur-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>

              {/* Métadonnées pour les messages de l'assistant */}
              {!isUser && message.tools_used && message.tools_used.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary-500/20">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {aiUtils.formatToolsUsed(message.tools_used).map((tool, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-500/20 text-primary-300 border border-primary-500/30"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                  {message.execution_time && (
                    <p className="text-xs text-slate-400">
                      Traité en {aiUtils.formatExecutionTime(message.execution_time)}
                    </p>
                  )}
                </div>
              )}

              {/* Recommandations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary-500/20">
                  <h4 className="text-xs font-semibold text-primary-400 mb-2 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommandations
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {message.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-400 mr-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <p className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left ml-11'}`}>
            {formatters.date(message.timestamp, 'time')}
          </p>
        </div>
      </motion.div>
    );
  };

  // Composant d'indicateur de frappe
  const TypingIndicator = () => (
    <motion.div
      className="flex justify-start mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <Brain className="w-4 h-4 animate-pulse" />
        </div>
        <div className="bg-dark-800/60 border border-primary-500/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-slate-400 ml-2">L'IA analyse votre demande...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed bottom-4 right-4 z-50 ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      <div className={`card-glass shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Assistant Marketing IA</h3>
              <p className="text-xs text-slate-400">
                {loading ? 'En cours d\'analyse...' : 'En ligne'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4 text-slate-400" /> : <Minimize2 className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {messages.map(message => (
                <Message key={message.id} message={message} />
              ))}
              
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions rapides */}
            {suggestions.length > 0 && !loading && (
              <div className="px-4 py-2 border-t border-primary-500/20">
                <p className="text-xs text-slate-400 mb-2">Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="text-xs px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full hover:bg-primary-500/30 transition-colors border border-primary-500/30"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-primary-500/20">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Posez votre question marketing..."
                    className="input-cyber w-full pr-12 text-sm"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {loading ? (
                      <Loader className="w-4 h-4 text-primary-400 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {error && (
                <p className="text-red-400 text-xs mt-2 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  {error}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ChatAgent;