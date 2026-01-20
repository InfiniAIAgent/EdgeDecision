const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validateRegistration, validateLogin } = require('../validators/auth');

// Register new user and organization
router.post('/register', async (req, res) => {
  try {
    const { error } = validateRegistration(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, firstName, lastName, organizationName } = req.body;

    // Check if user exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create organization and user in transaction
    const result = await db.transaction(async trx => {
      // Create organization
      const [organization] = await trx('organizations')
        .insert({
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
          plan: 'free',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
        })
        .returning('*');

      // Create user
      const [user] = await trx('users')
        .insert({
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName
        })
        .returning(['id', 'email', 'first_name', 'last_name']);

      // Link user to organization as owner
      await trx('organization_members').insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner'
      });

      return { organization, user };
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: result.user.id, 
        organizationId: result.organization.id,
        role: 'owner'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: result.user,
      organization: result.organization
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    // Get user
    const user = await db('users')
      .where({ email })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user's organizations
    const memberships = await db('organization_members')
      .join('organizations', 'organization_members.organization_id', 'organizations.id')
      .where('organization_members.user_id', user.id)
      .select(
        'organizations.*',
        'organization_members.role'
      );

    if (memberships.length === 0) {
      return res.status(403).json({ error: 'No organization access' });
    }

    // Use first organization (in real app, let user choose)
    const membership = memberships[0];

    // Update last login
    await db('users')
      .where({ id: user.id })
      .update({ last_login_at: new Date() });

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        organizationId: membership.id,
        role: membership.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url
      },
      organization: {
        id: membership.id,
        name: membership.name,
        slug: membership.slug,
        plan: membership.plan,
        role: membership.role
      },
      organizations: memberships
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db('users')
      .where({ id: decoded.userId })
      .select('id', 'email', 'first_name', 'last_name', 'avatar_url')
      .first();

    const organization = await db('organizations')
      .where({ id: decoded.organizationId })
      .first();

    res.json({
      user,
      organization: {
        ...organization,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token: oldToken } = req.body;
    
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });

    // Generate new token
    const token = jwt.sign(
      { 
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        role: decoded.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
