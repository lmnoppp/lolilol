import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MousePointer, 
  Eye,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useRealtimeData from '../hooks/useRealtimeData';
import useN8NWebhook from '../hooks/useN8NWebhook';
import { formatters, metrics, chartTransformers, analyzers, colorUtils } from '../utils/dataFormatter';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: realtimeData, connected } = useRealtimeData();
  const { triggerDataSync, loading: syncLoading } = useN8NWebhook();

  // Données simulées pour la démonstration (en attendant les vraies données)
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      revenue: 45650,
      spend: 18200,
      conversions: 342,
      clicks: 8950,
      impressions: 125400,
      leads: 89,
      roi: 150.8,
      ctr: 7.14
    },
    trends: [
      { date: '2024-01-01', revenue: 3200, spend: 1200, conversions: 28 },
      { date: '2024-01-02', revenue: 4100, spend: 1350, conversions: 35 },
      { date: '2024-01-03', revenue: 3800, spend: 1180, conversions: 31 },
      { date: '2024-01-04', revenue: 5200, spend: 1580, conversions: 42 },
      { date: '2024-01-05', revenue: 4850, spend: 1420, conversions: 38 },
      { date: '2024-01-06', revenue: 6200, spend: 1680, conversions: 48 },
      { date: '2024-01-07', revenue: 5800, spend: 1590, conversions: 45 }
    ],
    platforms: [
      { name: 'Facebook', revenue: 18500, spend: 7200, color: '#1877f2' },
      { name: 'Google', revenue: 15200, spend: 6800, color: '#4285f4' },
      { name: 'LinkedIn', revenue: 8950, spend: 3200, color: '#0077b5' },
      { name: 'Instagram', revenue: 3000, spend: 1000, color: '#e4405f' }
    ]
  });

  // Effet pour charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Ici on ferait l'appel réel à l'API N8N
        // const data = await triggerDataSync();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Mettre à jour les données avec les données temps réel
  useEffect(() => {
    if (realtimeData?.metrics) {
      setDashboardData(prev => ({
        ...prev,
        metrics: { ...prev.metrics, ...realtimeData.metrics }
      }));
    }
  }, [realtimeData]);

  // Calculer les métriques dérivées
  const calculatedMetrics = {
    roi: metrics.roi(dashboardData.metrics.revenue, dashboardData.metrics.spend),
    roas: metrics.roas(dashboardData.metrics.revenue, dashboardData.metrics.spend),
    ctr: metrics.ctr(dashboardData.metrics.clicks, dashboardData.metrics.impressions),
    conversionRate: metrics.conversionRate(dashboardData.metrics.conversions, dashboardData.metrics.clicks),
    cpc: metrics.cpc(dashboardData.metrics.spend, dashboardData.metrics.clicks),
    cpa: metrics.cpa(dashboardData.metrics.spend, dashboardData.metrics.conversions)
  };

  // Analyser les tendances
  const trendAnalysis = analyzers.analyzeTrend(dashboardData.trends, 'revenue');

  // Composant MetricCard
  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number' }) => (
    <motion.div
      className="metric-card group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:shadow-lg transition-all duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {formatters.percentage(Math.abs(change))}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white mb-1">
          {format === 'currency' && formatters.currency(value)}
          {format === 'percentage' && formatters.percentage(value)}
          {format === 'number' && formatters.compact(value)}
        </p>
      </div>
    </motion.div>
  );

  // Composant de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 to-dark-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-primary-400 mb-2">Chargement du Dashboard</h2>
          <p className="text-slate-400">Synchronisation des données en cours...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 to-dark-900 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Marketing Intelligence Hub
            </h1>
            <p className="text-slate-400 text-lg">
              Dashboard en temps réel • {formatters.date(new Date(), 'datetime')}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <div className={`flex items-center text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                {connected ? 'Connecté en temps réel' : 'Hors ligne'}
              </div>
              <button
                onClick={() => triggerDataSync()}
                disabled={syncLoading}
                className="btn-secondary text-xs py-1 px-3"
              >
                {syncLoading ? 'Synchronisation...' : 'Actualiser'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Chiffre d'affaires"
          value={dashboardData.metrics.revenue}
          change={trendAnalysis.change}
          icon={DollarSign}
          color="from-primary-500 to-primary-600"
          format="currency"
        />
        <MetricCard
          title="Dépenses publicitaires"
          value={dashboardData.metrics.spend}
          change={-2.3}
          icon={Target}
          color="from-orange-500 to-orange-600"
          format="currency"
        />
        <MetricCard
          title="ROI"
          value={calculatedMetrics.roi}
          change={15.8}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
          format="percentage"
        />
        <MetricCard
          title="Conversions"
          value={dashboardData.metrics.conversions}
          change={8.2}
          icon={Zap}
          color="from-purple-500 to-purple-600"
          format="number"
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Clics"
          value={dashboardData.metrics.clicks}
          change={5.7}
          icon={MousePointer}
          color="from-blue-500 to-blue-600"
          format="number"
        />
        <MetricCard
          title="Impressions"
          value={dashboardData.metrics.impressions}
          change={12.4}
          icon={Eye}
          color="from-indigo-500 to-indigo-600"
          format="number"
        />
        <MetricCard
          title="CTR"
          value={calculatedMetrics.ctr}
          change={-0.8}
          icon={Activity}
          color="from-cyan-500 to-cyan-600"
          format="percentage"
        />
        <MetricCard
          title="Nouveaux Leads"
          value={dashboardData.metrics.leads}
          change={23.1}
          icon={Users}
          color="from-pink-500 to-pink-600"
          format="number"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Graphique des tendances */}
        <motion.div
          className="card-glass p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
              Évolution des revenus
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-green-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{formatters.percentage(trendAnalysis.change)}
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartTransformers.lineChart(dashboardData.trends, 'date', 'revenue')}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#56b2d5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#56b2d5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(86, 178, 213, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatters.compact(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(86, 178, 213, 0.3)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: '#56b2d5' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value) => [formatters.currency(value), 'Revenus']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#56b2d5"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={{ fill: '#56b2d5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#56b2d5', strokeWidth: 2, fill: '#1e293b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Graphique par plateforme */}
        <motion.div
          className="card-glass p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-primary-400" />
              Performance par plateforme
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={chartTransformers.pieChart(dashboardData.platforms, 'name', 'revenue')}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {dashboardData.platforms.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || colorUtils.getColorByIndex(index)}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(86, 178, 213, 0.3)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
                formatter={(value, name) => [formatters.currency(value), name]}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          {/* Légende */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {dashboardData.platforms.map((platform, index) => (
              <div key={platform.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: platform.color || colorUtils.getColorByIndex(index) }}
                ></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 font-medium">{platform.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatters.currency(platform.revenue)} • ROI: {formatters.percentage(metrics.roi(platform.revenue, platform.spend))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alertes et recommandations */}
      <motion.div
        className="card-glass p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-primary-400" />
          Insights et Recommandations IA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start">
              <TrendingUp className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-400 mb-1">Performance Excellente</h4>
                <p className="text-sm text-slate-300">
                  Vos campagnes Facebook génèrent un ROI de {formatters.percentage(metrics.roi(18500, 7200))}. 
                  Considérez augmenter le budget de 20%.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-start">
              <TrendingDown className="w-5 h-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-400 mb-1">Attention requise</h4>
                <p className="text-sm text-slate-300">
                  Le CTR Instagram a baissé de 0.8%. Testez de nouveaux visuels 
                  ou ajustez le ciblage.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
            <div className="flex items-start">
              <Target className="w-5 h-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-primary-400 mb-1">Opportunité</h4>
                <p className="text-sm text-slate-300">
                  89 nouveaux leads qualifiés cette semaine. Activez la séquence 
                  de nurturing automatique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;