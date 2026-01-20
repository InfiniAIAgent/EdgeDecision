const jwt = require('jsonwebtoken');
const db = require('../config/database');

let io;

// Initialize WebSocket server
function initializeWebSocket(socketIO) {
  io = socketIO;

  io.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.organizationId = decoded.organizationId;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (Org: ${socket.organizationId})`);

    // Join organization room
    socket.join(`org_${socket.organizationId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Subscribe to specific metrics
    socket.on('subscribe:metrics', (metrics) => {
      console.log(`Client ${socket.id} subscribed to:`, metrics);
      metrics.forEach(metric => {
        socket.join(`org_${socket.organizationId}_${metric}`);
      });
    });

    // Unsubscribe from metrics
    socket.on('unsubscribe:metrics', (metrics) => {
      metrics.forEach(metric => {
        socket.leave(`org_${socket.organizationId}_${metric}`);
      });
    });

    // Request current data
    socket.on('request:analytics', async (params) => {
      try {
        const data = await getCurrentAnalytics(socket.organizationId, params);
        socket.emit('analytics:update', data);
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch analytics' });
      }
    });
  });

  // Start periodic data broadcast
  startPeriodicBroadcast();

  return io;
}

// Broadcast data updates to organization
function broadcastToOrganization(organizationId, event, data) {
  if (io) {
    io.to(`org_${organizationId}`).emit(event, data);
  }
}

// Broadcast metric update
function broadcastMetricUpdate(organizationId, metricType, data) {
  if (io) {
    io.to(`org_${organizationId}_${metricType}`).emit('metric:update', {
      metricType,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

// Send notification to user
function sendNotification(userId, notification) {
  if (io) {
    io.to(userId).emit('notification', notification);
  }
}

// Periodic broadcast of analytics updates
function startPeriodicBroadcast() {
  // Every 30 seconds, check for new data and broadcast
  setInterval(async () => {
    try {
      // Get all active organizations (those with connected clients)
      const rooms = Array.from(io.sockets.adapter.rooms.keys())
        .filter(room => room.startsWith('org_'))
        .map(room => room.replace('org_', '').split('_')[0]);

      const uniqueOrgs = [...new Set(rooms)];

      for (const orgId of uniqueOrgs) {
        // Get latest analytics
        const analytics = await getCurrentAnalytics(orgId);
        
        // Broadcast to organization
        broadcastToOrganization(orgId, 'analytics:update', analytics);
      }
    } catch (error) {
      console.error('Periodic broadcast error:', error);
    }
  }, 30000); // 30 seconds
}

// Get current analytics data
async function getCurrentAnalytics(organizationId, params = {}) {
  const { timeRange = '24h' } = params;
  
  // Calculate date range
  const now = new Date();
  const hoursBack = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
  const startDate = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

  // Get revenue data
  const revenueData = await db('analytics_cache')
    .where('organization_id', organizationId)
    .where('metric_type', 'revenue')
    .where('date', '>=', startDate)
    .orderBy('date', 'desc')
    .limit(100);

  // Get latest attribution data
  const attributionData = await db('attribution_data')
    .where('organization_id', organizationId)
    .where('order_date', '>=', startDate)
    .groupBy('channel')
    .select(
      'channel',
      db.raw('SUM(revenue) as revenue'),
      db.raw('SUM(cost) as cost'),
      db.raw('COUNT(*) as orders')
    );

  // Calculate key metrics
  const totalRevenue = revenueData.reduce((sum, d) => sum + (parseFloat(d.data?.revenue) || 0), 0);
  const totalOrders = revenueData.reduce((sum, d) => sum + (parseInt(d.data?.orders) || 0), 0);

  return {
    timestamp: new Date().toISOString(),
    timeRange,
    metrics: {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    },
    revenueData: revenueData.slice(0, 30), // Last 30 data points
    attributionData: attributionData.map(a => ({
      channel: a.channel,
      revenue: parseFloat(a.revenue),
      cost: parseFloat(a.cost),
      orders: parseInt(a.orders),
      roas: parseFloat(a.cost) > 0 ? parseFloat(a.revenue) / parseFloat(a.cost) : 0
    }))
  };
}

module.exports = {
  initializeWebSocket,
  broadcastToOrganization,
  broadcastMetricUpdate,
  sendNotification
};
