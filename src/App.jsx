import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { 
  BarChart3, 
  Users, 
  PenTool, 
  Target,
  Bot,
  Settings,
  Menu,
  X,
  Zap,
  Bell,
  User,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';

// Composants
import Dashboard from './components/Dashboard';
import ChatAgent from './components/ChatAgent';
import MarketingMetrics from './components/MarketingMetrics';
import CRMPipeline from './components/CRMPipeline';
import ContentHub from './components/ContentHub';

// Hooks
import useRealtimeData from './hooks/useRealtimeData';
import useN8NWebhook from './hooks/useN8NWebhook';

// Utilitaires
import { formatters } from './utils/dataFormatter';
import { marketingAgent } from './utils/aiAgent';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({
    name: 'Marketing Manager',
    email: 'manager@company.com',
    avatar: null,
    role: 'Admin'
  });

  const { connected, connectionStatus, data: realtimeData } = useRealtimeData();
  const { isConnected: n8nConnected } = useN8NWebhook();

  // Menu de navigation
  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      component: Dashboard,
      description: 'Vue d\'ensemble des performances'
    },
    {
      id: 'metrics',
      name: 'Métriques',
      icon: Target,
      component: MarketingMetrics,
      description: 'Analyses détaillées des campagnes'
    },
    {
      id: 'crm',
      name: 'Pipeline CRM',
      icon: Users,
      component: CRMPipeline,
      description: 'Gestion des leads et prospects'
    },
    {
      id: 'content',
      name: 'Hub Contenu',
      icon: PenTool,
      component: ContentHub,
      description: 'Création et gestion de contenu IA'
    }
  ];

  // Initialiser l'agent IA avec le contexte utilisateur
  useEffect(() => {
    marketingAgent.updateContext({
      userId: user.email,
      userName: user.name,
      userRole: user.role,
      sessionStarted: new Date().toISOString()
    });
  }, [user]);

  // Simuler des notifications temps réel
  useEffect(() => {
    if (connected && realtimeData) {
      // Ici on pourrait traiter les vraies notifications depuis N8N
      const mockNotifications = [
        {
          id: Date.now(),
          type: 'success',
          title: 'Nouvelle conversion',
          message: 'Un lead a été converti en client',
          timestamp: new Date(),
          read: false
        }
      ];
      
      // Ajouter les nouvelles notifications (simulation)
      if (Math.random() > 0.95) { // 5% de chance à chaque update
        setNotifications(prev => [...mockNotifications, ...prev.slice(0, 4)]);
      }
    }
  }, [connected, realtimeData]);

  // Composant Sidebar
  const Sidebar = () => {
    const currentItem = navigationItems.find(item => item.id === currentPage);

    return (
      <motion.div
        className={`fixed left-0 top-0 h-full w-64 bg-dark-900/95 backdrop-blur-xl border-r border-primary-500/20 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        initial={false}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gradient">Marketing Hub</h1>
              <p className="text-xs text-slate-400 mt-1">Intelligence artificielle</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500 leading-tight">{item.description}</p>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Statut des connexions */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-dark-800/50 rounded-lg p-3 border border-primary-500/20">
            <h4 className="text-sm font-semibold text-white mb-2">Statut des services</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs">
                  {connected ? <Wifi className="w-3 h-3 text-green-400 mr-2" /> : <WifiOff className="w-3 h-3 text-red-400 mr-2" />}
                  <span className="text-slate-300">Temps réel</span>
                </div>
                <span className={`text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connected ? 'Connecté' : 'Hors ligne'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs">
                  <Bot className={`w-3 h-3 mr-2 ${n8nConnected ? 'text-green-400' : 'text-red-400'}`} />
                  <span className="text-slate-300">Agent IA</span>
                </div>
                <span className={`text-xs ${n8nConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {n8nConnected ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Composant Header
  const Header = () => {
    const currentItem = navigationItems.find(item => item.id === currentPage);
    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
      <motion.header
        className="bg-dark-900/80 backdrop-blur-xl border-b border-primary-500/20 px-4 lg:px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            
            <div>
              <h2 className="text-xl font-semibold text-white">
                {currentItem?.name}
              </h2>
              <p className="text-sm text-slate-400">
                {currentItem?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-slate-400" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* Chat Agent Toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                chatOpen 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : 'hover:bg-primary-500/20 text-slate-400'
              }`}
            >
              <Bot className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </motion.header>
    );
  };

  // Composant de chargement
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 to-dark-900 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Marketing Intelligence Hub</h2>
        <p className="text-slate-400 mb-4">Initialisation de l'interface...</p>
        <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
            Connexion aux services
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Agent IA prêt
          </div>
        </div>
      </motion.div>
    </div>
  );

  // État de chargement initial
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Obtenir le composant actuel
  const CurrentComponent = navigationItems.find(item => item.id === currentPage)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 to-dark-900 cyber-grid-bg">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Overlay pour mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <div className="lg:ml-64">
        <Header />
        
        <main className="min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Chat Agent */}
      <AnimatePresence>
        {chatOpen && (
          <ChatAgent
            isOpen={chatOpen}
            onToggle={() => setChatOpen(!chatOpen)}
          />
        )}
      </AnimatePresence>

      {/* Bouton flottant du chat (mobile) */}
      {!chatOpen && (
        <motion.button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 flex items-center justify-center z-40 lg:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      )}

      {/* Notifications Toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'toast-custom',
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(86, 178, 213, 0.3)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />

      {/* Indicateur de connexion flottant */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg backdrop-blur-sm border ${
          connected && n8nConnected
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connected && n8nConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          <span className="text-xs font-medium">
            {connected && n8nConnected ? 'Tous services actifs' : 'Services partiels'}
          </span>
        </div>
      </motion.div>

      {/* Particules d'arrière-plan (effet futuriste) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default App;