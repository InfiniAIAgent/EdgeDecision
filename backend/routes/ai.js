const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../config/database');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Chat with AI Assistant
router.post('/chat', async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get recent analytics data for context
    const analyticsContext = await getAnalyticsContext(organizationId);
    
    // Get conversation history
    const conversationHistory = conversationId 
      ? await db('ai_chat_history')
          .where({ 
            organization_id: organizationId,
            conversation_id: conversationId 
          })
          .orderBy('created_at', 'asc')
          .limit(10)
      : [];

    // Build messages for Claude
    const messages = [
      ...conversationHistory.map(h => ([
        { role: 'user', content: h.message },
        { role: 'assistant', content: h.response }
      ])).flat(),
      { role: 'user', content: message }
    ];

    // Create system prompt with analytics context
    const systemPrompt = `You are EdgeDecision AI Assistant, an intelligent analytics assistant helping ecommerce businesses understand their data.

Current Analytics Overview:
${JSON.stringify(analyticsContext, null, 2)}

Your capabilities:
1. Answer questions about revenue, orders, customers, and other metrics
2. Identify trends and patterns in the data
3. Provide actionable insights and recommendations
4. Compare performance across channels (Facebook, Google, TikTok, etc.)
5. Calculate and explain key metrics like ROAS, CAC, LTV, AOV
6. Help with attribution analysis
7. Forecast future performance

When answering:
- Be concise and data-driven
- Cite specific numbers from the analytics data
- Provide actionable recommendations
- Use natural, conversational language
- If you don't have enough data, ask clarifying questions`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    const assistantResponse = response.content[0].text;

    // Generate or use existing conversation ID
    const newConversationId = conversationId || generateConversationId();

    // Save to chat history
    await db('ai_chat_history').insert({
      organization_id: organizationId,
      user_id: userId,
      message,
      response: assistantResponse,
      conversation_id: newConversationId,
      context: analyticsContext
    });

    res.json({
      response: assistantResponse,
      conversationId: newConversationId,
      context: analyticsContext
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Generate insights automatically
router.post('/insights', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { timeRange = '30d' } = req.body;

    // Get analytics data
    const analyticsContext = await getAnalyticsContext(organizationId, timeRange);

    // Ask Claude to generate insights
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are an expert ecommerce data analyst. Analyze the provided data and generate 3-5 key insights with actionable recommendations.`,
      messages: [{
        role: 'user',
        content: `Analyze this ecommerce data and provide key insights:

${JSON.stringify(analyticsContext, null, 2)}

Format your response as a JSON array of insights, each with:
- title: Brief insight title
- description: 2-3 sentence explanation
- type: "positive", "negative", or "neutral"
- action: Recommended action to take
- priority: "high", "medium", or "low"

Only respond with valid JSON.`
      }]
    });

    const insightsText = response.content[0].text;
    const insights = JSON.parse(insightsText.replace(/```json\n?|\n?```/g, ''));

    res.json({ insights });

  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Get conversation history
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { conversationId } = req.params;

    const history = await db('ai_chat_history')
      .where({ 
        organization_id: organizationId,
        conversation_id: conversationId 
      })
      .orderBy('created_at', 'asc')
      .select('message', 'response', 'created_at');

    res.json({ history });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// List all conversations
router.get('/conversations', async (req, res) => {
  try {
    const { organizationId } = req.user;

    const conversations = await db('ai_chat_history')
      .where({ organization_id: organizationId })
      .select('conversation_id')
      .groupBy('conversation_id')
      .select(
        'conversation_id',
        db.raw('MIN(created_at) as started_at'),
        db.raw('MAX(created_at) as last_message_at'),
        db.raw('COUNT(*) as message_count')
      )
      .orderBy('last_message_at', 'desc')
      .limit(20);

    res.json({ conversations });

  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Helper function to get analytics context
async function getAnalyticsContext(organizationId, timeRange = '30d') {
  const daysBack = parseInt(timeRange) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Get revenue and orders
  const revenue = await db('analytics_cache')
    .where('organization_id', organizationId)
    .where('metric_type', 'revenue')
    .where('date', '>=', startDate)
    .sum('data->revenue as total_revenue')
    .sum('data->orders as total_orders')
    .first();

  // Get channel attribution
  const channelData = await db('attribution_data')
    .where('organization_id', organizationId)
    .where('order_date', '>=', startDate)
    .groupBy('channel')
    .select(
      'channel',
      db.raw('SUM(revenue) as revenue'),
      db.raw('SUM(cost) as cost'),
      db.raw('COUNT(*) as orders')
    );

  // Calculate metrics
  const totalRevenue = parseFloat(revenue?.total_revenue) || 0;
  const totalOrders = parseInt(revenue?.total_orders) || 0;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const channels = channelData.map(c => ({
    channel: c.channel,
    revenue: parseFloat(c.revenue),
    cost: parseFloat(c.cost),
    orders: parseInt(c.orders),
    roas: parseFloat(c.cost) > 0 ? parseFloat(c.revenue) / parseFloat(c.cost) : 0
  }));

  return {
    timeRange: `${daysBack} days`,
    totalRevenue: totalRevenue.toFixed(2),
    totalOrders,
    averageOrderValue: aov.toFixed(2),
    channels
  };
}

// Helper to generate conversation ID
function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = router;
