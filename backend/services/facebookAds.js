const axios = require('axios');
const db = require('../config/database');
const { broadcastMetricUpdate } = require('./websocket');

class FacebookAdsService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  // Validate connection
  async validateConnection(adAccountId) {
    try {
      const response = await this.makeRequest(`/act_${adAccountId}`, {
        fields: 'id,name'
      });
      return response.id ? true : false;
    } catch (error) {
      console.error('Facebook validation error:', error);
      return false;
    }
  }

  // Sync ad data
  async syncAdData(organizationId, adAccountId) {
    console.log(`Starting Facebook Ads sync for org: ${organizationId}`);

    try {
      // Get date range (last 90 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get insights
      const insights = await this.makeRequest(`/act_${adAccountId}/insights`, {
        fields: 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,conversions,actions',
        time_range: JSON.stringify({ since: startDateStr, until: endDate }),
        level: 'ad',
        limit: 1000
      });

      console.log(`Fetched ${insights.data?.length || 0} ad insights from Facebook`);

      // Process each insight
      for (const insight of insights.data || []) {
        await this.processInsight(organizationId, insight);
      }

      // Broadcast update
      broadcastMetricUpdate(organizationId, 'facebook_ads', {
        adsCount: insights.data?.length || 0,
        lastSync: new Date().toISOString()
      });

      return insights.data?.length || 0;
    } catch (error) {
      console.error('Facebook sync error:', error);
      throw error;
    }
  }

  // Process individual insight
  async processInsight(organizationId, insight) {
    const spend = parseFloat(insight.spend || 0);
    const conversions = this.extractConversions(insight.actions);
    const revenue = this.extractRevenue(insight.actions);

    // Store attribution data
    await db('attribution_data').insert({
      organization_id: organizationId,
      order_id: `fb_${insight.ad_id}_${Date.now()}`,
      channel: 'facebook',
      campaign_id: insight.campaign_id,
      ad_set_id: insight.adset_id,
      ad_id: insight.ad_id,
      revenue,
      cost: spend,
      order_date: new Date(),
      metadata: {
        campaign_name: insight.campaign_name,
        adset_name: insight.adset_name,
        ad_name: insight.ad_name,
        impressions: insight.impressions,
        clicks: insight.clicks,
        conversions
      }
    }).onConflict(['organization_id', 'order_id']).merge();

    // Update daily cache
    const dateStr = new Date().toISOString().split('T')[0];
    await this.updateDailyCache(organizationId, dateStr, {
      spend,
      revenue,
      conversions
    });
  }

  // Extract conversions from actions
  extractConversions(actions) {
    if (!actions) return 0;
    const purchaseAction = actions.find(a => 
      a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
    );
    return purchaseAction ? parseFloat(purchaseAction.value) : 0;
  }

  // Extract revenue from actions
  extractRevenue(actions) {
    if (!actions) return 0;
    const purchaseAction = actions.find(a => 
      a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
    );
    return purchaseAction && purchaseAction.value ? parseFloat(purchaseAction.value) : 0;
  }

  // Update daily cache
  async updateDailyCache(organizationId, dateStr, data) {
    const existing = await db('analytics_cache')
      .where({
        organization_id: organizationId,
        metric_type: 'ad_spend',
        date: dateStr,
        source: 'facebook'
      })
      .first();

    if (existing) {
      const currentData = existing.data || { spend: 0, revenue: 0, conversions: 0 };
      await db('analytics_cache')
        .where({ id: existing.id })
        .update({
          data: {
            spend: (parseFloat(currentData.spend) || 0) + data.spend,
            revenue: (parseFloat(currentData.revenue) || 0) + data.revenue,
            conversions: (parseInt(currentData.conversions) || 0) + data.conversions
          }
        });
    } else {
      await db('analytics_cache').insert({
        organization_id: organizationId,
        metric_type: 'ad_spend',
        date: dateStr,
        source: 'facebook',
        data
      });
    }
  }

  // Make API request
  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}${endpoint}`,
        params: {
          access_token: this.accessToken,
          ...params
        }
      });

      return response.data;
    } catch (error) {
      console.error('Facebook API error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = { FacebookAdsService };
