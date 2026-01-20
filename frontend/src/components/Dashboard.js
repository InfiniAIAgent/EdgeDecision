import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target, ArrowUpRight, ArrowDownRight, Calendar, Filter, Download, Settings as SettingsIcon, Bell, Search, Plus, Sun, Moon } from 'lucide-react';
import AIAssistant from './AIAssistant';
import Settings from './Settings';

// Mock data generators
const generateRevenueData = () => {
  const data = [];
  const baseRevenue = 45000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: baseRevenue + Math.random() * 25000,
      profit: (baseRevenue + Math.random() * 25000) * 0.3,
      orders: Math.floor(200 + Math.random() * 150),
      aov: 85 + Math.random() * 45
    });
  }
  return data;
};

const generateAttributionData = () => [
  { channel: 'Facebook Ads', revenue: 125000, orders: 1450, roas: 3.2, color: '#1877F2' },
  { channel: 'Google Ads', revenue: 98000, orders: 1120, roas: 2.8, color: '#4285F4' },
  { channel: 'TikTok Ads', revenue: 76000, orders: 890, roas: 4.1, color: '#000000' },
  { channel: 'Email (Klaviyo)', revenue: 54000, orders: 720, roas: 8.5, color: '#7C3AED' },
  { channel: 'Organic', revenue: 42000, orders: 580, roas: 999, color: '#10B981' },
  { channel: 'Instagram Ads', revenue: 38000, orders: 450, roas: 2.9, color: '#E4405F' }
];

const generateCustomerJourney = () => [
  { stage: 'Awareness', visitors: 45200, conversion: 100 },
  { stage: 'Consideration', visitors: 12400, conversion: 27.4 },
  { stage: 'Cart', visitors: 4820, conversion: 38.9 },
  { stage: 'Checkout', visitors: 2890, conversion: 60.0 },
  { stage: 'Purchase', visitors: 1734, conversion: 60.0 }
];

const generateProductData = () => [
  { name: 'Premium Hoodie', sales: 1240, revenue: 89600, margin: 42 },
  { name: 'Classic T-Shirt', sales: 2100, revenue: 52500, margin: 55 },
  { name: 'Denim Jacket', sales: 680, revenue: 81600, margin: 38 },
  { name: 'Running Shoes', sales: 890, revenue: 106800, margin: 45 },
  { name: 'Backpack Pro', sales: 540, revenue: 48600, margin: 51 }
];

const EcommerceAnalyticsDashboard = ({ onLogout }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [revenueData, setRevenueData] = useState([]);
  const [attributionData, setAttributionData] = useState([]);
  const [customerJourney, setCustomerJourney] = useState([]);
  const [productData, setProductData] = useState([]);
  const [activeTab, setActiveTab] = useState('ai');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configForm, setConfigForm] = useState({});
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    setRevenueData(generateRevenueData());
    setAttributionData(generateAttributionData());
    setCustomerJourney(generateCustomerJourney());
    setProductData(generateProductData());
  }, [timeRange]);

  useEffect(() => {
    console.log('Modal state changed:', showConfigModal, 'Selected:', selectedIntegration?.name);
  }, [showConfigModal, selectedIntegration]);

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Key metrics calculations
  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);
  const avgAOV = totalRevenue / totalOrders;
  const totalProfit = revenueData.reduce((sum, day) => sum + day.profit, 0);
  const profitMargin = (totalProfit / totalRevenue) * 100;
  
  const yesterdayRevenue = revenueData[revenueData.length - 1]?.revenue || 0;
  const dayBeforeRevenue = revenueData[revenueData.length - 2]?.revenue || 0;
  const revenueChange = ((yesterdayRevenue - dayBeforeRevenue) / dayBeforeRevenue) * 100;

  // Integration handlers
  const handleConfigureIntegration = (integration) => {
    console.log('Configure clicked for:', integration.name);
    setSelectedIntegration(integration);
    setConfigForm({});
    setShowConfigModal(true);
    console.log('Modal state set to true');
  };

  const handleCloseModal = () => {
    setShowConfigModal(false);
    setSelectedIntegration(null);
    setConfigForm({});
  };

  const handleConfigFormChange = (field, value) => {
    setConfigForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveIntegration = async () => {
    // This will call the backend API to save the integration
    console.log('Saving integration:', selectedIntegration.name, configForm);
    alert(`Configuration saved for ${selectedIntegration.name}!\nThis would normally call the backend API.`);
    handleCloseModal();
  };

  const MetricCard = ({ title, value, change, icon: Icon, subtitle, trend = 'up' }) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon" style={{ background: trend === 'up' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="metric-change" style={{ color: trend === 'up' ? '#10b981' : '#ef4444' }}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}%
        </div>
      </div>
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );

  const AttributionCard = ({ channel, revenue, orders, roas, color }) => (
    <div className="attribution-card">
      <div className="attribution-header">
        <div className="channel-indicator" style={{ backgroundColor: color }} />
        <div className="channel-name">{channel}</div>
      </div>
      <div className="attribution-metrics">
        <div className="attribution-metric">
          <span className="metric-label">Revenue</span>
          <span className="metric-value">${(revenue / 1000).toFixed(1)}k</span>
        </div>
        <div className="attribution-metric">
          <span className="metric-label">Orders</span>
          <span className="metric-value">{orders}</span>
        </div>
        <div className="attribution-metric">
          <span className="metric-label">ROAS</span>
          <span className="metric-value" style={{ color: roas > 3 ? '#10b981' : roas > 2 ? '#f59e0b' : '#ef4444' }}>
            {roas === 999 ? '∞' : roas.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`dashboard ${theme}`}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <span className="logo-text">Edge<span className="logo-accent">Decision</span></span>
          </div>
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search metrics, products, customers..." />
          </div>
        </div>
        <div className="header-right">
          <button className="icon-button" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="icon-button">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          <button className="icon-button" onClick={() => setActiveTab('settings')}>
            <SettingsIcon size={20} />
          </button>
          <div className="user-avatar">JD</div>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Search size={18} />
          Ask Edge
        </button>
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Target size={18} />
          Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'attribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('attribution')}
        >
          <TrendingUp size={18} />
          Attribution
        </button>
        <button
          className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <ShoppingCart size={18} />
          Products
        </button>
        <button
          className={`nav-tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} />
          Customers
        </button>
        <button
          className={`nav-tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Plus size={18} />
          Integrations
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={18} />
          Settings
        </button>
      </nav>

      {/* Controls */}
      <div className="dashboard-controls">
        <div className="time-range-selector">
          <Calendar size={16} />
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <button className="control-button">
          <Filter size={16} />
          Filters
        </button>
        <button className="control-button">
          <Download size={16} />
          Export
        </button>
        <button className="primary-button">
          <Plus size={16} />
          Add Widget
        </button>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <section className="metrics-grid">
              <MetricCard 
                title="Total Revenue"
                value={`$${(totalRevenue / 1000).toFixed(1)}k`}
                change={revenueChange.toFixed(1)}
                icon={DollarSign}
                subtitle={`Profit: $${(totalProfit / 1000).toFixed(1)}k (${profitMargin.toFixed(1)}%)`}
                trend={revenueChange >= 0 ? 'up' : 'down'}
              />
              <MetricCard 
                title="Total Orders"
                value={totalOrders.toLocaleString()}
                change="12.4"
                icon={ShoppingCart}
                subtitle={`Conversion Rate: 3.8%`}
                trend="up"
              />
              <MetricCard 
                title="Average Order Value"
                value={`$${avgAOV.toFixed(2)}`}
                change="8.2"
                icon={Target}
                subtitle="LTV: $285.50"
                trend="up"
              />
              <MetricCard 
                title="Active Customers"
                value="8,942"
                change="5.7"
                icon={Users}
                subtitle="New: 1,234 (13.8%)"
                trend="up"
              />
            </section>

            {/* Revenue Chart */}
            <section className="chart-section">
              <div className="section-header">
                <h2>Revenue & Profit Trends</h2>
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#6366f1' }}></span>
                    Revenue
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                    Profit
                  </span>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fill="url(#revenueGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fill="url(#profitGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Attribution Overview */}
            <section className="attribution-section">
              <div className="section-header">
                <h2>Channel Performance</h2>
                <button className="text-button">View All →</button>
              </div>
              <div className="attribution-grid">
                {attributionData.map((channel, idx) => (
                  <AttributionCard key={idx} {...channel} />
                ))}
              </div>
            </section>

            {/* Customer Journey Funnel */}
            <section className="chart-section">
              <div className="section-header">
                <h2>Customer Journey Funnel</h2>
              </div>
              <div className="funnel-container">
                {customerJourney.map((stage, idx) => (
                  <div key={idx} className="funnel-stage">
                    <div 
                      className="funnel-bar"
                      style={{
                        width: `${stage.conversion}%`,
                        background: `linear-gradient(135deg, hsl(${220 + idx * 30}, 70%, 55%), hsl(${220 + idx * 30}, 70%, 45%))`
                      }}
                    >
                      <span className="funnel-label">{stage.stage}</span>
                      <span className="funnel-value">{stage.visitors.toLocaleString()}</span>
                    </div>
                    {idx < customerJourney.length - 1 && (
                      <div className="funnel-conversion">
                        {((customerJourney[idx + 1].visitors / stage.visitors) * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'attribution' && (
          <>
            <section className="attribution-detail-section">
              <div className="section-header">
                <h2>Multi-Touch Attribution Analysis</h2>
                <div className="attribution-models">
                  <button className="model-button active">First Click</button>
                  <button className="model-button">Last Click</button>
                  <button className="model-button">Linear</button>
                  <button className="model-button">Time Decay</button>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={attributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="channel" 
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                      {attributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="attribution-table">
              <table>
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Revenue</th>
                    <th>Orders</th>
                    <th>AOV</th>
                    <th>ROAS</th>
                    <th>Spend</th>
                    <th>CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {attributionData.map((channel, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: channel.color 
                          }} />
                          {channel.channel}
                        </div>
                      </td>
                      <td>${(channel.revenue / 1000).toFixed(1)}k</td>
                      <td>{channel.orders}</td>
                      <td>${(channel.revenue / channel.orders).toFixed(2)}</td>
                      <td style={{ 
                        color: channel.roas > 3 ? '#10b981' : channel.roas > 2 ? '#f59e0b' : '#ef4444',
                        fontWeight: 600 
                      }}>
                        {channel.roas === 999 ? '∞' : `${channel.roas.toFixed(1)}x`}
                      </td>
                      <td>${(channel.revenue / (channel.roas === 999 ? 1 : channel.roas) / 1000).toFixed(1)}k</td>
                      <td>${(channel.revenue / channel.roas / channel.orders).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {activeTab === 'products' && (
          <section className="products-section">
            <div className="section-header">
              <h2>Top Performing Products</h2>
            </div>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Margin</th>
                    <th>Profit</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((product, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td>{product.sales}</td>
                      <td>${product.revenue.toLocaleString()}</td>
                      <td>{product.margin}%</td>
                      <td>${(product.revenue * product.margin / 100).toLocaleString()}</td>
                      <td>
                        <div className="trend-indicator positive">
                          <TrendingUp size={16} />
                          +{(Math.random() * 20).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'ai' && (
          <section className="ai-section">
            <AIAssistant />
          </section>
        )}

        {activeTab === 'integrations' && (
          <section className="integrations-section">
            <div className="section-header">
              <h2>Connected Integrations</h2>
              <button className="primary-button">
                <Plus size={16} />
                Add Integration
              </button>
            </div>
            <div className="integrations-grid">
              {[
                { name: 'Shopify', status: 'Connected', color: '#96bf48', lastSync: '2 min ago' },
                { name: 'Facebook Ads', status: 'Connected', color: '#1877F2', lastSync: '5 min ago' },
                { name: 'Google Ads', status: 'Connected', color: '#4285F4', lastSync: '3 min ago' },
                { name: 'Klaviyo', status: 'Connected', color: '#7C3AED', lastSync: '1 min ago' },
                { name: 'TikTok Ads', status: 'Disconnected', color: '#000000', lastSync: 'Never' },
                { name: 'Instagram', status: 'Connected', color: '#E4405F', lastSync: '4 min ago' }
              ].map((integration, idx) => (
                <div key={idx} className="integration-card">
                  <div className="integration-header">
                    <div className="integration-icon" style={{ backgroundColor: integration.color }}>
                      {integration.name[0]}
                    </div>
                    <div className="integration-info">
                      <div className="integration-name">{integration.name}</div>
                      <div className="integration-status" style={{
                        color: integration.status === 'Connected' ? '#10b981' : '#ef4444'
                      }}>
                        {integration.status}
                      </div>
                    </div>
                  </div>
                  <div className="integration-footer">
                    <span className="last-sync">Last sync: {integration.lastSync}</span>
                    <button
                      className="text-button"
                      onClick={() => handleConfigureIntegration(integration)}
                    >
                      Configure →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <Settings />
        )}
      </main>

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Configure {selectedIntegration.name}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Enter your {selectedIntegration.name} credentials to connect and sync data.
              </p>

              {selectedIntegration.name === 'Shopify' && (
                <>
                  <div className="form-group">
                    <label>Shop Domain</label>
                    <input
                      type="text"
                      placeholder="your-store.myshopify.com"
                      value={configForm.shopDomain || ''}
                      onChange={(e) => handleConfigFormChange('shopDomain', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Access Token</label>
                    <input
                      type="password"
                      placeholder="Enter your Shopify access token"
                      value={configForm.accessToken || ''}
                      onChange={(e) => handleConfigFormChange('accessToken', e.target.value)}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.name === 'Facebook Ads' && (
                <>
                  <div className="form-group">
                    <label>Access Token</label>
                    <input
                      type="password"
                      placeholder="Enter your Facebook access token"
                      value={configForm.accessToken || ''}
                      onChange={(e) => handleConfigFormChange('accessToken', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ad Account ID</label>
                    <input
                      type="text"
                      placeholder="act_123456789"
                      value={configForm.adAccountId || ''}
                      onChange={(e) => handleConfigFormChange('adAccountId', e.target.value)}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.name === 'Google Ads' && (
                <>
                  <div className="form-group">
                    <label>Refresh Token</label>
                    <input
                      type="password"
                      placeholder="Enter your Google Ads refresh token"
                      value={configForm.refreshToken || ''}
                      onChange={(e) => handleConfigFormChange('refreshToken', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer ID</label>
                    <input
                      type="text"
                      placeholder="123-456-7890"
                      value={configForm.customerId || ''}
                      onChange={(e) => handleConfigFormChange('customerId', e.target.value)}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.name === 'Klaviyo' && (
                <div className="form-group">
                  <label>API Key</label>
                  <input
                    type="password"
                    placeholder="Enter your Klaviyo API key"
                    value={configForm.apiKey || ''}
                    onChange={(e) => handleConfigFormChange('apiKey', e.target.value)}
                  />
                </div>
              )}

              {selectedIntegration.name === 'TikTok Ads' && (
                <>
                  <div className="form-group">
                    <label>Access Token</label>
                    <input
                      type="password"
                      placeholder="Enter your TikTok access token"
                      value={configForm.accessToken || ''}
                      onChange={(e) => handleConfigFormChange('accessToken', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Advertiser ID</label>
                    <input
                      type="text"
                      placeholder="Enter your advertiser ID"
                      value={configForm.advertiserId || ''}
                      onChange={(e) => handleConfigFormChange('advertiserId', e.target.value)}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.name === 'Instagram' && (
                <div className="form-group">
                  <label>Access Token</label>
                  <input
                    type="password"
                    placeholder="Enter your Instagram access token"
                    value={configForm.accessToken || ''}
                    onChange={(e) => handleConfigFormChange('accessToken', e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSaveIntegration}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          background: linear-gradient(to bottom right, oklch(22% .04 265), oklch(18% .08 55));
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, oklch(38% .13 265) 0%, oklch(72% .13 55) 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .logo-accent {
          background: linear-gradient(to right, oklch(65% .18 45), oklch(80% .12 65));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 16px;
          width: 400px;
        }

        .search-bar input {
          background: none;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
          width: 100%;
        }

        .search-bar input::placeholder {
          color: #666;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-button {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          color: #fff;
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 5px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        .logout-button {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Navigation */
        .dashboard-nav {
          display: flex;
          gap: 8px;
          padding: 16px 32px;
          background: rgba(10, 10, 10, 0.5);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          overflow-x: auto;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: none;
          border: none;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .nav-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }

        .nav-tab.active {
          background: oklch(38% .13 265 / 0.15);
          color: #fff;
          border: 1px solid oklch(38% .13 265 / 0.3);
        }

        /* Controls */
        .dashboard-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 32px;
          background: rgba(26, 26, 26, 0.4);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .time-range-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 12px;
        }

        .time-range-selector select {
          background: none;
          border: none;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          outline: none;
        }

        .control-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, oklch(38% .13 265) 0%, oklch(48% .18 265) 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: auto;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px oklch(38% .13 265 / 0.4);
        }

        /* Main Content */
        .dashboard-content {
          padding: 32px;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
        }

        .metric-title {
          font-size: 13px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -1px;
          margin-bottom: 8px;
        }

        .metric-subtitle {
          font-size: 13px;
          color: #666;
        }

        /* Chart Section */
        .chart-section {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          gap: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #888;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .text-button {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .text-button:hover {
          color: #8b5cf6;
        }

        .chart-container {
          margin-top: 20px;
        }

        /* Attribution Section */
        .attribution-section {
          margin-bottom: 32px;
        }

        .attribution-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .attribution-card {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s;
        }

        .attribution-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .attribution-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .channel-indicator {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .channel-name {
          font-weight: 600;
          font-size: 15px;
        }

        .attribution-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .attribution-metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 12px;
          color: #666;
        }

        .attribution-metric .metric-value {
          font-size: 18px;
          font-weight: 600;
        }

        /* Funnel */
        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px 0;
        }

        .funnel-stage {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .funnel-bar {
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          transition: all 0.3s;
          cursor: pointer;
        }

        .funnel-bar:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }

        .funnel-label {
          font-weight: 600;
          font-size: 15px;
        }

        .funnel-value {
          font-weight: 700;
          font-size: 18px;
        }

        .funnel-conversion {
          text-align: center;
          color: #888;
          font-size: 13px;
          font-weight: 600;
        }

        /* Attribution Detail */
        .attribution-detail-section {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .attribution-models {
          display: flex;
          gap: 8px;
        }

        .model-button {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #888;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .model-button:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .model-button.active {
          color: #fff;
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
        }

        /* Tables */
        .attribution-table {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
          text-align: left;
          padding: 12px;
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        td {
          padding: 16px 12px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        /* Products Section */
        .products-section {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
        }

        .products-table {
          margin-top: 20px;
          overflow-x: auto;
        }

        .trend-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .trend-indicator.positive {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .trend-indicator.negative {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* Integrations */
        .integrations-section {
          margin-bottom: 32px;
        }

        .integrations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .integration-card {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s;
        }

        .integration-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .integration-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .integration-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
        }

        .integration-info {
          flex: 1;
        }

        .integration-name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .integration-status {
          font-size: 12px;
          font-weight: 600;
        }

        .integration-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .last-sync {
          font-size: 12px;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .header-left {
            flex-direction: column;
            gap: 16px;
          }

          .search-bar {
            width: 100%;
          }

          .dashboard-content {
            padding: 20px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .attribution-grid {
            grid-template-columns: 1fr;
          }

          .attribution-metrics {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 32px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-body {
          padding: 24px;
        }

        .modal-description {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 24px;
          font-size: 14px;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(0, 0, 0, 0.4);
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          justify-content: flex-end;
        }

        .secondary-button {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Light Theme Overrides - Based on AskEdge.ai Design */
        .dashboard.light {
          background: #f8f8f7;
          color: #34322d;
        }

        .dashboard.light .dashboard-header {
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .logo-text {
          color: #34322d;
        }

        .dashboard.light .search-bar {
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .search-bar input {
          color: #34322d;
        }

        .dashboard.light .search-bar input::placeholder {
          color: #858481;
        }

        .dashboard.light .icon-button {
          color: #5e5e5b;
        }

        .dashboard.light .icon-button:hover {
          background: rgba(55, 53, 47, 0.06);
          color: #34322d;
        }

        .dashboard.light .notification-badge {
          background: oklch(38% .13 265);
        }

        .dashboard.light .logout-button {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
          color: #34322d;
        }

        .dashboard.light .logout-button:hover {
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.12);
        }

        .dashboard.light .dashboard-nav {
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .nav-tab {
          color: #5e5e5b;
        }

        .dashboard.light .nav-tab:hover {
          background: rgba(55, 53, 47, 0.06);
          color: #34322d;
        }

        .dashboard.light .nav-tab.active {
          background: rgba(55, 53, 47, 0.08);
          color: oklch(38% .13 265);
          border-color: oklch(38% .13 265 / 0.2);
        }

        .dashboard.light .dashboard-controls {
          background: #fafafa;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .dashboard.light .time-range-selector,
        .dashboard.light .filter-button {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
          color: #34322d;
        }

        .dashboard.light .time-range-selector select {
          color: #34322d;
        }

        .dashboard.light .metric-card {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .metric-label {
          color: #5e5e5b;
        }

        .dashboard.light .metric-value {
          color: #34322d;
        }

        .dashboard.light .chart-card {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .chart-header h3 {
          color: #34322d;
        }

        .dashboard.light .attribution-card {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .attribution-card:hover {
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.12);
        }

        .dashboard.light .channel-name {
          color: #34322d;
        }

        .dashboard.light .attribution-metric-label {
          color: #5e5e5b;
        }

        .dashboard.light .attribution-metric-value {
          color: #34322d;
        }

        .dashboard.light .integration-card {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .integration-card:hover {
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.12);
        }

        .dashboard.light .integration-name {
          color: #34322d;
        }

        .dashboard.light .last-sync {
          color: #858481;
        }

        .dashboard.light .configure-button {
          color: oklch(38% .13 265);
        }

        .dashboard.light .configure-button:hover {
          background: rgba(55, 53, 47, 0.06);
        }

        .dashboard.light .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
        }

        .dashboard.light .modal-content {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .dashboard.light .modal-header h2 {
          color: #34322d;
        }

        .dashboard.light .modal-close {
          color: #5e5e5b;
        }

        .dashboard.light .modal-close:hover {
          background: rgba(55, 53, 47, 0.06);
          color: #34322d;
        }

        .dashboard.light .form-group label {
          color: #34322d;
        }

        .dashboard.light .form-group input,
        .dashboard.light .form-group select,
        .dashboard.light .form-group textarea {
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.06);
          color: #34322d;
        }

        .dashboard.light .form-group input:focus,
        .dashboard.light .form-group select:focus,
        .dashboard.light .form-group textarea:focus {
          border-color: oklch(38% .13 265);
          background: #ffffff;
        }

        .dashboard.light table {
          color: #34322d;
        }

        .dashboard.light th {
          color: #5e5e5b;
          border-bottom-color: rgba(0, 0, 0, 0.06);
        }

        .dashboard.light td {
          border-bottom-color: rgba(0, 0, 0, 0.04);
        }

        .dashboard.light tbody tr:hover {
          background: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default EcommerceAnalyticsDashboard;