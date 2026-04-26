import React, { useState, useEffect } from 'react';

interface ProSubscriptionInfo {
  tier: string;
  clipboardsUsed: number;
  maxClipboards: number;
  storageUsed: number;
  maxStorage: number;
  dataRetention: string;
  apiAccess: boolean;
  customDomain: boolean;
}

interface SubscriptionDashboardProps {
  userId?: string;
}

export const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = () => {
  const [subscription, setSubscription] = useState<ProSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pro/subscription/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSubscription(data.data);
      }
    } catch (err) {
      setError('Failed to load subscription info');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!subscription) {
    return (
      <div className="no-subscription">
        <h3>No Pro Subscription</h3>
        <p>Upgrade to Pro to unlock advanced features!</p>
        <button onClick={() => window.location.href = '/upgrade'}>
          Upgrade Now
        </button>
      </div>
    );
  }

  const storagePercentage = (subscription.storageUsed / subscription.maxStorage) * 100;
  const clipboardPercentage = (subscription.clipboardsUsed / subscription.maxClipboards) * 100;

  return (
    <div className="subscription-dashboard">
      <h3>Pro Subscription Status</h3>

      <div className="subscription-tier">
        <span className="tier-badge">{subscription.tier.toUpperCase()}</span>
      </div>

      <div className="usage-stats">
        <div className="stat-item">
          <h4>Clipboards</h4>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${clipboardPercentage}%` }}
            />
          </div>
          <p>
            {subscription.clipboardsUsed} / {subscription.maxClipboards}
          </p>
        </div>

        <div className="stat-item">
          <h4>Storage</h4>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <p>
            {(subscription.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB /
            {(subscription.maxStorage / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
        </div>
      </div>

      <div className="features">
        <h4>Features Included:</h4>
        <ul>
          <li>✓ Data retention: {subscription.dataRetention}</li>
          <li>✓ API access: {subscription.apiAccess ? 'Yes' : 'No'}</li>
          <li>✓ Custom domain: {subscription.customDomain ? 'Yes' : 'No'}</li>
          <li>✓ Password protection</li>
          <li>✓ Version history</li>
          <li>✓ Syntax highlighting</li>
          <li>✓ File uploads</li>
        </ul>
      </div>
    </div>
  );
};
