const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get analytics data
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { timeRange = '30d', metricType = 'revenue' } = req.query;

    const daysBack = parseInt(timeRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const data = await db('analytics_cache')
      .where('organization_id', organizationId)
      .where('metric_type', metricType)
      .where('date', '>=', startDate)
      .orderBy('date', 'asc');

    res.json({ data });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get attribution data
router.get('/attribution', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { timeRange = '30d' } = req.query;

    const daysBack = parseInt(timeRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const data = await db('attribution_data')
      .where('organization_id', organizationId)
      .where('order_date', '>=', startDate)
      .groupBy('channel')
      .select(
        'channel',
        db.raw('SUM(revenue) as revenue'),
        db.raw('SUM(cost) as cost'),
        db.raw('COUNT(*) as orders')
      );

    res.json({ data });
  } catch (error) {
    console.error('Get attribution error:', error);
    res.status(500).json({ error: 'Failed to fetch attribution data' });
  }
});

module.exports = router;
