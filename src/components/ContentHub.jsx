import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Calendar, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  TrendingUp,
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  Clock,
  Zap,
  Target,
  BarChart3,
  Image,
  Video,
  FileText,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Globe,
  Send,
  Sparkles
} from 'lucide-react';
import useN8NWebhook from '../hooks/useN8NWebhook';
import useRealtimeData from '../hooks/useRealtimeData';
import { formatters } from '../utils/dataFormatter';
import toast from 'react-hot-toast';

const ContentHub = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, calendar, analytics
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const { generateContent, loading } = useN8NWebhook();
  const { data: realtimeData, sendData } = useRealtimeData();

  // Types de contenu
  const contentTypes = [
    { id: 'post', name: 'Post Social', icon: MessageCircle, color: 'from-blue-500 to-blue-600' },
    { id: 'article', name: 'Article Blog', icon: FileText, color: 'from-green-500 to-green-600' },
    { id: 'video', name: 'Vidéo', icon: Video, color: 'from-red-500 to-red-600' },
    { id: 'image', name: 'Image', icon: Image, color: 'from-purple-500 to-purple-600' },
    { id: 'story', name: 'Story', icon: Zap, color: 'from-orange-500 to-orange-600' }
  ];

  // Plateformes
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077b5' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877f2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#e4405f' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1da1f2' },
    { id: 'website', name: 'Site Web', icon: Globe, color: '#56b2d5' }
  ];

  // Statuts de contenu
  const statuses = [
    { id: 'draft', name: 'Brouillon', color: 'from-gray-500 to-gray-600' },
    { id: 'scheduled', name: 'Programmé', color: 'from-yellow-500 to-yellow-600' },
    { id: 'published', name: 'Publié', color: 'from-green-500 to-green-600' },
    { id: 'archived', name: 'Archivé', color: 'from-red-500 to-red-600' }
  ];

  // Données de contenu simulées
  const [contents, setContents] = useState([
    {
      id: 1,
      title: 'Les tendances marketing digital 2024',
      type: 'article',
      platform: ['linkedin', 'website'],
      status: 'published',
      content: 'Découvrez les 10 tendances marketing qui vont révolutionner votre stratégie en 2024...',
      scheduledDate: '2024-01-15T10:00:00',
      publishedDate: '2024-01-15T10:00:00',
      author: 'IA Marketing Agent',
      engagement: {
        views: 1250,
        likes: 89,
        shares: 23,
        comments: 12
      },
      tags: ['Marketing Digital', 'Tendances', '2024'],
      thumbnail: null,
      aiGenerated: true,
      performance: 8.5
    },
    {
      id: 2,
      title: 'Comment optimiser votre ROI publicitaire',
      type: 'post',
      platform: ['facebook', 'linkedin'],
      status: 'scheduled',
      content: '🎯 5 stratégies éprouvées pour maximiser votre retour sur investissement publicitaire...',
      scheduledDate: '2024-01-18T14:30:00',
      publishedDate: null,
      author: 'IA Marketing Agent',
      engagement: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
      },
      tags: ['ROI', 'Publicité', 'Optimisation'],
      thumbnail: null,
      aiGenerated: true,
      performance: null
    },
    {
      id: 3,
      title: 'Vidéo : Automatisation marketing avec N8N',
      type: 'video',
      platform: ['instagram', 'facebook'],
      status: 'published',
      content: 'Tutoriel complet sur l\'automatisation de vos campagnes marketing...',
      scheduledDate: '2024-01-12T16:00:00',
      publishedDate: '2024-01-12T16:00:00',
      author: 'Équipe Marketing',
      engagement: {
        views: 3420,
        likes: 156,
        shares: 45,
        comments: 28
      },
      tags: ['Automatisation', 'N8N', 'Tutorial'],
      thumbnail: null,
      aiGenerated: false,
      performance: 9.2
    },
    {
      id: 4,
      title: 'Infographie : Statistiques e-commerce 2024',
      type: 'image',
      platform: ['instagram', 'linkedin'],
      status: 'draft',
      content: 'Infographie présentant les dernières statistiques du e-commerce...',
      scheduledDate: null,
      publishedDate: null,
      author: 'IA Marketing Agent',
      engagement: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
      },
      tags: ['E-commerce', 'Statistiques', 'Infographie'],
      thumbnail: null,
      aiGenerated: true,
      performance: null
    },
    {
      id: 5,
      title: 'Story : Behind the scenes',
      type: 'story',
      platform: ['instagram'],
      status: 'archived',
      content: 'Coulisses de notre équipe marketing en action...',
      scheduledDate: '2024-01-10T12:00:00',
      publishedDate: '2024-01-10T12:00:00',
      author: 'Community Manager',
      engagement: {
        views: 890,
        likes: 67,
        shares: 12,
        comments: 8
      },
      tags: ['Behind the scenes', 'Équipe'],
      thumbnail: null,
      aiGenerated: false,
      performance: 7.8
    }
  ]);

  // Filtrer le contenu
  const filteredContents = contents.filter(content => {
    const matchesPlatform = selectedPlatform === 'all' || content.platform.includes(selectedPlatform);
    const matchesStatus = selectedStatus === 'all' || content.status === selectedStatus;
    const matchesType = selectedContentType === 'all' || content.type === selectedContentType;
    const matchesSearch = !searchTerm || 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesPlatform && matchesStatus && matchesType && matchesSearch;
  });

  // Calculer les métriques de contenu
  const contentMetrics = {
    totalContent: contents.length,
    published: contents.filter(c => c.status === 'published').length,
    scheduled: contents.filter(c => c.status === 'scheduled').length,
    drafts: contents.filter(c => c.status === 'draft').length,
    totalViews: contents.reduce((sum, c) => sum + c.engagement.views, 0),
    totalEngagement: contents.reduce((sum, c) => sum + c.engagement.likes + c.engagement.shares + c.engagement.comments, 0),
    avgPerformance: contents.filter(c => c.performance).reduce((sum, c) => sum + c.performance, 0) / contents.filter(c => c.performance).length || 0,
    aiGenerated: contents.filter(c => c.aiGenerated).length
  };

  // Générer du contenu avec l'IA
  const handleGenerateContent = async (contentType, platform, topic) => {
    try {
      const response = await generateContent(contentType, {
        platform: platform,
        topic: topic,
        tone: 'professional',
        length: contentType === 'article' ? 'long' : 'medium',
        includeHashtags: platform !== 'linkedin',
        language: 'fr'
      });

      if (response.success) {
        const newContent = {
          id: Date.now(),
          title: response.data.title || `Nouveau ${contentType}`,
          type: contentType,
          platform: [platform],
          status: 'draft',
          content: response.data.content,
          scheduledDate: null,
          publishedDate: null,
          author: 'IA Marketing Agent',
          engagement: { views: 0, likes: 0, shares: 0, comments: 0 },
          tags: response.data.tags || [],
          thumbnail: null,
          aiGenerated: true,
          performance: null
        };

        setContents(prev => [newContent, ...prev]);
        toast.success('Contenu généré avec succès !');
        setIsCreating(false);
      }
    } catch (error) {
      toast.error('Erreur lors de la génération du contenu');
      console.error(error);
    }
  };

  // Composant ContentCard
  const ContentCard = ({ content }) => {
    const contentType = contentTypes.find(t => t.id === content.type);
    const status = statuses.find(s => s.id === content.status);
    const ContentIcon = contentType?.icon || FileText;

    return (
      <motion.div
        className="card-glass p-6 hover:scale-102 transition-all duration-300 cursor-pointer group"
        onClick={() => setSelectedContent(content)}
        whileHover={{ y: -2 }}
        layout
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${contentType?.color || 'from-gray-500 to-gray-600'} group-hover:shadow-lg transition-all duration-300`}>
              <ContentIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
                {content.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {contentType?.name} • {formatters.date(content.scheduledDate || content.publishedDate || content.createdAt, 'short')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${status?.color} text-white`}>
              {status?.name}
            </span>
            {content.aiGenerated && (
              <div className="flex items-center text-xs text-primary-400">
                <Sparkles className="w-3 h-3 mr-1" />
                IA
              </div>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-slate-300 text-sm line-clamp-2 mb-4">
          {content.content}
        </p>

        {/* Platforms */}
        <div className="flex items-center space-x-2 mb-4">
          {content.platform.map(platformId => {
            const platform = platforms.find(p => p.id === platformId);
            const PlatformIcon = platform?.icon || Globe;
            return (
              <div
                key={platformId}
                className="flex items-center text-xs text-slate-400"
                title={platform?.name}
              >
                <PlatformIcon 
                  className="w-4 h-4" 
                  style={{ color: platform?.color }}
                />
              </div>
            );
          })}
        </div>

        {/* Engagement Stats */}
        {content.status === 'published' && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Vues</p>
              <p className="text-sm font-semibold text-white">{formatters.compact(content.engagement.views)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Likes</p>
              <p className="text-sm font-semibold text-white">{formatters.compact(content.engagement.likes)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Partages</p>
              <p className="text-sm font-semibold text-white">{formatters.compact(content.engagement.shares)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Commentaires</p>
              <p className="text-sm font-semibold text-white">{formatters.compact(content.engagement.comments)}</p>
            </div>
          </div>
        )}

        {/* Performance Score */}
        {content.performance && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
            <span className="text-xs text-slate-400">Performance</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                content.performance >= 8 ? 'bg-green-400' :
                content.performance >= 6 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-semibold text-white">{content.performance}/10</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {content.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30"
              >
                #{tag}
              </span>
            ))}
            {content.tags.length > 2 && (
              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                +{content.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // Composant de métriques
  const MetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <motion.div
        className="card-glass p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Contenus</p>
            <p className="text-2xl font-bold text-white">{contentMetrics.totalContent}</p>
            <p className="text-xs text-slate-500 mt-1">
              {contentMetrics.aiGenerated} générés par IA
            </p>
          </div>
          <FileText className="w-8 h-8 text-primary-400" />
        </div>
      </motion.div>

      <motion.div
        className="card-glass p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Vues Totales</p>
            <p className="text-2xl font-bold text-white">{formatters.compact(contentMetrics.totalViews)}</p>
            <p className="text-xs text-green-400 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5%
            </p>
          </div>
          <Eye className="w-8 h-8 text-green-400" />
        </div>
      </motion.div>

      <motion.div
        className="card-glass p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Engagement</p>
            <p className="text-2xl font-bold text-white">{formatters.compact(contentMetrics.totalEngagement)}</p>
            <p className="text-xs text-blue-400 mt-1">
              Interactions totales
            </p>
          </div>
          <Heart className="w-8 h-8 text-pink-400" />
        </div>
      </motion.div>

      <motion.div
        className="card-glass p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Performance Moy.</p>
            <p className="text-2xl font-bold text-white">{formatters.number(contentMetrics.avgPerformance, 1)}/10</p>
            <p className="text-xs text-purple-400 mt-1">
              Score IA
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>
    </div>
  );

  // Modal de création de contenu
  const CreateContentModal = () => {
    const [selectedType, setSelectedType] = useState('post');
    const [selectedPlatformModal, setSelectedPlatformModal] = useState('linkedin');
    const [topic, setTopic] = useState('');

    return (
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCreating(false)}
      >
        <motion.div
          className="card-glass p-6 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary-400" />
            Générer du contenu IA
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type de contenu
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-cyber w-full"
              >
                {contentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Plateforme
              </label>
              <select
                value={selectedPlatformModal}
                onChange={(e) => setSelectedPlatformModal(e.target.value)}
                className="input-cyber w-full"
              >
                {platforms.map(platform => (
                  <option key={platform.id} value={platform.id}>{platform.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sujet / Thème
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Marketing automation, ROI publicitaire..."
                className="input-cyber w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={() => handleGenerateContent(selectedType, selectedPlatformModal, topic)}
              disabled={loading || !topic.trim()}
              className="btn-primary flex-1 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Générer
                </>
              )}
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="btn-secondary px-4"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 to-dark-900 p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Hub de Contenu
            </h1>
            <p className="text-slate-400 text-lg">
              Création et gestion de contenu IA • {formatters.date(new Date(), 'datetime')}
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher du contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-cyber pl-10 pr-4 py-2 text-sm w-64"
              />
            </div>
            
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="all">Toutes plateformes</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="all">Tous statuts</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>

            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="all">Tous types</option>
              {contentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary text-sm py-2 px-4 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer avec IA
            </button>
          </div>
        </div>
      </motion.div>

      {/* Métriques */}
      <MetricsOverview />

      {/* Statuts rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statuses.map((status, index) => {
          const count = contents.filter(c => c.status === status.id).length;
          return (
            <motion.div
              key={status.id}
              className="card-glass p-4 cursor-pointer hover:scale-102 transition-all duration-300"
              onClick={() => setSelectedStatus(status.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{status.name}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${status.color}`}></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Contenu Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        layout
      >
        <AnimatePresence>
          {filteredContents.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ContentCard content={content} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Message si aucun contenu */}
      {filteredContents.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PenTool className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucun contenu trouvé</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || selectedPlatform !== 'all' || selectedStatus !== 'all' || selectedContentType !== 'all'
              ? 'Aucun contenu ne correspond à vos filtres'
              : 'Commencez par créer votre premier contenu'
            }
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center mx-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Créer du contenu avec IA
          </button>
        </motion.div>
      )}

      {/* Modal de création */}
      <AnimatePresence>
        {isCreating && <CreateContentModal />}
      </AnimatePresence>

      {/* Modal de détail du contenu */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              className="card-glass p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedContent.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>{contentTypes.find(t => t.id === selectedContent.type)?.name}</span>
                    <span>•</span>
                    <span>{selectedContent.author}</span>
                    <span>•</span>
                    <span>{formatters.date(selectedContent.publishedDate || selectedContent.scheduledDate, 'datetime')}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Contenu</h3>
                <div className="bg-dark-800/50 p-4 rounded-lg border border-primary-500/20">
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedContent.content}</p>
                </div>
              </div>

              {selectedContent.status === 'published' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-dark-800/30 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Vues</p>
                    <p className="text-lg font-bold text-white">{formatters.compact(selectedContent.engagement.views)}</p>
                  </div>
                  <div className="text-center p-3 bg-dark-800/30 rounded-lg">
                    <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Likes</p>
                    <p className="text-lg font-bold text-white">{formatters.compact(selectedContent.engagement.likes)}</p>
                  </div>
                  <div className="text-center p-3 bg-dark-800/30 rounded-lg">
                    <Share2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Partages</p>
                    <p className="text-lg font-bold text-white">{formatters.compact(selectedContent.engagement.shares)}</p>
                  </div>
                  <div className="text-center p-3 bg-dark-800/30 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Commentaires</p>
                    <p className="text-lg font-bold text-white">{formatters.compact(selectedContent.engagement.comments)}</p>
                  </div>
                </div>
              )}

              {selectedContent.tags && selectedContent.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full border border-primary-500/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button className="btn-primary flex-1 flex items-center justify-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </button>
                <button className="btn-secondary flex items-center justify-center">
                  <Send className="w-4 h-4 mr-2" />
                  Programmer
                </button>
                <button className="btn-secondary flex items-center justify-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentHub;