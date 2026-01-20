import React, { useState, useEffect } from 'react';
import { Users, Building2, CreditCard, Trash2, Save, Plus, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const theme = localStorage.getItem('theme') || 'dark';

  // Team Management State
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Organization Settings State
  const [orgSettings, setOrgSettings] = useState({
    name: '',
    plan: 'free',
    settings: {}
  });

  // Billing State
  const [billingInfo, setBillingInfo] = useState({
    plan: 'free',
    status: 'active',
    nextBillingDate: null,
    invoices: []
  });

  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeamMembers();
    } else if (activeTab === 'organization') {
      fetchOrganizationSettings();
    } else if (activeTab === 'billing') {
      fetchBillingInfo();
    }
  }, [activeTab]);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/organizations/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      const errorMsg = error.response?.data?.error || 'Failed to load team members';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const fetchOrganizationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrgSettings(response.data.organization || {});
    } catch (error) {
      console.error('Error fetching organization:', error);
      setMessage({ type: 'error', text: 'Failed to load organization settings' });
    }
  };

  const fetchBillingInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/billing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBillingInfo(response.data || {});
    } catch (error) {
      console.error('Error fetching billing info:', error);
    }
  };


  const handleInviteUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/organizations/invite',
        { email: inviteEmail, role: inviteRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Invitation sent successfully!' });
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteForm(false);
      fetchTeamMembers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send invitation' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/organizations/members/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Role updated successfully!' });
      fetchTeamMembers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/organizations/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Team member removed successfully!' });
      fetchTeamMembers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove team member' });
    }
  };

  const handleUpdateOrganization = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3001/api/organizations',
        { name: orgSettings.name, settings: orgSettings.settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Organization updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update organization' });
    } finally {
      setLoading(false);
    }
  };


  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return '#6366f1';
      case 'admin': return '#8b5cf6';
      case 'member': return '#10b981';
      case 'viewer': return '#f59e0b';
      default: return '#666';
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'enterprise': return '#6366f1';
      case 'growth': return '#8b5cf6';
      case 'starter': return '#10b981';
      case 'free': return '#666';
      default: return '#666';
    }
  };

  return (
    <div className={`settings-container ${theme}`}>
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your organization, team, and integrations</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <button
            className={`sidebar-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users size={20} />
            Team Management
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'organization' ? 'active' : ''}`}
            onClick={() => setActiveTab('organization')}
          >
            <Building2 size={20} />
            Organization
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <CreditCard size={20} />
            Billing & Plans
          </button>
        </aside>

        {/* Main Content */}
        <main className="settings-content">
          {activeTab === 'team' && (
            <div className="settings-section">
              <div className="section-header">
                <div>
                  <h2>Team Management</h2>
                  <p>Invite team members and manage their roles</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setShowInviteForm(!showInviteForm)}
                >
                  <Plus size={18} />
                  Invite Member
                </button>
              </div>

              {showInviteForm && (
                <div className="invite-form-card">
                  <form onSubmit={handleInviteUser}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                          <option value="viewer">Viewer</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setShowInviteForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="primary-button" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Invitation'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="team-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="member-info">
                            <div className="member-avatar">
                              {member.first_name?.[0] || member.email[0].toUpperCase()}
                            </div>
                            <span>{member.first_name} {member.last_name}</span>
                          </div>
                        </td>
                        <td>{member.email}</td>
                        <td>
                          <select
                            className="role-select"
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            style={{
                              borderColor: getRoleBadgeColor(member.role),
                              color: getRoleBadgeColor(member.role)
                            }}
                            disabled={member.role === 'owner'}
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td>
                          {member.role !== 'owner' && (
                            <button
                              className="danger-button-small"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {teamMembers.length === 0 && (
                  <div className="empty-state">
                    <Users size={48} />
                    <p>No team members yet</p>
                    <span>Invite your first team member to get started</span>
                  </div>
                )}
              </div>

              <div className="role-guide">
                <h3>Role Permissions</h3>
                <div className="role-cards">
                  <div className="role-card">
                    <div className="role-badge" style={{ backgroundColor: getRoleBadgeColor('owner') }}>
                      Owner
                    </div>
                    <p>Full access to all features, billing, and team management</p>
                  </div>
                  <div className="role-card">
                    <div className="role-badge" style={{ backgroundColor: getRoleBadgeColor('admin') }}>
                      Admin
                    </div>
                    <p>Manage team members, integrations, and view all data</p>
                  </div>
                  <div className="role-card">
                    <div className="role-badge" style={{ backgroundColor: getRoleBadgeColor('member') }}>
                      Member
                    </div>
                    <p>View and analyze data, create reports</p>
                  </div>
                  <div className="role-card">
                    <div className="role-badge" style={{ backgroundColor: getRoleBadgeColor('viewer') }}>
                      Viewer
                    </div>
                    <p>Read-only access to dashboards and reports</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="settings-section">
              <div className="section-header">
                <div>
                  <h2>Organization Settings</h2>
                  <p>Manage your organization details and preferences</p>
                </div>
              </div>

              <form onSubmit={handleUpdateOrganization}>
                <div className="settings-card">
                  <h3>Organization Details</h3>
                  <div className="form-group">
                    <label>Organization Name</label>
                    <input
                      type="text"
                      placeholder="Acme Inc."
                      value={orgSettings.name || ''}
                      onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Current Plan</label>
                    <div className="plan-display">
                      <span
                        className="plan-badge"
                        style={{ backgroundColor: getPlanBadgeColor(orgSettings.plan) }}
                      >
                        {orgSettings.plan?.toUpperCase() || 'FREE'}
                      </span>
                      <button type="button" className="text-link">
                        Upgrade Plan →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3>Preferences</h3>
                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Email Notifications</strong>
                      <span>Receive weekly summary emails</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Data Sync Alerts</strong>
                      <span>Get notified when integrations sync</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <strong>Performance Alerts</strong>
                      <span>Alerts for significant metric changes</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={loading}>
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-section">
              <div className="section-header">
                <div>
                  <h2>Billing & Subscription</h2>
                  <p>Manage your subscription and payment details</p>
                </div>
              </div>

              <div className="settings-card">
                <h3>Current Plan</h3>
                <div className="current-plan">
                  <div className="plan-info">
                    <span
                      className="plan-badge-large"
                      style={{ backgroundColor: getPlanBadgeColor(billingInfo.plan) }}
                    >
                      {billingInfo.plan?.toUpperCase() || 'FREE'}
                    </span>
                    <div className="plan-details">
                      <strong>Free Plan</strong>
                      <span>Up to 1,000 orders/month</span>
                    </div>
                  </div>
                  <button className="upgrade-button">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <div className="pricing-cards">
                <div className="pricing-card">
                  <h4>Starter</h4>
                  <div className="price">$19<span>/month</span></div>
                  <ul className="features">
                    <li><Check size={16} /> Up to 10,000 orders/month</li>
                    <li><Check size={16} /> All integrations</li>
                    <li><Check size={16} /> Advanced analytics</li>
                    <li><Check size={16} /> Email support</li>
                  </ul>
                  <button className="select-plan-button">Select Plan</button>
                </div>

                <div className="pricing-card featured">
                  <div className="featured-badge">Basic</div>
                  <h4>Basic</h4>
                  <div className="price">$149<span>/month</span></div>
                  <ul className="features">
                    <li><Check size={16} /> Extended usages</li>
                    <li><Check size={16} /> All integrations</li>
                    <li><Check size={16} /> Automated alerts and reports</li>
                    <li><Check size={16} /> API access</li>
                    <li><Check size={16} /> Priority support</li>
                  </ul>
                  <button className="select-plan-button primary">Select Plan</button>
                </div>

                <div className="pricing-card">
                  <h4>PLUS</h4>
                  <div className="price">Plus</div>
                  <ul className="features">
                    <li><Check size={16} /> Unlimited usages</li>
                    <li><Check size={16} /> Custom integrations</li>
                    <li><Check size={16} /> Dedicated support</li>
                    <li><Check size={16} /> SLA guarantee</li>
                    <li><Check size={16} /> Custom reporting</li>
                  </ul>
                  <button className="select-plan-button">Contact Sales</button>
                </div>
              </div>

              <div className="settings-card">
                <h3>Billing History</h3>
                <div className="billing-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="5" className="empty-message">No billing history yet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px;
          color: #fff;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .settings-header p {
          color: #888;
          font-size: 16px;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          font-weight: 500;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 32px;
        }

        .settings-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .sidebar-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .sidebar-tab.active {
          background: linear-gradient(135deg, oklch(38% .13 265 / 0.2) 0%, oklch(48% .18 265 / 0.2) 100%);
          border-color: oklch(38% .13 265 / 0.5);
          color: #fff;
        }

        .settings-content {
          background: rgba(26, 26, 26, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .section-header p {
          color: #888;
          font-size: 14px;
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, oklch(38% .13 265) 0%, oklch(48% .18 265) 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px oklch(38% .13 265 / 0.4);
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .invite-form-card {
          background: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .form-group input,
        .form-group select {
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: oklch(38% .13 265);
          background: rgba(0, 0, 0, 0.4);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .team-table {
          background: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
          text-align: left;
          padding: 16px 20px;
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        td {
          padding: 16px 20px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .member-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .role-select {
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .role-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .danger-button-small {
          padding: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
        }

        .danger-button-small:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #666;
          text-align: center;
        }

        .empty-state p {
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0 8px;
          color: #888;
        }

        .empty-state span {
          font-size: 14px;
          color: #666;
        }

        .role-guide {
          background: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
        }

        .role-guide h3 {
          font-size: 18px;
          margin-bottom: 16px;
        }

        .role-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .role-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }

        .role-card p {
          font-size: 13px;
          color: #888;
          line-height: 1.5;
        }

        .settings-card {
          background: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
        }

        .settings-card h3 {
          font-size: 18px;
          margin-bottom: 20px;
        }

        .plan-display {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .plan-badge {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }

        .text-link {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }

        .text-link:hover {
          color: #8b5cf6;
        }

        .preference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .preference-item:last-child {
          border-bottom: none;
        }

        .preference-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .preference-info strong {
          font-size: 14px;
        }

        .preference-info span {
          font-size: 13px;
          color: #888;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 26px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: 0.3s;
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-color: transparent;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .current-plan {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .plan-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .plan-badge-large {
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
        }

        .plan-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .plan-details strong {
          font-size: 16px;
        }

        .plan-details span {
          font-size: 13px;
          color: #888;
        }

        .upgrade-button {
          padding: 10px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upgrade-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin: 24px 0;
        }

        .pricing-card {
          background: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 28px;
          position: relative;
          transition: all 0.3s;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.5);
        }

        .pricing-card.featured {
          border-color: rgba(99, 102, 241, 0.5);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        }

        .featured-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 16px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }

        .pricing-card h4 {
          font-size: 20px;
          margin-bottom: 12px;
        }

        .price {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .price span {
          font-size: 16px;
          font-weight: 400;
          color: #888;
        }

        .features {
          list-style: none;
          margin-bottom: 24px;
        }

        .features li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 14px;
          color: #ddd;
        }

        .select-plan-button {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .select-plan-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .select-plan-button.primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
        }

        .select-plan-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .billing-table {
          margin-top: 20px;
        }

        .empty-message {
          text-align: center;
          padding: 40px !important;
          color: #666;
        }

        .integrations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .integration-card {
          background: rgba(26, 26, 26, 0.6);
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

        .integration-card h4 {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .status {
          font-size: 12px;
          font-weight: 600;
        }

        .status.connected {
          color: #10b981;
        }

        .status.disconnected {
          color: #ef4444;
        }

        .integration-details {
          margin-bottom: 16px;
        }

        .integration-details p {
          font-size: 13px;
          color: #888;
        }

        .integration-actions {
          display: flex;
          gap: 8px;
        }

        .secondary-button-small,
        .primary-button-small {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-button-small {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .secondary-button-small:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .primary-button-small {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          color: #fff;
        }

        .primary-button-small:hover {
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .full-width {
          grid-column: 1 / -1;
        }

        @media (max-width: 1024px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            flex-direction: row;
            overflow-x: auto;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .pricing-cards {
            grid-template-columns: 1fr;
          }
        }

        /* Light Theme Overrides - Based on AskEdge.ai Design */
        .settings-container.light .settings-header h1 {
          color: #34322d;
        }

        .settings-container.light .settings-header p {
          color: #5e5e5b;
        }

        .settings-container.light .message {
          background: #fafafa;
          color: #34322d;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .message.success {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .settings-container.light .message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .settings-container.light .settings-sidebar {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .sidebar-tab {
          color: #5e5e5b;
          border-color: transparent;
        }

        .settings-container.light .sidebar-tab:hover {
          background: rgba(55, 53, 47, 0.06);
          color: #34322d;
        }

        .settings-container.light .sidebar-tab.active {
          background: rgba(55, 53, 47, 0.08);
          border-color: oklch(38% .13 265 / 0.2);
          color: oklch(38% .13 265);
        }

        .settings-container.light .settings-content {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .section-header h2 {
          color: #34322d;
        }

        .settings-container.light .section-header p {
          color: #5e5e5b;
        }

        .settings-container.light .form-group label {
          color: #34322d;
        }

        .settings-container.light .form-group input,
        .settings-container.light .form-group select,
        .settings-container.light .form-group textarea {
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.06);
          color: #34322d;
        }

        .settings-container.light .form-group input::placeholder {
          color: #858481;
        }

        .settings-container.light .form-group input:focus,
        .settings-container.light .form-group select:focus {
          border-color: oklch(38% .13 265);
          background: #ffffff;
        }

        .settings-container.light .team-table {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .team-table th {
          color: #5e5e5b;
          border-bottom-color: rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .team-table td {
          color: #34322d;
          border-bottom-color: rgba(0, 0, 0, 0.04);
        }

        .settings-container.light .team-table tbody tr:hover {
          background: #fafafa;
        }

        .settings-container.light .role-badge {
          background: rgba(55, 53, 47, 0.08);
          color: #34322d;
        }

        .settings-container.light .role-select {
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.06);
          color: #34322d;
        }

        .settings-container.light .danger-button {
          color: #dc2626;
        }

        .settings-container.light .danger-button:hover {
          background: rgba(220, 38, 38, 0.08);
        }

        .settings-container.light .pricing-card {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .pricing-card.featured {
          border-color: oklch(38% .13 265);
          background: #fafafa;
        }

        .settings-container.light .pricing-card h4 {
          color: #34322d;
        }

        .settings-container.light .price {
          color: #34322d;
        }

        .settings-container.light .features li {
          color: #5e5e5b;
        }

        .settings-container.light .select-plan-button {
          background: #fafafa;
          color: #34322d;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .select-plan-button:hover {
          background: rgba(55, 53, 47, 0.06);
        }

        .settings-container.light .billing-history {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .settings-container.light .billing-history h4 {
          color: #34322d;
        }
      `}</style>
    </div>
  );
};

export default Settings;
