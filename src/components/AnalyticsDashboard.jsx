/**
 * Analytics Dashboard Component
 * Data-driven analytics with conversion tracking and revenue estimation
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart2, TrendingUp, Users, ShoppingCart, 
  Euro, MessageCircle, Eye, MousePointer, Calendar 
} from 'lucide-react';

const AnalyticsDashboard = ({ events, tenant, catalogs }) => {
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d', '90d', 'all'

  // Filter events by time range
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange === '7d') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      cutoffDate.setDate(now.getDate() - 90);
    } else {
      return events;
    }
    
    return events.filter(event => new Date(event.created_at) >= cutoffDate);
  }, [events, timeRange]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const views = filteredEvents.filter(e => e.event_type === 'view_catalog').length;
    const clicks = filteredEvents.filter(e => e.event_type === 'click_product').length;
    const orders = filteredEvents.filter(e => e.event_type === 'click_whatsapp').length;
    
    // Calculate estimated revenue from WhatsApp orders
    const estimatedRevenue = filteredEvents
      .filter(e => e.event_type === 'click_whatsapp')
      .reduce((sum, e) => {
        const qty = e.metadata?.quantity || 1;
        const price = e.metadata?.total || e.metadata?.price || 0;
        return sum + (qty * price);
      }, 0);
    
    // Conversion rates
    const viewToClickRate = views > 0 ? ((clicks / views) * 100).toFixed(1) : 0;
    const clickToOrderRate = clicks > 0 ? ((orders / clicks) * 100).toFixed(1) : 0;
    const viewToOrderRate = views > 0 ? ((orders / views) * 100).toFixed(1) : 0;
    
    // Average order value
    const avgOrderValue = orders > 0 ? (estimatedRevenue / orders) : 0;
    
    return {
      views,
      clicks,
      orders,
      estimatedRevenue,
      viewToClickRate,
      clickToOrderRate,
      viewToOrderRate,
      avgOrderValue
    };
  }, [filteredEvents]);

  // Group events by catalog
  const catalogPerformance = useMemo(() => {
    if (!catalogs) return [];
    
    return catalogs.map(catalog => {
      const catalogEvents = filteredEvents.filter(e => e.catalog_id === catalog.id);
      
      const views = catalogEvents.filter(e => e.event_type === 'view_catalog').length;
      const clicks = catalogEvents.filter(e => e.event_type === 'click_product').length;
      const orders = catalogEvents.filter(e => e.event_type === 'click_whatsapp').length;
      
      const revenue = catalogEvents
        .filter(e => e.event_type === 'click_whatsapp')
        .reduce((sum, e) => {
          const qty = e.metadata?.quantity || 1;
          const price = e.metadata?.total || e.metadata?.price || 0;
          return sum + (qty * price);
        }, 0);
      
      return {
        catalog,
        views,
        clicks,
        orders,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [filteredEvents, catalogs]);

  // Group events by day for trend chart
  const dailyTrends = useMemo(() => {
    const days = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      
      if (!days[date]) {
        days[date] = {
          date,
          views: 0,
          clicks: 0,
          orders: 0,
          revenue: 0
        };
      }
      
      if (event.event_type === 'view_catalog') {
        days[date].views++;
      } else if (event.event_type === 'click_product') {
        days[date].clicks++;
      } else if (event.event_type === 'click_whatsapp') {
        days[date].orders++;
        const qty = event.metadata?.quantity || 1;
        const price = event.metadata?.total || event.metadata?.price || 0;
        days[date].revenue += qty * price;
      }
    });
    
    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEvents]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-title">
          <BarChart2 size={24} />
          <h2>Analytics & Performance</h2>
        </div>
        
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            7 giorni
          </button>
          <button 
            className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30 giorni
          </button>
          <button 
            className={`range-btn ${timeRange === '90d' ? 'active' : ''}`}
            onClick={() => setTimeRange('90d')}
          >
            90 giorni
          </button>
          <button 
            className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            Tutto
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          icon={<Eye size={20} />}
          label="Visualizzazioni Volantini"
          value={metrics.views}
          trend="+12%"
          color="#3b82f6"
        />
        
        <MetricCard
          icon={<MousePointer size={20} />}
          label="Clic Prodotti"
          value={metrics.clicks}
          rate={`${metrics.viewToClickRate}% conv.`}
          color="#8b5cf6"
        />
        
        <MetricCard
          icon={<MessageCircle size={20} />}
          label="Ordini WhatsApp"
          value={metrics.orders}
          rate={`${metrics.clickToOrderRate}% conv.`}
          color="#25D366"
        />
        
        <MetricCard
          icon={<Euro size={20} />}
          label="Fatturato Stimato"
          value={formatCurrency(metrics.estimatedRevenue)}
          avg={`€${metrics.avgOrderValue.toFixed(2)} medio/ordine`}
          color="#eab308"
        />
      </div>

      {/* Conversion Funnel */}
      <div className="conversion-funnel-section">
        <h3>Funnel di Conversione</h3>
        <div className="conversion-funnel">
          <div className="funnel-stage views">
            <div className="stage-bar" style={{ width: '100%' }}>
              <span>{metrics.views} visualizzazioni</span>
            </div>
            <span className="stage-label">100%</span>
          </div>
          
          <div className="funnel-connector"></div>
          
          <div className="funnel-stage clicks">
            <div className="stage-bar" style={{ width: `${Math.min(100, metrics.viewToClickRate)}%` }}>
              <span>{metrics.clicks} clic prodotti</span>
            </div>
            <span className="stage-label">{metrics.viewToClickRate}%</span>
          </div>
          
          <div className="funnel-connector"></div>
          
          <div className="funnel-stage orders">
            <div className="stage-bar" style={{ width: `${Math.min(100, metrics.viewToOrderRate)}%` }}>
              <span>{metrics.orders} ordini</span>
            </div>
            <span className="stage-label">{metrics.viewToOrderRate}%</span>
          </div>
        </div>
      </div>

      {/* Catalog Performance Table */}
      <div className="catalog-performance-section">
        <h3>Performance per Volantino</h3>
        <div className="performance-table">
          <table>
            <thead>
              <tr>
                <th>Volantino</th>
                <th>Visualizzazioni</th>
                <th>Clic</th>
                <th>Ordini</th>
                <th>Fatturato</th>
              </tr>
            </thead>
            <tbody>
              {catalogPerformance.map(({ catalog, views, clicks, orders, revenue }) => (
                <tr key={catalog.id}>
                  <td className="catalog-name">{catalog.name}</td>
                  <td>{views}</td>
                  <td>{clicks}</td>
                  <td>{orders}</td>
                  <td className="revenue-cell">{formatCurrency(revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Trends */}
      {dailyTrends.length > 0 && (
        <div className="daily-trends-section">
          <h3>Andamento Giornaliero</h3>
          <div className="trends-chart">
            {dailyTrends.slice(-14).map(day => (
              <div key={day.date} className="day-column">
                <div className="bars-container">
                  <div 
                    className="bar views-bar" 
                    style={{ height: `${Math.min(100, (day.views / Math.max(1, ...dailyTrends.map(d => d.views))) * 100)}%` }}
                    title={`${day.views} visualizzazioni`}
                  ></div>
                  <div 
                    className="bar orders-bar" 
                    style={{ height: `${Math.min(100, (day.orders / Math.max(1, ...dailyTrends.map(d => d.orders))) * 100)}%` }}
                    title={`${day.orders} ordini`}
                  ></div>
                </div>
                <span className="day-label">{formatDate(day.date)}</span>
                <span className="day-revenue">{formatCurrency(day.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events Log */}
      <div className="recent-events-section">
        <h3>Eventi Recenti</h3>
        <div className="events-log">
          {filteredEvents.slice(0, 20).map(event => (
            <div key={event.id} className="event-row">
              <div className="event-icon">
                {event.event_type === 'view_catalog' && <Eye size={16} />}
                {event.event_type === 'click_product' && <MousePointer size={16} />}
                {event.event_type === 'click_whatsapp' && <MessageCircle size={16} />}
              </div>
              
              <div className="event-details">
                <span className="event-type">
                  {event.event_type === 'view_catalog' && 'Visualizzazione volantino'}
                  {event.event_type === 'click_product' && 'Clic prodotto'}
                  {event.event_type === 'click_whatsapp' && 'Ordine WhatsApp'}
                </span>
                
                {event.metadata?.product_name && (
                  <span className="event-product">
                    {event.metadata.product_name} 
                    {event.metadata?.quantity && ` (${event.metadata.quantity}x)`}
                  </span>
                )}
                
                <span className="event-time">
                  {new Date(event.created_at).toLocaleString('it-IT')}
                </span>
              </div>
              
              {event.metadata?.total && (
                <div className="event-value">
                  €{(event.metadata.total * (event.metadata.quantity || 1)).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .analytics-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .analytics-title h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .time-range-selector {
          display: flex;
          gap: 8px;
        }

        .range-btn {
          padding: 8px 16px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #ffffff);
          border-radius: var(--radius-md, 8px);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast, 150ms);
        }

        .range-btn:hover {
          background: var(--bg-tertiary, #f1f5f9);
        }

        .range-btn.active {
          background: var(--brand-primary, #A62B2B);
          color: white;
          border-color: var(--brand-primary, #A62B2B);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: var(--bg-secondary, #ffffff);
          padding: 20px;
          border-radius: var(--radius-lg, 12px);
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
          border: 1px solid var(--border-color, #e2e8f0);
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md, 8px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-secondary, #64748b);
          font-weight: 500;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .metric-rate {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
        }

        .conversion-funnel-section,
        .catalog-performance-section,
        .daily-trends-section,
        .recent-events-section {
          background: var(--bg-secondary, #ffffff);
          padding: 24px;
          border-radius: var(--radius-lg, 12px);
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
          margin-bottom: 24px;
        }

        h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 20px 0;
        }

        .conversion-funnel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .funnel-stage {
          width: 100%;
          text-align: center;
        }

        .stage-bar {
          background: linear-gradient(90deg, var(--brand-primary, #A62B2B), var(--brand-secondary, #FFC107));
          padding: 12px;
          border-radius: var(--radius-md, 8px);
          color: white;
          font-weight: 600;
          font-size: 14px;
          transition: width 0.5s ease;
        }

        .stage-label {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
          margin-top: 4px;
          display: block;
        }

        .funnel-connector {
          width: 2px;
          height: 16px;
          background: var(--border-color, #e2e8f0);
        }

        .performance-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }

        th {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary, #64748b);
          text-transform: uppercase;
        }

        td {
          font-size: 14px;
        }

        .catalog-name {
          font-weight: 600;
        }

        .revenue-cell {
          font-weight: 700;
          color: var(--success-color, #10b981);
        }

        .trends-chart {
          display: flex;
          gap: 8px;
          height: 200px;
          align-items: flex-end;
          padding: 16px 0;
        }

        .day-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bars-container {
          width: 100%;
          height: 150px;
          display: flex;
          gap: 2px;
          align-items: flex-end;
          justify-content: center;
        }

        .bar {
          flex: 1;
          border-radius: var(--radius-sm, 4px);
          min-height: 4px;
        }

        .views-bar {
          background: #3b82f6;
        }

        .orders-bar {
          background: #25D366;
        }

        .day-label {
          font-size: 11px;
          color: var(--text-secondary, #64748b);
          transform: rotate(-45deg);
          transform-origin: top left;
        }

        .day-revenue {
          font-size: 11px;
          font-weight: 600;
          color: var(--success-color, #10b981);
        }

        .events-log {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .event-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-primary, #f8fafc);
          border-radius: var(--radius-md, 8px);
        }

        .event-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-secondary, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-primary, #A62B2B);
        }

        .event-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .event-type {
          font-size: 13px;
          font-weight: 600;
        }

        .event-product {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
        }

        .event-time {
          font-size: 11px;
          color: var(--text-tertiary, #94a3b8);
        }

        .event-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--success-color, #10b981);
        }

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .time-range-selector {
            width: 100%;
            overflow-x: auto;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .trends-chart {
            overflow-x: auto;
            height: auto;
          }

          .day-column {
            min-width: 60px;
          }
        }
      `}</style>
    </div>
  );
};

// Metric Card Sub-component
const MetricCard = ({ icon, label, value, trend, rate, avg, color }) => (
  <div className="metric-card">
    <div className="metric-header">
      <div className="metric-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <span className="metric-label">{label}</span>
    </div>
    <div className="metric-value">{typeof value === 'number' ? value.toLocaleString('it-IT') : value}</div>
    {trend && <div className="metric-rate" style={{ color: '#10b981' }}>{trend}</div>}
    {rate && <div className="metric-rate">{rate}</div>}
    {avg && <div className="metric-rate">{avg}</div>}
  </div>
);

export default AnalyticsDashboard;
