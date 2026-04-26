import React, { useState, useEffect } from 'react';

interface ClipboardVersion {
  id: string;
  content: string;
  created_at: string;
  username?: string;
}

interface VersionHistoryProps {
  handle: string;
}

export const ClipboardVersionHistory: React.FC<VersionHistoryProps> = ({ handle }) => {
  const [versions, setVersions] = useState<ClipboardVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [handle]);

  const fetchVersions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pro/${handle}/pro/versions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setVersions(data.data);
      }
    } catch (err) {
      setError('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pro/${handle}/pro/restore/${versionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchVersions();
        alert('Clipboard restored successfully');
      }
    } catch (err) {
      alert('Failed to restore version');
    }
  };

  if (loading) return <div>Loading versions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="version-history">
      <h3>Version History</h3>
      <div className="versions-list">
        {versions.map((version) => (
          <div key={version.id} className="version-item">
            <div className="version-header">
              <span className="version-time">
                {new Date(version.created_at).toLocaleString()}
              </span>
              {version.username && <span className="version-author">by {version.username}</span>}
            </div>
            <div className="version-preview">
              {version.content.substring(0, 100)}...
            </div>
            <button
              onClick={() => handleRestore(version.id)}
              className="restore-btn"
            >
              Restore This Version
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
