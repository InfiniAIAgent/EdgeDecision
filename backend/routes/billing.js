const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const db = require('../config/database');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pricing plans
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['Basic analytics', 'Up to 1,000 orders/month', '1 integration', '7-day data retention']
  },
  starter: {
    name: 'Starter',
    price: 49,
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    features: ['Advanced analytics', 'Up to 10,000 orders/month', '5 integrations', '90-day data retention', 'AI Assistant (100 queries/month)']
  },
  growth: {
    name: 'Growth',
    price: 199,
    priceId: 'price_growth_monthly',
    features: ['Full analytics suite', 'Unlimited orders', 'Unlimited integrations', 'Unlimited data retention', 'AI Assistant (unlimited)', 'Custom dashboards', 'API access']
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    priceId: 'price_enterprise_monthly',
    features: ['Everything in Growth', 'Dedicated support', 'Custom integrations', 'SSO', 'SLA guarantee']
  }
};

// Get available plans
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

// Get current subscription
router.get('/subscription', async (req, res) => {
  try {
    const { organizationId } = req.user;

    const organization = await db('organizations')
      .where({ id: organizationId })
      .select('plan', 'stripe_customer_id', 'stripe_subscription_id', 'trial_ends_at')
      .first();

    let subscription = null;
    if (organization.stripe_subscription_id) {
      subscription = await stripe.subscriptions.retrieve(organization.stripe_subscription_id);
    }

    res.json({
      currentPlan: organization.plan,
      subscription,
      trialEndsAt: organization.trial_ends_at,
      isTrialing: organization.trial_ends_at && new Date(organization.trial_ends_at) > new Date()
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const { plan } = req.body;

    if (!PLANS[plan] || plan === 'free') {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const organization = await db('organizations')
      .where({ id: organizationId })
      .first();

    // Create or retrieve Stripe customer
    let customerId = organization.stripe_customer_id;
    if (!customerId) {
      const user = await db('users').where({ id: userId }).first();
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          organizationId,
          userId
        }
      });
      customerId = customer.id;

      await db('organizations')
        .where({ id: organizationId })
        .update({ stripe_customer_id: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: PLANS[plan].priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.CORS_ORIGIN}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/billing/cancel`,
      metadata: {
        organizationId,
        plan
      }
    });

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create portal session (for managing subscription)
router.post('/portal', async (req, res) => {
  try {
    const { organizationId } = req.user;

    const organization = await db('organizations')
      .where({ id: organizationId })
      .first();

    if (!organization.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripe_customer_id,
      return_url: `${process.env.CORS_ORIGIN}/settings/billing`
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get billing history
router.get('/history', async (req, res) => {
  try {
    const { organizationId } = req.user;

    const history = await db('billing_history')
      .where({ organization_id: organizationId })
      .orderBy('created_at', 'desc')
      .limit(12);

    res.json({ history });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const { organizationId } = req.user;

    const organization = await db('organizations')
      .where({ id: organizationId })
      .first();

    if (!organization.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Cancel at period end (don't immediately revoke access)
    await stripe.subscriptions.update(organization.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    res.json({ message: 'Subscription will be cancelled at period end' });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Usage tracking (for metered billing)
router.get('/usage', async (req, res) => {
  try {
    const { organizationId } = req.user;

    // Get current period usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = {
      orders: await db('analytics_cache')
        .where('organization_id', organizationId)
        .where('date', '>=', startOfMonth)
        .sum('data->orders as total')
        .first(),
      aiQueries: await db('ai_chat_history')
        .where('organization_id', organizationId)
        .where('created_at', '>=', startOfMonth)
        .count('* as count')
        .first(),
      integrations: await db('integrations')
        .where('organization_id', organizationId)
        .where('status', 'connected')
        .count('* as count')
        .first()
    };

    res.json({ 
      usage: {
        orders: parseInt(usage.orders?.total) || 0,
        aiQueries: parseInt(usage.aiQueries?.count) || 0,
        integrations: parseInt(usage.integrations?.count) || 0
      }
    });

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

module.exports = router;
