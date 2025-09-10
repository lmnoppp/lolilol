import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar,
  Star,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import useN8NWebhook from '../hooks/useN8NWebhook';
import useRealtimeData from '../hooks/useRealtimeData';
import { formatters, metrics } from '../utils/dataFormatter';
import toast from 'react-hot-toast';

const CRMPipeline = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [viewMode, setViewMode] = useState('pipeline'); // pipeline, list, analytics

  const { processLead, triggerEmailAutomation, loading } = useN8NWebhook();
  const { data: realtimeData, sendData } = useRealtimeData();

  // États du pipeline
  const pipelineStages = [
    { id: 'new', name: 'Nouveaux', color: 'from-blue-500 to-blue-600', count: 0 },
    { id: 'contacted', name: 'Contactés', color: 'from-yellow-500 to-yellow-600', count: 0 },
    { id: 'qualified', name: 'Qualifiés', color: 'from-orange-500 to-orange-600', count: 0 },
    { id: 'proposal', name: 'Proposition', color: 'from-purple-500 to-purple-600', count: 0 },
    { id: 'negotiation', name: 'Négociation', color: 'from-pink-500 to-pink-600', count: 0 },
    { id: 'closed-won', name: 'Gagnés', color: 'from-green-500 to-green-600', count: 0 },
    { id: 'closed-lost', name: 'Perdus', color: 'from-red-500 to-red-600', count: 0 }
  ];

  // Données des leads (simulées)
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Marie Dubois',
      email: 'marie.dubois@example.com',
      phone: '+33 6 12 34 56 78',
      company: 'TechStart SAS',
      position: 'CEO',
      score: 85,
      status: 'qualified',
      source: 'LinkedIn',
      value: 15000,
      probability: 75,
      lastContact: '2024-01-15',
      nextAction: 'Appel de suivi',
      notes: 'Très intéressée par notre solution. Budget confirmé.',
      tags: ['Hot Lead', 'Decision Maker'],
      avatar: null,
      created: '2024-01-10'
    },
    {
      id: 2,
      name: 'Pierre Martin',
      email: 'p.martin@innovcorp.fr',
      phone: '+33 1 23 45 67 89',
      company: 'InnovCorp',
      position: 'Directeur Marketing',
      score: 92,
      status: 'proposal',
      source: 'Google Ads',
      value: 25000,
      probability: 85,
      lastContact: '2024-01-14',
      nextAction: 'Présentation solution',
      notes: 'Demande personnalisation. Meeting prévu vendredi.',
      tags: ['High Value', 'Urgent'],
      avatar: null,
      created: '2024-01-08'
    },
    {
      id: 3,
      name: 'Sophie Laurent',
      email: 'sophie@digitalagency.com',
      phone: '+33 4 56 78 90 12',
      company: 'Digital Agency',
      position: 'Founder',
      score: 68,
      status: 'contacted',
      source: 'Facebook',
      value: 8000,
      probability: 45,
      lastContact: '2024-01-13',
      nextAction: 'Email de suivi',
      notes: 'Réponse positive mais doit consulter son équipe.',
      tags: ['SME', 'Follow-up'],
      avatar: null,
      created: '2024-01-12'
    },
    {
      id: 4,
      name: 'Thomas Rousseau',
      email: 'thomas@startup.io',
      phone: '+33 7 89 01 23 45',
      company: 'StartupIO',
      position: 'CTO',
      score: 78,
      status: 'negotiation',
      source: 'Referral',
      value: 18000,
      probability: 80,
      lastContact: '2024-01-16',
      nextAction: 'Négociation prix',
      notes: 'Intéressé mais budget serré. Proposer plan échelonné.',
      tags: ['Technical', 'Price Sensitive'],
      avatar: null,
      created: '2024-01-05'
    },
    {
      id: 5,
      name: 'Camille Durand',
      email: 'c.durand@enterprise.com',
      phone: '+33 2 34 56 78 90',
      company: 'Enterprise Corp',
      position: 'Marketing Director',
      score: 95,
      status: 'closed-won',
      source: 'Website',
      value: 35000,
      probability: 100,
      lastContact: '2024-01-17',
      nextAction: 'Onboarding',
      notes: 'Deal fermé ! Signature contrat reçue.',
      tags: ['Won', 'Enterprise'],
      avatar: null,
      created: '2024-01-03'
    }
  ]);

  // Mettre à jour les compteurs des étapes
  useEffect(() => {
    const updatedStages = pipelineStages.map(stage => ({
      ...stage,
      count: leads.filter(lead => lead.status === stage.id).length
    }));
    // Ici on pourrait mettre à jour l'état si nécessaire
  }, [leads]);

  // Filtrer les leads
  const filteredLeads = leads.filter(lead => {
    const matchesFilter = selectedFilter === 'all' || lead.status === selectedFilter;
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Gérer le drag & drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const leadId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    // Mettre à jour localement
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, lastContact: new Date().toISOString().split('T')[0] }
        : lead
    ));

    // Notifier N8N du changement de statut
    try {
      const lead = leads.find(l => l.id === leadId);
      await processLead({
        ...lead,
        status: newStatus,
        action: 'status_change'
      });
      
      toast.success(`Lead déplacé vers "${pipelineStages.find(s => s.id === newStatus)?.name}"`);
      
      // Envoyer via WebSocket pour synchronisation temps réel
      sendData('lead_updated', { leadId, newStatus, timestamp: new Date().toISOString() });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lead:', error);
      toast.error('Erreur lors de la mise à jour');
      
      // Rollback en cas d'erreur
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: source.droppableId }
          : lead
      ));
    }
  };

  // Calculer les métriques du pipeline
  const pipelineMetrics = {
    totalLeads: leads.length,
    totalValue: leads.reduce((sum, lead) => sum + (lead.value || 0), 0),
    avgScore: leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length,
    conversionRate: leads.filter(l => l.status === 'closed-won').length / leads.length * 100,
    hotLeads: leads.filter(l => l.score >= 80).length,
    avgDealSize: leads.filter(l => l.status === 'closed-won').reduce((sum, lead) => sum + lead.value, 0) / leads.filter(l => l.status === 'closed-won').length || 0
  };

  // Composant LeadCard
  const LeadCard = ({ lead, index }) => {
    const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-400 bg-green-500/20';
      if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
      return 'text-red-400 bg-red-500/20';
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'new': return <UserPlus className="w-4 h-4" />;
        case 'contacted': return <Phone className="w-4 h-4" />;
        case 'qualified': return <Star className="w-4 h-4" />;
        case 'proposal': return <Mail className="w-4 h-4" />;
        case 'negotiation': return <TrendingUp className="w-4 h-4" />;
        case 'closed-won': return <CheckCircle className="w-4 h-4" />;
        case 'closed-lost': return <XCircle className="w-4 h-4" />;
        default: return <Users className="w-4 h-4" />;
      }
    };

    return (
      <Draggable draggableId={lead.id.toString()} index={index}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`card-glass p-4 mb-3 cursor-pointer hover:scale-102 transition-all duration-200 ${
              snapshot.isDragging ? 'rotate-2 shadow-2xl' : ''
            }`}
            onClick={() => setSelectedLead(lead)}
            whileHover={{ y: -2 }}
            layout
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {lead.name.charAt(0)}{lead.name.split(' ')[1]?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{lead.name}</h4>
                  <p className="text-slate-400 text-xs">{lead.company}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                {lead.score}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Valeur</span>
                <span className="text-white font-medium">{formatters.currency(lead.value)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Probabilité</span>
                <span className="text-white font-medium">{lead.probability}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Source</span>
                <span className="text-primary-400">{lead.source}</span>
              </div>
            </div>

            {lead.tags && lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {lead.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30"
                  >
                    {tag}
                  </span>
                ))}
                {lead.tags.length > 2 && (
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                    +{lead.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
              <div className="flex items-center text-xs text-slate-400">
                <Clock className="w-3 h-3 mr-1" />
                {formatters.date(lead.lastContact, 'short')}
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(lead.status)}
              </div>
            </div>
          </motion.div>
        )}
      </Draggable>
    );
  };

  // Composant PipelineColumn
  const PipelineColumn = ({ stage }) => {
    const stageLeads = filteredLeads.filter(lead => lead.status === stage.id);
    const stageValue = stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    return (
      <div className="bg-dark-900/40 backdrop-blur-xl border border-primary-500/10 rounded-xl p-4 min-h-[600px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color} mr-2`}></div>
              {stage.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {stageLeads.length} leads • {formatters.currency(stageValue)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full text-xs font-medium">
              {stageLeads.length}
            </span>
          </div>
        </div>

        <Droppable droppableId={stage.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[500px] transition-colors duration-200 rounded-lg p-2 ${
                snapshot.isDraggingOver ? 'bg-primary-500/10 border-2 border-dashed border-primary-500/30' : ''
              }`}
            >
              <AnimatePresence>
                {stageLeads.map((lead, index) => (
                  <LeadCard key={lead.id} lead={lead} index={index} />
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  // Composant de métriques
  const MetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <motion.div
        className="card-glass p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Leads</p>
            <p className="text-2xl font-bold text-white">{pipelineMetrics.totalLeads}</p>
          </div>
          <Users className="w-8 h-8 text-primary-400" />
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
            <p className="text-slate-400 text-sm">Valeur Pipeline</p>
            <p className="text-2xl font-bold text-white">{formatters.currency(pipelineMetrics.totalValue)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-400" />
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
            <p className="text-slate-400 text-sm">Score Moyen</p>
            <p className="text-2xl font-bold text-white">{formatters.number(pipelineMetrics.avgScore, 0)}</p>
          </div>
          <Target className="w-8 h-8 text-yellow-400" />
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
            <p className="text-slate-400 text-sm">Taux Conversion</p>
            <p className="text-2xl font-bold text-white">{formatters.percentage(pipelineMetrics.conversionRate)}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>

      <motion.div
        className="card-glass p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Leads Chauds</p>
            <p className="text-2xl font-bold text-white">{pipelineMetrics.hotLeads}</p>
          </div>
          <Zap className="w-8 h-8 text-orange-400" />
        </div>
      </motion.div>

      <motion.div
        className="card-glass p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Deal Moyen</p>
            <p className="text-2xl font-bold text-white">{formatters.currency(pipelineMetrics.avgDealSize)}</p>
          </div>
          <Star className="w-8 h-8 text-pink-400" />
        </div>
      </motion.div>
    </div>
  );

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
              Pipeline CRM
            </h1>
            <p className="text-slate-400 text-lg">
              Gestion intelligente des prospects • {formatters.date(new Date(), 'datetime')}
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-cyber pl-10 pr-4 py-2 text-sm w-64"
              />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="all">Tous les leads</option>
              {pipelineStages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="pipeline">Pipeline</option>
              <option value="list">Liste</option>
              <option value="analytics">Analytics</option>
            </select>
            
            <button
              onClick={() => setIsAddingLead(true)}
              className="btn-primary text-sm py-2 px-4 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Lead
            </button>
          </div>
        </div>
      </motion.div>

      {/* Métriques */}
      <MetricsOverview />

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 overflow-x-auto">
            {pipelineStages.map(stage => (
              <PipelineColumn key={stage.id} stage={stage} />
            ))}
          </div>
        </DragDropContext>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div
          className="card-glass p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-500/20">
                  <th className="text-left py-3 text-slate-400 font-medium">Lead</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Entreprise</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Statut</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Score</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Valeur</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Probabilité</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Dernier Contact</th>
                  <th className="text-center py-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <motion.tr
                    key={lead.id}
                    className="border-b border-slate-700/30 hover:bg-primary-500/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                          {lead.name.charAt(0)}{lead.name.split(' ')[1]?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{lead.name}</p>
                          <p className="text-xs text-slate-400">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-200">{lead.company}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                        pipelineStages.find(s => s.id === lead.status)?.color || 'from-gray-500 to-gray-600'
                      } text-white`}>
                        {pipelineStages.find(s => s.id === lead.status)?.name}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.score >= 80 ? 'text-green-400 bg-green-500/20' :
                        lead.score >= 60 ? 'text-yellow-400 bg-yellow-500/20' :
                        'text-red-400 bg-red-500/20'
                      }`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium text-white">
                      {formatters.currency(lead.value)}
                    </td>
                    <td className="py-4 text-right text-slate-200">
                      {lead.probability}%
                    </td>
                    <td className="py-4 text-slate-400">
                      {formatters.date(lead.lastContact, 'short')}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1 hover:bg-primary-500/20 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-primary-500/20 rounded transition-colors">
                          <Edit className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-red-500/20 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal de détail du lead */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              className="card-glass p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                    {selectedLead.name.charAt(0)}{selectedLead.name.split(' ')[1]?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedLead.name}</h2>
                    <p className="text-slate-400">{selectedLead.position} chez {selectedLead.company}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-slate-400">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedLead.email}
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedLead.phone}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Informations</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Score</span>
                      <span className={`font-medium ${
                        selectedLead.score >= 80 ? 'text-green-400' :
                        selectedLead.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {selectedLead.score}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valeur</span>
                      <span className="text-white font-medium">{formatters.currency(selectedLead.value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Probabilité</span>
                      <span className="text-white font-medium">{selectedLead.probability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source</span>
                      <span className="text-primary-400">{selectedLead.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Créé le</span>
                      <span className="text-slate-200">{formatters.date(selectedLead.created, 'medium')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button className="btn-primary w-full text-sm py-2 flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler
                    </button>
                    <button className="btn-secondary w-full text-sm py-2 flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer Email
                    </button>
                    <button className="btn-secondary w-full text-sm py-2 flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Planifier RDV
                    </button>
                  </div>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                  <p className="text-slate-300 bg-dark-800/50 p-4 rounded-lg border border-primary-500/20">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full border border-primary-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRMPipeline;