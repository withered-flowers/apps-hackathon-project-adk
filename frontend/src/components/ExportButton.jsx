import { useState } from 'react';
import { exportToDrive } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * ExportButton — appears when a session is Complete.
 * Calls POST /api/export/{sessionId} and shows a link to the Drive doc.
 */
export default function ExportButton({ sessionId }) {
  const [loading, setLoading] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');
  const [error, setError] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await exportToDrive(sessionId);
      setDriveUrl(data.drive_url);
    } catch (err) {
      setError('Export failed — make sure Google Drive MCP is configured.');
    } finally {
      setLoading(false);
    }
  };

  if (driveUrl) {
    return (
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: 'rgba(72, 187, 120, 0.1)',
          border: '1px solid rgba(72, 187, 120, 0.3)',
          borderRadius: '12px',
          fontSize: '0.88rem',
        }}
      >
        <span>📄</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>Report saved to Drive:</span>
        <a
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#48bb78', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.target.style.textDecoration = 'none')}
        >
          Open Document ↗
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        id="export-to-drive-btn"
        className="btn-secondary"
        onClick={handleExport}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {loading ? <LoadingSpinner size={16} /> : <span>📄</span>}
        {loading ? 'Exporting...' : 'Save Report to Google Drive'}
      </button>
      {error && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-red)', marginLeft: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
