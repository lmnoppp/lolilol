import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  MousePointer, 
  Eye,
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import useRealtimeData from '../hooks/useRealtimeData';
import useN8NWebhook from '../hooks/useN8NWebhook';
import { formatters, metrics, chartTransformers, analyzers, colorUtils } from '../utils/dataFormatter';

const MarketingMetrics = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison
  const [isLoading, setIsLoading] = useState(false);

  const { data: realtimeData, connected, requestUpdate } = useRealtimeData();
  const { triggerDataSync, loading: syncLoading } = useN8NWebhook();

  // Données détaillées simulées
  const [metricsData, setMetricsData] = useState({
    overview: {
      totalRevenue: 156780,
      totalSpend: 62340,
      totalConversions: 1247,
      totalClicks: 34560,
      totalImpressions: 890450,
      totalLeads: 456,
      avgCTR: 3.88,
      avgCPC: 1.80,
      avgCPA: 49.99,
      avgROI: 151.5
    },
    platforms: [
      {
        name: 'Facebook',
        revenue: 58900,
        spend: 22100,
        conversions: 467,
        clicks: 12890,
        impressions: 345600,
        leads: 189,
        color: '#1877f2',
        trend: 'up'
      },
      {
        name: 'Google Ads',
        revenue: 47200,
        spend: 19800,
        conversions: 398,
        clicks: 11200,
        impressions: 298700,
        leads: 156,
        color: '#4285f4',
        trend: 'up'
      },
      {
        name: 'LinkedIn',
        revenue: 32400,
        spend: 14200,
        conversions: 234,
        clicks: 7890,
        impressions: 156800,
        leads: 87,
        color: '#0077b5',
        trend: 'stable'
      },
      {
        name: 'Instagram',
        revenue: 18280,
        spend: 6240,
        conversions: 148,
        clicks: 2580,
        impressions: 89350,
        leads: 24,
        color: '#e4405f',
        trend: 'down'
      }
    ],
    timeline: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        revenue: 3000 + Math.random() * 4000,
        spend: 1200 + Math.random() * 1600,
        conversions: 25 + Math.random() * 35,
        clicks: 800 + Math.random() * 600,
        impressions: 20000 + Math.random() * 15000,
        leads: 10 + Math.random() * 20
      };
    }),
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      revenue: 100 + Math.random() * 300,
      spend: 40 + Math.random() * 120,
      conversions: 1 + Math.random() * 8,
      clicks: 30 + Math.random() * 70
    }))
  });

  // Actualiser les données
  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await triggerDataSync(['facebook', 'google', 'linkedin', 'instagram']);
      await requestUpdate('metrics');
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les métriques filtrées
  const getFilteredData = () => {
    if (selectedPlatform === 'all') {
      return metricsData;
    }
    
    const platform = metricsData.platforms.find(p => p.name.toLowerCase() === selectedPlatform);
    if (!platform) return metricsData;

    return {
      ...metricsData,
      overview: {
        totalRevenue: platform.revenue,
        totalSpend: platform.spend,
        totalConversions: platform.conversions,
        totalClicks: platform.clicks,
        totalImpressions: platform.impressions,
        totalLeads: platform.leads,
        avgCTR: metrics.ctr(platform.clicks, platform.impressions),
        avgCPC: metrics.cpc(platform.spend, platform.clicks),
        avgCPA: metrics.cpa(platform.spend, platform.conversions),
        avgROI: metrics.roi(platform.revenue, platform.spend)
      }
    };
  };

  const filteredData = getFilteredData();

  // Composant MetricCard avancé
  const AdvancedMetricCard = ({ title, value, previousValue, icon: Icon, color, format = 'number', subtitle }) => {
    const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
    const isPositive = change >= 0;

    return (
      <motion.div
        className="metric-card group relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Fond animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:shadow-lg transition-all duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {previousValue && (
              <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
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
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Composant de comparaison des plateformes
  const PlatformComparison = () => (
    <motion.div
      className="card-glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
          Comparaison des plateformes
        </h3>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="input-cyber text-sm py-2 px-3"
        >
          <option value="revenue">Revenus</option>
          <option value="roi">ROI</option>
          <option value="conversions">Conversions</option>
          <option value="ctr">CTR</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={metricsData.platforms}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(86, 178, 213, 0.1)" />
          <XAxis 
            dataKey="name" 
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
            tickFormatter={(value) => {
              if (selectedMetric === 'revenue') return formatters.compact(value);
              if (selectedMetric === 'roi') return formatters.percentage(value);
              return formatters.number(value);
            }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(86, 178, 213, 0.3)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
            formatter={(value, name, props) => {
              let formattedValue = value;
              if (selectedMetric === 'revenue') formattedValue = formatters.currency(value);
              else if (selectedMetric === 'roi') formattedValue = formatters.percentage(metrics.roi(props.payload.revenue, props.payload.spend));
              else if (selectedMetric === 'ctr') formattedValue = formatters.percentage(metrics.ctr(props.payload.clicks, props.payload.impressions));
              
              return [formattedValue, name];
            }}
          />
          <Bar
            dataKey={selectedMetric === 'roi' ? 'revenue' : selectedMetric}
            radius={[4, 4, 0, 0]}
            fill="#56b2d5"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Tableau détaillé */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary-500/20">
              <th className="text-left py-2 text-slate-400 font-medium">Plateforme</th>
              <th className="text-right py-2 text-slate-400 font-medium">Revenus</th>
              <th className="text-right py-2 text-slate-400 font-medium">Dépenses</th>
              <th className="text-right py-2 text-slate-400 font-medium">ROI</th>
              <th className="text-right py-2 text-slate-400 font-medium">Conversions</th>
              <th className="text-right py-2 text-slate-400 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody>
            {metricsData.platforms.map((platform, index) => {
              const platformROI = metrics.roi(platform.revenue, platform.spend);
              const platformCTR = metrics.ctr(platform.clicks, platform.impressions);
              
              return (
                <tr key={platform.name} className="border-b border-slate-700/30 hover:bg-primary-500/5 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: platform.color }}
                      ></div>
                      <span className="text-slate-200 font-medium">{platform.name}</span>
                      <div className={`ml-2 flex items-center text-xs ${
                        platform.trend === 'up' ? 'text-green-400' : 
                        platform.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {platform.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {platform.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-3 text-slate-200 font-medium">
                    {formatters.currency(platform.revenue)}
                  </td>
                  <td className="text-right py-3 text-slate-400">
                    {formatters.currency(platform.spend)}
                  </td>
                  <td className={`text-right py-3 font-medium ${platformROI > 100 ? 'text-green-400' : 'text-orange-400'}`}>
                    {formatters.percentage(platformROI)}
                  </td>
                  <td className="text-right py-3 text-slate-200">
                    {formatters.number(platform.conversions)}
                  </td>
                  <td className={`text-right py-3 font-medium ${platformCTR > 3 ? 'text-green-400' : 'text-orange-400'}`}>
                    {formatters.percentage(platformCTR)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  // Composant graphique temporel
  const TimelineChart = () => (
    <motion.div
      className="card-glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-400" />
          Évolution temporelle ({selectedPeriod})
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-cyber text-sm py-2 px-3"
          >
            <option value="24h">24 heures</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartTransformers.lineChart(metricsData.timeline, 'date', 'revenue')}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#56b2d5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#56b2d5" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(86, 178, 213, 0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatters.date(value, 'short')}
          />
          <YAxis 
            yAxisId="left"
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatters.compact(value)}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(86, 178, 213, 0.3)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
            formatter={(value, name) => {
              if (name === 'revenue' || name === 'spend') {
                return [formatters.currency(value), name === 'revenue' ? 'Revenus' : 'Dépenses'];
              }
              return [formatters.number(value), name];
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            fill="url(#revenueGradient)"
            stroke="#56b2d5"
            strokeWidth={2}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="spend"
            fill="url(#spendGradient)"
            stroke="#f59e0b"
            strokeWidth={2}
          />
          <Bar
            yAxisId="right"
            dataKey="conversions"
            fill="#10b981"
            radius={[2, 2, 0, 0]}
            opacity={0.7}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );

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
              Métriques Marketing
            </h1>
            <p className="text-slate-400 text-lg">
              Analyse détaillée des performances • {formatters.date(new Date(), 'datetime')}
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="all">Toutes les plateformes</option>
              <option value="facebook">Facebook</option>
              <option value="google ads">Google Ads</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="input-cyber text-sm py-2 px-3"
            >
              <option value="overview">Vue d'ensemble</option>
              <option value="detailed">Détaillée</option>
              <option value="comparison">Comparaison</option>
            </select>
            
            <button
              onClick={handleRefreshData}
              disabled={isLoading || syncLoading}
              className="btn-secondary text-sm py-2 px-4 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || syncLoading) ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
      </motion.div>

      {/* Indicateur de connexion */}
      <motion.div
        className="mb-6 flex items-center justify-between p-4 card-glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <div className={`flex items-center text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            {connected ? 'Données en temps réel' : 'Mode hors ligne'}
          </div>
          <div className="text-slate-400 text-sm">
            Dernière mise à jour: {formatters.date(new Date(), 'time')}
          </div>
        </div>
        
        {selectedPlatform !== 'all' && (
          <div className="flex items-center text-sm text-primary-400">
            <Filter className="w-4 h-4 mr-1" />
            Filtré: {selectedPlatform}
          </div>
        )}
      </motion.div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <AdvancedMetricCard
          title="Chiffre d'affaires"
          value={filteredData.overview.totalRevenue}
          previousValue={filteredData.overview.totalRevenue * 0.85}
          icon={DollarSign}
          color="from-primary-500 to-primary-600"
          format="currency"
          subtitle="Total période"
        />
        <AdvancedMetricCard
          title="Dépenses"
          value={filteredData.overview.totalSpend}
          previousValue={filteredData.overview.totalSpend * 0.92}
          icon={Target}
          color="from-orange-500 to-orange-600"
          format="currency"
          subtitle="Budget utilisé"
        />
        <AdvancedMetricCard
          title="ROI Moyen"
          value={filteredData.overview.avgROI}
          previousValue={filteredData.overview.avgROI * 0.88}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
          format="percentage"
          subtitle="Retour sur investissement"
        />
        <AdvancedMetricCard
          title="Conversions"
          value={filteredData.overview.totalConversions}
          previousValue={filteredData.overview.totalConversions * 0.91}
          icon={Zap}
          color="from-purple-500 to-purple-600"
          format="number"
          subtitle="Actions réalisées"
        />
        <AdvancedMetricCard
          title="Nouveaux Leads"
          value={filteredData.overview.totalLeads}
          previousValue={filteredData.overview.totalLeads * 0.76}
          icon={Users}
          color="from-pink-500 to-pink-600"
          format="number"
          subtitle="Prospects qualifiés"
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AdvancedMetricCard
          title="CTR Moyen"
          value={filteredData.overview.avgCTR}
          previousValue={filteredData.overview.avgCTR * 0.95}
          icon={MousePointer}
          color="from-blue-500 to-blue-600"
          format="percentage"
          subtitle="Taux de clic"
        />
        <AdvancedMetricCard
          title="CPC Moyen"
          value={filteredData.overview.avgCPC}
          previousValue={filteredData.overview.avgCPC * 1.08}
          icon={Eye}
          color="from-indigo-500 to-indigo-600"
          format="currency"
          subtitle="Coût par clic"
        />
        <AdvancedMetricCard
          title="CPA Moyen"
          value={filteredData.overview.avgCPA}
          previousValue={filteredData.overview.avgCPA * 1.12}
          icon={Target}
          color="from-cyan-500 to-cyan-600"
          format="currency"
          subtitle="Coût par acquisition"
        />
        <AdvancedMetricCard
          title="Impressions"
          value={filteredData.overview.totalImpressions}
          previousValue={filteredData.overview.totalImpressions * 0.89}
          icon={Eye}
          color="from-teal-500 to-teal-600"
          format="number"
          subtitle="Affichages totaux"
        />
      </div>

      {/* Graphiques selon le mode de vue */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TimelineChart />
          <PlatformComparison />
        </div>
      )}

      {viewMode === 'comparison' && (
        <div className="grid grid-cols-1 gap-8 mb-8">
          <PlatformComparison />
          <TimelineChart />
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 gap-8 mb-8">
          <TimelineChart />
          <PlatformComparison />
          
          {/* Graphique horaire */}
          <motion.div
            className="card-glass p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
              Performance par heure
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsData.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(86, 178, 213, 0.1)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => `${value}h`}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => formatters.compact(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(86, 178, 213, 0.3)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatters.currency(value) : formatters.number(value),
                    name === 'revenue' ? 'Revenus' : name === 'conversions' ? 'Conversions' : 'Clics'
                  ]}
                />
                <Bar dataKey="revenue" fill="#56b2d5" radius={[2, 2, 0, 0]} />
                <Bar dataKey="conversions" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MarketingMetrics;