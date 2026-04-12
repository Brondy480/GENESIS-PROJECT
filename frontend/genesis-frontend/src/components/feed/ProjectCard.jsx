import { useState } from 'react';
import { Link } from 'react-router-dom';
import useRolePermissions from '../../hooks/useRolePermissions';
import CommentSection from './CommentSection';
import AdminPanel from './AdminPanel';
import axios from '../../api/axios';

const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const ProjectCard = ({ project, onFund, onInvest }) => {
  const permissions = useRolePermissions();
  const [showComments, setShowComments] = useState(false);
  const [localLiked, setLocalLiked] = useState(project?.isLiked || false);
  const [localLikes, setLocalLikes] = useState(project?.likes || 0);
  const [localSaved, setLocalSaved] = useState(project?.isSaved || false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    _id,
    title = 'Untitled Project',
    description = '',
    coverImage,
    category = 'General',
    fundingType = 'funding',
    fundingGoal = 0,
    currentFunding = 0,
    backers = 0,
    daysLeft = 30,
    creator = {},
    commentsCount = 0,
    status = 'approved',
  } = project || {};

  const progressPercent = fundingGoal > 0
    ? Math.min(Math.round((currentFunding / fundingGoal) * 100), 100)
    : 0;

  const formatCurrency = (amount) => `${(amount || 0).toLocaleString()} FCFA`;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;

    try {
      setLiking(true);
      setLocalLiked(!localLiked);
      setLocalLikes(prev => localLiked ? prev - 1 : prev + 1);
      await axios.post(`/publicProject/${_id}/like`);
    } catch (err) {
      console.error('Error liking project:', err);
      setLocalLiked(localLiked);
      setLocalLikes(project?.likes || 0);
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;

    try {
      setSaving(true);
      setLocalSaved(!localSaved);
      await axios.post(`/publicProject/${_id}/save`);
    } catch (err) {
      console.error('Error saving project:', err);
      setLocalSaved(localSaved);
    } finally {
      setSaving(false);
    }
  };

  const getActionButton = () => {
    const buttonStyle = {
      padding: '10px 24px',
      borderRadius: 8,
      fontFamily: F.jakarta,
      fontWeight: 600,
      fontSize: 13,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    };

    if (permissions.isBacker && fundingType === 'funding') {
      return (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFund?.(_id); }}
          style={{ ...buttonStyle, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white' }}
        >
          🎯 Back This Project
        </button>
      );
    }

    if (permissions.isInvestor && fundingType === 'investment') {
      return (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInvest?.(_id); }}
          style={{ ...buttonStyle, background: 'linear-gradient(135deg, #D97706, #B45309)', color: 'white' }}
        >
          💰 Invest Now
        </button>
      );
    }

    return (
      <Link
        to={`/project/${_id}`}
        onClick={(e) => e.stopPropagation()}
        style={{ ...buttonStyle, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
      >
        👁️ View Project
      </Link>
    );
  };

  return (
    <div
      style={{
        width: '340px',
        minWidth: '340px',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.2s',
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Cover Image */}
      <Link to={`/project/${_id}`} style={{ display: 'block', position: 'relative', height: 180, overflow: 'hidden' }}>
        <img
          src={coverImage || 'https://via.placeholder.com/400x200?text=No+Image'}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
        />
        <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: F.jakarta, color: 'white', textTransform: 'uppercase' }}>
          {category}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 8px', background: fundingType === 'investment' ? 'rgba(217, 119, 6, 0.9)' : 'rgba(79, 70, 229, 0.9)', borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: F.jakarta, color: 'white' }}>
          {fundingType === 'investment' ? '💰 Investment' : '🎯 Funding'}
        </div>
      </Link>

      {/* Card Content */}
      <div style={{ padding: 14 }}>
        {/* Creator Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #7C3AED, #A78BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, marginRight: 10 }}>
            {creator?.firstName?.[0] || creator?.name?.[0] || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, color: '#050505', margin: 0 }}>
              {creator?.firstName && creator?.lastName ? `${creator.firstName} ${creator.lastName}` : creator?.name || 'Unknown Creator'}
            </p>
            <p style={{ fontFamily: F.dm, fontSize: 11, color: '#65676B', margin: 0 }}>
              {creator?.title || creator?.role || 'Project Creator'}
            </p>
          </div>
        </div>

        {/* Title */}
        <Link to={`/project/${_id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontFamily: F.jakarta, fontSize: 15, fontWeight: 600, color: '#050505', marginBottom: 6, cursor: 'pointer', lineHeight: 1.2 }}>
            {title}
          </h3>
        </Link>

        {/* Description */}
        <p style={{ fontFamily: F.dm, fontSize: 13, color: '#65676B', marginBottom: 12, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>

        {/* Funding Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontFamily: F.jakarta, fontSize: 14, fontWeight: 700, color: '#7C3AED' }}>
              {formatCurrency(currentFunding)}
            </span>
            <span style={{ fontFamily: F.dm, fontSize: 11, color: '#65676B' }}>
              of {formatCurrency(fundingGoal)}
            </span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#E4E6EB', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #7C3AED, #6D28D9)', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontFamily: F.dm, fontSize: 11, color: '#65676B' }}>{progressPercent}% funded</span>
            <span style={{ fontFamily: F.dm, fontSize: 11, color: '#65676B' }}>{daysLeft} days left</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 12, color: '#65676B' }}>
          <span>👥 {backers} backers</span>
          <span>💬 {commentsCount} comments</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #E4E6EB' }}>
          {getActionButton()}
        </div>

        {/* Social Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 8 }}>
          <button onClick={handleLike} disabled={liking} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 6, border: 'none', cursor: liking ? 'wait' : 'pointer', background: localLiked ? '#FCE8E8' : 'transparent', color: localLiked ? '#E02424' : '#65676B', fontFamily: F.dm, fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>
            <svg width="18" height="18" fill={localLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {localLikes}
          </button>

          <button onClick={() => setShowComments(!showComments)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: showComments ? '#E7F3FF' : 'transparent', color: showComments ? '#1877F2' : '#65676B', fontFamily: F.dm, fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comment
          </button>

          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 6, border: 'none', cursor: saving ? 'wait' : 'pointer', background: localSaved ? '#FFF3CD' : 'transparent', color: localSaved ? '#F59E0B' : '#65676B', fontFamily: F.dm, fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>
            <svg width="18" height="18" fill={localSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {localSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E4E6EB' }}>
            <CommentSection projectId={_id} />
          </div>
        )}

        {/* Admin Panel */}
        {permissions.isAdmin && status !== 'approved' && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E4E6EB' }}>
            <AdminPanel project={project} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
