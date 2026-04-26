import React, { useState } from 'react';

interface ProClipboardCreateProps {
  onClipboardCreated?: (clipboard: any) => void;
}

export const ProClipboardCreate: React.FC<ProClipboardCreateProps> = ({
  onClipboardCreated,
}) => {
  const [handle, setHandle] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [syntaxHighlight, setSyntaxHighlight] = useState('plain');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pro/${handle}/pro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          password: password || undefined,
          readOnly,
          syntaxHighlight,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Pro clipboard');
      }

      setHandle('');
      setContent('');
      setPassword('');
      setReadOnly(false);
      setSyntaxHighlight('plain');

      if (onClipboardCreated) {
        onClipboardCreated(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-clipboard-create">
      <h2>Create Pro Clipboard</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Clipboard Handle</label>
          <input
            type="text"
            placeholder="My-Pro-Clipboard"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            placeholder="Enter your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />
        </div>

        <div className="form-group">
          <label>Password Protection (Optional)</label>
          <input
            type="password"
            placeholder="Leave empty for no password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Syntax Highlighting</label>
          <select value={syntaxHighlight} onChange={(e) => setSyntaxHighlight(e.target.value)}>
            <option value="plain">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <div className="form-checkbox">
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
          <label>Read-only (viewers can't modify)</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Pro Clipboard'}
        </button>
      </form>
    </div>
  );
};
