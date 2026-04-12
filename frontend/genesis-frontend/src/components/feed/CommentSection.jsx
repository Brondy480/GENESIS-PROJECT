import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import useRolePermissions from '../../hooks/useRolePermissions';
import axios from '../../api/axios';

const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const Avatar = ({ user, size = 28 }) => {
  const initial = (user?.name?.[0] || user?.firstName?.[0] || 'U').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #7C3AED, #A78BFF)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {user?.profileImage
        ? <img src={user.profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        : <span style={{ color: 'white', fontSize: size * 0.36, fontWeight: 700, fontFamily: F.jakarta }}>{initial}</span>}
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMins = Math.floor((now - date) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const CommentSection = ({ projectId, onCommentAdded }) => {
  const user = useAuthStore((state) => state.user);
  const permissions = useRolePermissions();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/publicProject/${projectId}/comments`);
        setComments(response.data.comments || response.data || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      const response = await axios.post(`/publicProject/${projectId}/comments`, {
        content: newComment.trim(),
      });
      const newCommentObj = {
        ...response.data.comment,
        user: { _id: user?._id, name: user?.name, profileImage: user?.profileImage },
      };
      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment('');
      onCommentAdded?.();
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/publicProject/${projectId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      setReplySubmitting(true);
      await axios.post(`/publicProject/${projectId}/comments/${commentId}/replies`, {
        content: replyText.trim(),
      });
      const newReply = {
        _id: `temp_${Date.now()}`,
        user: { _id: user?._id, name: user?.name, profileImage: user?.profileImage },
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => prev.map((c) =>
        c._id === commentId
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const canComment = permissions.canComment && !permissions.isAdmin;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>
        Comments ({comments.length})
      </h4>

      {/* Comment input */}
      {canComment && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{
              width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 10,
              resize: 'none', outline: 'none', fontFamily: F.dm, fontSize: 13, minHeight: 60,
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
          />
          {error && <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{newComment.length}/500</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              style={{
                padding: '6px 14px', borderRadius: 8, fontFamily: F.jakarta, fontSize: 12,
                fontWeight: 600, border: 'none',
                cursor: newComment.trim() && !submitting ? 'pointer' : 'not-allowed',
                background: newComment.trim() && !submitting ? '#7C3AED' : '#E5E7EB',
                color: newComment.trim() && !submitting ? 'white' : '#9CA3AF',
              }}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ width: 24, height: 24, border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : comments.length === 0 ? (
          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '12px 0', margin: 0 }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => {
            const commentUserName = comment.user?.firstName && comment.user?.lastName
              ? `${comment.user.firstName} ${comment.user.lastName}`
              : comment.user?.name || 'Unknown User';

            return (
              <div key={comment._id} style={{ display: 'flex', gap: 10, padding: 8, borderRadius: 10, transition: 'background 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>

                <Avatar user={comment.user} size={28} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Comment header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: F.jakarta, fontSize: 12, fontWeight: 600, color: '#1F2937' }}>
                      {commentUserName}
                    </span>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>{formatDate(comment.createdAt)}</span>
                  </div>

                  {/* Comment body */}
                  <p style={{ fontFamily: F.dm, fontSize: 12, color: '#4B5563', margin: '2px 0 4px', lineHeight: 1.4 }}>
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {canComment && (
                      <button
                        onClick={() => { setReplyingTo(replyingTo === comment._id ? null : comment._id); setReplyText(''); }}
                        style={{ fontSize: 11, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: F.jakarta, fontWeight: 600 }}
                      >
                        Reply
                      </button>
                    )}
                    {(permissions.isAdmin || comment.user?._id === user?._id) && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        style={{ fontSize: 11, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply input */}
                  {replyingTo === comment._id && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontFamily: F.dm, outline: 'none' }}
                        onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                        onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleReply(comment._id); }}
                      />
                      <button
                        onClick={() => handleReply(comment._id)}
                        disabled={!replyText.trim() || replySubmitting}
                        style={{
                          padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 11,
                          fontFamily: F.jakarta, fontWeight: 600, cursor: replyText.trim() && !replySubmitting ? 'pointer' : 'not-allowed',
                          background: replyText.trim() && !replySubmitting ? '#7C3AED' : '#E5E7EB',
                          color: replyText.trim() && !replySubmitting ? 'white' : '#9CA3AF',
                        }}
                      >
                        {replySubmitting ? '...' : 'Reply'}
                      </button>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div style={{ marginTop: 8, paddingLeft: 10, borderLeft: '2px solid #EDE9FE', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {comment.replies.map((reply) => {
                        const replyUserName = reply.user?.name || 'User';
                        return (
                          <div key={reply._id} style={{ display: 'flex', gap: 7 }}>
                            <Avatar user={reply.user} size={22} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontFamily: F.jakarta, fontSize: 11, fontWeight: 600, color: '#1F2937' }}>{replyUserName}</span>
                                <span style={{ fontSize: 10, color: '#9CA3AF' }}>{formatDate(reply.createdAt)}</span>
                              </div>
                              <p style={{ fontFamily: F.dm, fontSize: 11, color: '#4B5563', margin: '2px 0 0', lineHeight: 1.4 }}>{reply.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
