const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get organization details
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const organization = await db('organizations').where({ id: organizationId }).first();
    res.json({ organization });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Update organization
router.put('/', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { name, settings } = req.body;
    await db('organizations').where({ id: organizationId }).update({ name, settings });
    res.json({ message: 'Organization updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// Get team members
router.get('/members', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const members = await db('organization_members')
      .join('users', 'organization_members.user_id', 'users.id')
      .where('organization_members.organization_id', organizationId)
      .select('users.id', 'users.email', 'users.first_name', 'users.last_name', 'organization_members.role');
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Invite user to organization
router.post('/invite', async (req, res) => {
  try {
    const { organizationId, role: userRole } = req.user;
    const { email, role } = req.body;

    // Check permissions - only owners and admins can invite
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to invite users' });
    }

    // Check if user already exists
    let user = await db('users').where({ email }).first();

    if (user) {
      // Check if already a member
      const existingMember = await db('organization_members')
        .where({ organization_id: organizationId, user_id: user.id })
        .first();

      if (existingMember) {
        return res.status(400).json({ error: 'User is already a member of this organization' });
      }

      // Add existing user to organization
      await db('organization_members').insert({
        organization_id: organizationId,
        user_id: user.id,
        role: role || 'member'
      });
    } else {
      // For now, return error - in production, send invitation email
      return res.status(400).json({
        error: 'User does not exist. In production, an invitation email would be sent.'
      });
    }

    res.json({ message: 'User added to organization successfully' });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// Update member role
router.put('/members/:userId', async (req, res) => {
  try {
    const { organizationId, role: userRole } = req.user;
    const { userId } = req.params;
    const { role } = req.body;

    // Check permissions
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update roles' });
    }

    // Prevent changing owner role
    const member = await db('organization_members')
      .where({ organization_id: organizationId, user_id: userId })
      .first();

    if (member && member.role === 'owner') {
      return res.status(403).json({ error: 'Cannot change owner role' });
    }

    // Update role
    await db('organization_members')
      .where({ organization_id: organizationId, user_id: userId })
      .update({ role });

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Remove member from organization
router.delete('/members/:userId', async (req, res) => {
  try {
    const { organizationId, role: userRole } = req.user;
    const { userId } = req.params;

    // Check permissions
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to remove members' });
    }

    // Prevent removing owner
    const member = await db('organization_members')
      .where({ organization_id: organizationId, user_id: userId })
      .first();

    if (member && member.role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove owner from organization' });
    }

    // Remove member
    await db('organization_members')
      .where({ organization_id: organizationId, user_id: userId })
      .delete();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
