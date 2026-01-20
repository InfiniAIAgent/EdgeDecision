const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { ShopifyService } = require('../services/shopify');
const { FacebookAdsService } = require('../services/facebookAds');
const { GoogleAdsService } = require('../services/googleAds');
const { TikTokAdsService } = require('../services/tiktokAds');
const { KlaviyoService } = require('../services/klaviyo');

// Get all integrations for organization
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.user;

    const integrations = await db('integrations')
      .where({ organization_id: organizationId })
      .select('id', 'platform', 'status', 'last_synced_at', 'config');

    res.json({ integrations });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Connect Shopify
router.post('/shopify/connect', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { shopDomain, accessToken } = req.body;

    // Validate Shopify credentials
    const shopify = new ShopifyService(shopDomain, accessToken);
    const isValid = await shopify.validateConnection();

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Shopify credentials' });
    }

    // Store integration
    const [integration] = await db('integrations')
      .insert({
        organization_id: organizationId,
        platform: 'shopify',
        status: 'connected',
        credentials: {
          shop_domain: shopDomain,
          access_token: accessToken // In production, encrypt this
        },
        config: { shop_domain: shopDomain },
        last_synced_at: new Date()
      })
      .onConflict(['organization_id', 'platform'])
      .merge()
      .returning('*');

    // Trigger initial data sync
    await shopify.syncInitialData(organizationId);

    res.json({ 
      integration: {
        id: integration.id,
        platform: integration.platform,
        status: integration.status
      }
    });
  } catch (error) {
    console.error('Shopify connection error:', error);
    res.status(500).json({ error: 'Failed to connect Shopify' });
  }
});

// Connect Facebook Ads
router.post('/facebook/connect', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { accessToken, adAccountId } = req.body;

    const facebook = new FacebookAdsService(accessToken);
    const isValid = await facebook.validateConnection(adAccountId);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Facebook credentials' });
    }

    const [integration] = await db('integrations')
      .insert({
        organization_id: organizationId,
        platform: 'facebook',
        status: 'connected',
        credentials: {
          access_token: accessToken,
          ad_account_id: adAccountId
        },
        config: { ad_account_id: adAccountId },
        last_synced_at: new Date()
      })
      .onConflict(['organization_id', 'platform'])
      .merge()
      .returning('*');

    // Trigger initial data sync
    await facebook.syncAdData(organizationId, adAccountId);

    res.json({ 
      integration: {
        id: integration.id,
        platform: integration.platform,
        status: integration.status
      }
    });
  } catch (error) {
    console.error('Facebook connection error:', error);
    res.status(500).json({ error: 'Failed to connect Facebook Ads' });
  }
});

// Connect Google Ads
router.post('/google/connect', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { refreshToken, customerId } = req.body;

    const google = new GoogleAdsService(refreshToken);
    const isValid = await google.validateConnection(customerId);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Google Ads credentials' });
    }

    const [integration] = await db('integrations')
      .insert({
        organization_id: organizationId,
        platform: 'google',
        status: 'connected',
        credentials: {
          refresh_token: refreshToken,
          customer_id: customerId
        },
        config: { customer_id: customerId },
        last_synced_at: new Date()
      })
      .onConflict(['organization_id', 'platform'])
      .merge()
      .returning('*');

    await google.syncAdData(organizationId, customerId);

    res.json({ 
      integration: {
        id: integration.id,
        platform: integration.platform,
        status: integration.status
      }
    });
  } catch (error) {
    console.error('Google Ads connection error:', error);
    res.status(500).json({ error: 'Failed to connect Google Ads' });
  }
});

// Connect TikTok Ads
router.post('/tiktok/connect', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { accessToken, advertiserId } = req.body;

    const tiktok = new TikTokAdsService(accessToken);
    const isValid = await tiktok.validateConnection(advertiserId);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid TikTok credentials' });
    }

    const [integration] = await db('integrations')
      .insert({
        organization_id: organizationId,
        platform: 'tiktok',
        status: 'connected',
        credentials: {
          access_token: accessToken,
          advertiser_id: advertiserId
        },
        config: { advertiser_id: advertiserId },
        last_synced_at: new Date()
      })
      .onConflict(['organization_id', 'platform'])
      .merge()
      .returning('*');

    await tiktok.syncAdData(organizationId, advertiserId);

    res.json({ 
      integration: {
        id: integration.id,
        platform: integration.platform,
        status: integration.status
      }
    });
  } catch (error) {
    console.error('TikTok connection error:', error);
    res.status(500).json({ error: 'Failed to connect TikTok Ads' });
  }
});

// Connect Klaviyo
router.post('/klaviyo/connect', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { apiKey } = req.body;

    const klaviyo = new KlaviyoService(apiKey);
    const isValid = await klaviyo.validateConnection();

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Klaviyo credentials' });
    }

    const [integration] = await db('integrations')
      .insert({
        organization_id: organizationId,
        platform: 'klaviyo',
        status: 'connected',
        credentials: { api_key: apiKey },
        config: {},
        last_synced_at: new Date()
      })
      .onConflict(['organization_id', 'platform'])
      .merge()
      .returning('*');

    await klaviyo.syncMetrics(organizationId);

    res.json({ 
      integration: {
        id: integration.id,
        platform: integration.platform,
        status: integration.status
      }
    });
  } catch (error) {
    console.error('Klaviyo connection error:', error);
    res.status(500).json({ error: 'Failed to connect Klaviyo' });
  }
});

// Disconnect integration
router.delete('/:platform', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { platform } = req.params;

    await db('integrations')
      .where({ 
        organization_id: organizationId,
        platform 
      })
      .update({ status: 'disconnected' });

    res.json({ message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

// Trigger manual sync
router.post('/:platform/sync', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { platform } = req.params;

    const integration = await db('integrations')
      .where({ 
        organization_id: organizationId,
        platform 
      })
      .first();

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Trigger sync based on platform
    let service;
    switch (platform) {
      case 'shopify':
        service = new ShopifyService(
          integration.credentials.shop_domain,
          integration.credentials.access_token
        );
        await service.syncInitialData(organizationId);
        break;
      case 'facebook':
        service = new FacebookAdsService(integration.credentials.access_token);
        await service.syncAdData(organizationId, integration.credentials.ad_account_id);
        break;
      // Add other platforms...
    }

    await db('integrations')
      .where({ id: integration.id })
      .update({ last_synced_at: new Date() });

    res.json({ message: 'Sync initiated successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

module.exports = router;
