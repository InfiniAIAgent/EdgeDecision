const axios = require('axios');
const db = require('../config/database');
const { broadcastMetricUpdate } = require('./websocket');

class ShopifyService {
  constructor(shopDomain, accessToken) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
    this.baseUrl = `https://${shopDomain}/admin/api/2024-01`;
  }

  // Validate connection
  async validateConnection() {
    try {
      const response = await this.makeRequest('/shop.json');
      return response.shop ? true : false;
    } catch (error) {
      console.error('Shopify validation error:', error);
      return false;
    }
  }

  // Sync initial data
  async syncInitialData(organizationId) {
    console.log(`Starting Shopify sync for org: ${organizationId}`);
    
    try {
      // Sync in parallel
      await Promise.all([
        this.syncOrders(organizationId),
        this.syncProducts(organizationId),
        this.syncCustomers(organizationId)
      ]);

      console.log('Shopify sync completed');
    } catch (error) {
      console.error('Shopify sync error:', error);
      throw error;
    }
  }

  // Sync orders
  async syncOrders(organizationId, since = null) {
    try {
      const params = {
        limit: 250,
        status: 'any',
        financial_status: 'paid'
      };

      if (since) {
        params.created_at_min = since;
      } else {
        // Get last 90 days by default
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        params.created_at_min = ninetyDaysAgo.toISOString();
      }

      const response = await this.makeRequest('/orders.json', params);
      const orders = response.orders || [];

      console.log(`Fetched ${orders.length} orders from Shopify`);

      // Process orders
      for (const order of orders) {
        await this.processOrder(organizationId, order);
      }

      // Update metrics cache
      await this.updateMetricsCache(organizationId, orders);

      // Broadcast update
      broadcastMetricUpdate(organizationId, 'orders', {
        count: orders.length,
        lastSync: new Date().toISOString()
      });

      return orders.length;
    } catch (error) {
      console.error('Sync orders error:', error);
      throw error;
    }
  }

  // Process individual order
  async processOrder(organizationId, order) {
    const orderDate = new Date(order.created_at);
    const dateStr = orderDate.toISOString().split('T')[0];

    // Get or create daily cache entry
    const existing = await db('analytics_cache')
      .where({
        organization_id: organizationId,
        metric_type: 'revenue',
        date: dateStr,
        source: 'shopify'
      })
      .first();

    const orderRevenue = parseFloat(order.total_price);
    const orderCount = 1;

    if (existing) {
      // Update existing
      const currentData = existing.data || { revenue: 0, orders: 0 };
      await db('analytics_cache')
        .where({ id: existing.id })
        .update({
          data: {
            revenue: (parseFloat(currentData.revenue) || 0) + orderRevenue,
            orders: (parseInt(currentData.orders) || 0) + orderCount
          }
        });
    } else {
      // Create new
      await db('analytics_cache').insert({
        organization_id: organizationId,
        metric_type: 'revenue',
        date: dateStr,
        source: 'shopify',
        data: {
          revenue: orderRevenue,
          orders: orderCount
        }
      });
    }

    // Process attribution if order has UTM parameters
    if (order.referring_site || order.source_name) {
      await this.processOrderAttribution(organizationId, order);
    }
  }

  // Process order attribution
  async processOrderAttribution(organizationId, order) {
    let channel = 'organic';
    
    // Determine channel from order data
    if (order.source_name) {
      const source = order.source_name.toLowerCase();
      if (source.includes('facebook') || source.includes('fb')) channel = 'facebook';
      else if (source.includes('google')) channel = 'google';
      else if (source.includes('instagram')) channel = 'instagram';
      else if (source.includes('tiktok')) channel = 'tiktok';
    }

    await db('attribution_data').insert({
      organization_id: organizationId,
      order_id: order.id.toString(),
      channel,
      revenue: parseFloat(order.total_price),
      cost: 0, // Will be updated from ad platform data
      order_date: new Date(order.created_at),
      metadata: {
        source_name: order.source_name,
        referring_site: order.referring_site,
        landing_site: order.landing_site
      }
    }).onConflict(['organization_id', 'order_id']).ignore();
  }

  // Sync products
  async syncProducts(organizationId) {
    try {
      const response = await this.makeRequest('/products.json', { limit: 250 });
      const products = response.products || [];

      console.log(`Fetched ${products.length} products from Shopify`);

      // Store products in cache for AI assistant context
      await db('analytics_cache').insert({
        organization_id: organizationId,
        metric_type: 'products',
        date: new Date().toISOString().split('T')[0],
        source: 'shopify',
        data: { products: products.map(p => ({
          id: p.id,
          title: p.title,
          price: p.variants?.[0]?.price
        }))}
      }).onConflict(['organization_id', 'metric_type', 'date', 'source']).merge();

      return products.length;
    } catch (error) {
      console.error('Sync products error:', error);
      throw error;
    }
  }

  // Sync customers
  async syncCustomers(organizationId) {
    try {
      const response = await this.makeRequest('/customers.json', { limit: 250 });
      const customers = response.customers || [];

      console.log(`Fetched ${customers.length} customers from Shopify`);

      // Store customer count and stats
      await db('analytics_cache').insert({
        organization_id: organizationId,
        metric_type: 'customers',
        date: new Date().toISOString().split('T')[0],
        source: 'shopify',
        data: {
          total: customers.length,
          new: customers.filter(c => {
            const created = new Date(c.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return created > thirtyDaysAgo;
          }).length
        }
      }).onConflict(['organization_id', 'metric_type', 'date', 'source']).merge();

      return customers.length;
    } catch (error) {
      console.error('Sync customers error:', error);
      throw error;
    }
  }

  // Update metrics cache
  async updateMetricsCache(organizationId, orders) {
    // Calculate summary metrics
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    const totalOrders = orders.length;

    broadcastMetricUpdate(organizationId, 'revenue', {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    });
  }

  // Make API request
  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error('Shopify API error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = { ShopifyService };
