import { useState } from 'react';
import axios from '../../api/axios';

const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const AdminPanel = ({ project }) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null);

  // Handle project validation/rejection
  const handleValidation = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status} this project?`)) {
      return;
    }

    try {
      setLoading(true);
      setAction(status);
      
      await axios.patch(`/admin/projects/${project._id}`, {
        status,
        reason: status === 'rejected' ? 'Does not meet platform guidelines' : undefined,
      });

      alert(`Project ${status} successfully!`);
      window.location.reload();
    } catch (err) {
      console.error(`Error ${status}ing project:`, err);
      alert(err.response?.data?.message || `Failed to ${status} project`);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  // Handle user suspension
  const handleSuspendUser = async () => {
    if (!project.creator?._id) {
      console.error('No creator ID found');
      return;
    }

    const reason = prompt('Please provide a reason for suspension:');
    if (!reason) return;

    try {
      setLoading(true);
      
      await axios.patch(`/admin/users/${project.creator._id}/suspend`, {
        reason,
      });

      alert('User suspended successfully!');
    } catch (err) {
      console.error('Error suspending user:', err);
      alert(err.response?.data?.message || 'Failed to suspend user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: 12,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <h4 style={{
        fontFamily: F.jakarta,
        fontSize: 13,
        fontWeight: 600,
        color: '#92400E',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Admin Actions
      </h4>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {/* Approve Button */}
        <button
          onClick={() => handleValidation('approved')}
          disabled={loading}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            fontFamily: F.jakarta,
            fontSize: 11,
            fontWeight: 600,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#059669',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading && action === 'approved' ? (
            <div style={{
              width: 12,
              height: 12,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : (
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          Approve
        </button>

        {/* Reject Button */}
        <button
          onClick={() => handleValidation('rejected')}
          disabled={loading}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            fontFamily: F.jakarta,
            fontSize: 11,
            fontWeight: 600,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#DC2626',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading && action === 'rejected' ? (
            <div style={{
              width: 12,
              height: 12,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : (
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
          Reject
        </button>

        {/* Suspend User Button */}
        {project.creator?._id && (
          <button
            onClick={handleSuspendUser}
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontFamily: F.jakarta,
              fontSize: 11,
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: '#4B5563',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368m1.414-1.414a6 6 0 01-7.778 7.778l-8.368-8.367a6 6 0 117.778-7.778zm-2.83 2.83a6 6 0 010-8.485l-4.95-4.95a6 6 0 018.485 8.485L6.586 9.41z" clipRule="evenodd" />
            </svg>
            Suspend User
          </button>
        )}
      </div>

      {/* Project Info */}
      <div style={{
        fontSize: 11,
        color: '#92400E',
        paddingTop: 8,
        borderTop: '1px solid #FDE68A',
        lineHeight: 1.6,
      }}>
        <p style={{ margin: 0 }}><strong>Status:</strong> {project.status || 'pending'}</p>
        <p style={{ margin: '2px 0 0 0' }}><strong>Creator:</strong> {project.creator?.email || 'Unknown'}</p>
        <p style={{ margin: '2px 0 0 0' }}><strong>Submitted:</strong> {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}</p>
      </div>
    </div>
  );
};

export default AdminPanel;
