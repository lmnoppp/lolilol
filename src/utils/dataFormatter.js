// Utilitaires de formatage des données pour le dashboard marketing

// Formatage des nombres et devises
export const formatters = {
  // Formatter les devises
  currency: (value, currency = 'EUR', locale = 'fr-FR') => {
    if (value === null || value === undefined || isNaN(value)) return '0 €';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  },

  // Formatter les pourcentages
  percentage: (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
  },

  // Formatter les nombres avec séparateurs
  number: (value, decimals = 0, locale = 'fr-FR') => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  // Formatter les nombres compacts (K, M, B)
  compact: (value, locale = 'fr-FR') => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    
    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B';
    } else if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    }
    
    return value.toString();
  },

  // Formatter les dates
  date: (date, format = 'short', locale = 'fr-FR') => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    const formats = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      medium: { day: '2-digit', month: 'short', year: 'numeric' },
      long: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };

    return new Intl.DateTimeFormat(locale, formats[format] || formats.short).format(dateObj);
  },

  // Formatter la durée
  duration: (seconds) => {
    if (!seconds || isNaN(seconds)) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
};

// Calculs de métriques marketing
export const metrics = {
  // Calculer le ROI
  roi: (revenue, cost) => {
    if (!cost || cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  },

  // Calculer le ROAS (Return on Ad Spend)
  roas: (revenue, adSpend) => {
    if (!adSpend || adSpend === 0) return 0;
    return revenue / adSpend;
  },

  // Calculer le CAC (Customer Acquisition Cost)
  cac: (totalCost, newCustomers) => {
    if (!newCustomers || newCustomers === 0) return 0;
    return totalCost / newCustomers;
  },

  // Calculer le CTR (Click Through Rate)
  ctr: (clicks, impressions) => {
    if (!impressions || impressions === 0) return 0;
    return (clicks / impressions) * 100;
  },

  // Calculer le taux de conversion
  conversionRate: (conversions, clicks) => {
    if (!clicks || clicks === 0) return 0;
    return (conversions / clicks) * 100;
  },

  // Calculer le CPC (Cost Per Click)
  cpc: (totalCost, clicks) => {
    if (!clicks || clicks === 0) return 0;
    return totalCost / clicks;
  },

  // Calculer le CPA (Cost Per Acquisition)
  cpa: (totalCost, conversions) => {
    if (!conversions || conversions === 0) return 0;
    return totalCost / conversions;
  },

  // Calculer la LTV (Lifetime Value)
  ltv: (averageOrderValue, purchaseFrequency, customerLifespan) => {
    return averageOrderValue * purchaseFrequency * customerLifespan;
  },

  // Calculer le ratio LTV/CAC
  ltvCacRatio: (ltv, cac) => {
    if (!cac || cac === 0) return 0;
    return ltv / cac;
  }
};

// Transformateurs de données pour les graphiques
export const chartTransformers = {
  // Transformer les données pour un graphique linéaire
  lineChart: (data, xKey, yKey, dateFormat = 'short') => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      [xKey]: formatters.date(item[xKey], dateFormat),
      [yKey]: Number(item[yKey]) || 0
    }));
  },

  // Transformer les données pour un graphique en barres
  barChart: (data, categoryKey, valueKey) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      name: item[categoryKey],
      value: Number(item[valueKey]) || 0,
      ...item
    }));
  },

  // Transformer les données pour un graphique en secteurs
  pieChart: (data, labelKey, valueKey) => {
    if (!Array.isArray(data)) return [];
    
    const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
    
    return data.map(item => {
      const value = Number(item[valueKey]) || 0;
      return {
        name: item[labelKey],
        value: value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        ...item
      };
    });
  },

  // Transformer les données pour un graphique d'aires
  areaChart: (data, xKey, ...yKeys) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => {
      const transformed = {
        [xKey]: formatters.date(item[xKey], 'short')
      };
      
      yKeys.forEach(key => {
        transformed[key] = Number(item[key]) || 0;
      });
      
      return { ...item, ...transformed };
    });
  }
};

// Analyseurs de données
export const analyzers = {
  // Analyser les tendances
  analyzeTrend: (data, valueKey) => {
    if (!Array.isArray(data) || data.length < 2) {
      return { trend: 'stable', change: 0, direction: 'neutral' };
    }

    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstValue = Number(sortedData[0][valueKey]) || 0;
    const lastValue = Number(sortedData[sortedData.length - 1][valueKey]) || 0;
    
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    let trend = 'stable';
    let direction = 'neutral';
    
    if (Math.abs(changePercent) > 5) {
      if (changePercent > 0) {
        trend = 'increasing';
        direction = 'up';
      } else {
        trend = 'decreasing';
        direction = 'down';
      }
    }
    
    return {
      trend,
      direction,
      change: changePercent,
      absolute: change,
      first: firstValue,
      last: lastValue
    };
  },

  // Identifier les outliers
  findOutliers: (data, valueKey) => {
    if (!Array.isArray(data) || data.length < 4) return [];
    
    const values = data.map(item => Number(item[valueKey]) || 0).sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.filter(item => {
      const value = Number(item[valueKey]) || 0;
      return value < lowerBound || value > upperBound;
    });
  },

  // Calculer des statistiques de base
  calculateStats: (data, valueKey) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { min: 0, max: 0, avg: 0, sum: 0, count: 0 };
    }
    
    const values = data.map(item => Number(item[valueKey]) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    const avg = count > 0 ? sum / count : 0;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { min, max, avg, sum, count };
  },

  // Analyser la performance par période
  analyzePerformanceByPeriod: (data, dateKey, valueKey, periodType = 'day') => {
    if (!Array.isArray(data)) return {};
    
    const grouped = {};
    
    data.forEach(item => {
      const date = new Date(item[dateKey]);
      let key;
      
      switch (periodType) {
        case 'hour':
          key = date.getHours();
          break;
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(Number(item[valueKey]) || 0);
    });
    
    // Calculer les statistiques pour chaque période
    const result = {};
    Object.entries(grouped).forEach(([period, values]) => {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = values.length > 0 ? sum / values.length : 0;
      result[period] = {
        sum,
        avg,
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    });
    
    return result;
  }
};

// Utilitaires de couleurs pour les graphiques
export const colorUtils = {
  // Palette de couleurs principales (thème futuriste bleu)
  primaryColors: [
    '#56b2d5', // Bleu principal
    '#5cc3fd', // Bleu clair
    '#2563eb', // Bleu foncé
    '#1d4ed8', // Bleu très foncé
    '#90daff', // Bleu très clair
    '#1e40af', // Bleu marine
    '#3b82f6', // Bleu standard
    '#60a5fa'  // Bleu moyen
  ],

  // Couleurs de statut
  statusColors: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#56b2d5',
    neutral: '#6b7280'
  },

  // Générer une couleur basée sur un index
  getColorByIndex: (index) => {
    return colorUtils.primaryColors[index % colorUtils.primaryColors.length];
  },

  // Générer une couleur basée sur une valeur
  getColorByValue: (value, min, max) => {
    const ratio = (value - min) / (max - min);
    
    if (ratio < 0.33) return '#ef4444'; // Rouge pour faible
    if (ratio < 0.66) return '#f59e0b'; // Orange pour moyen
    return '#10b981'; // Vert pour élevé
  },

  // Convertir hex en rgba
  hexToRgba: (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
};

// Validateurs de données
export const validators = {
  // Valider les données de campagne
  validateCampaignData: (campaign) => {
    const required = ['name', 'platform', 'budget', 'status'];
    const missing = required.filter(field => !campaign[field]);
    
    return {
      valid: missing.length === 0,
      missing,
      errors: missing.map(field => `Le champ '${field}' est requis`)
    };
  },

  // Valider les données de lead
  validateLeadData: (lead) => {
    const required = ['name', 'email'];
    const missing = required.filter(field => !lead[field]);
    
    const errors = [...missing.map(field => `Le champ '${field}' est requis`)];
    
    // Valider l'email
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      errors.push('Format d\'email invalide');
    }
    
    return {
      valid: errors.length === 0,
      missing,
      errors
    };
  },

  // Valider les métriques
  validateMetrics: (metrics) => {
    const numericFields = ['revenue', 'spend', 'impressions', 'clicks', 'conversions'];
    const errors = [];
    
    numericFields.forEach(field => {
      if (metrics[field] !== undefined && (isNaN(metrics[field]) || metrics[field] < 0)) {
        errors.push(`${field} doit être un nombre positif`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Export par défaut avec tous les utilitaires
export default {
  formatters,
  metrics,
  chartTransformers,
  analyzers,
  colorUtils,
  validators
};