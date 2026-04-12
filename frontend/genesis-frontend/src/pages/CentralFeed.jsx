import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Bookmark, Share2, Search, Bell, MoreHorizontal,
  TrendingUp, UserPlus, DollarSign, Award, Flame, LayoutDashboard, Plus,
  Trash2, UserX, ExternalLink, Shield, Play, FileText,
} from 'lucide-react';
import { deleteProject, suspendUser } from '../api/admin';
import useAuthStore from '../store/authStore';
import useRolePermissions from '../hooks/useRolePermissions';
import axios from '../api/axios';
import FundModal from '../components/feed/FundModal';
import InvestModal from '../components/feed/InvestModal';
import CommentSection from '../components/feed/CommentSection';

// ─── Style Constants ───────────────────────────────────────────────────────────
const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const formatCurrency = (amount) =>
  `${(amount || 0).toLocaleString()} FCFA`;

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const categoryColor = (cat) =>
  ({ FinTech: '#7C3AED', AgriTech: '#059669', HealthTech: '#DC2626', EdTech: '#2563EB' }[cat] || '#D97706');

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
    <div style={{ height: 380, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 13, background: '#f0f0f0', borderRadius: 4, width: '40%', marginBottom: 6 }} />
          <div style={{ height: 11, background: '#f0f0f0', borderRadius: 4, width: '25%' }} />
        </div>
      </div>
      <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, marginBottom: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ height: 52, background: '#f0f0f0', borderRadius: 8 }} />)}
      </div>
    </div>
  </div>
);

// ─── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = forwardRef(({ project, permissions, onLike, onSave, onFund, onInvest, isAdmin, onDeleteProject, onSuspendCreator }, ref) => {
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(project?.commentsCount || 0);
  const navigate = useNavigate();

  const isBacker = permissions?.isBacker || false;
  const isInvestor = permissions?.isInvestor || false;

  const {
    _id,
    title = 'Untitled Project',
    coverImage,
    category = 'General',
    allowInvestment = false,
    allowFunding = false,
    targetAmount = 0,
    currentAmount = 0,
    equityPercentage,
    funders = [],
    deadline,
    creator = {},
    likes = 0,
    isLiked = false,
    isSaved = false,
    createdAt,
    demoVideoUrl,
    businessPlan,
  } = project;

  const daysLeft = deadline
    ? Math.max(0, Math.ceil((new Date(deadline) - new Date()) / 86400000))
    : 30;
  const progressPercent = targetAmount > 0
    ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
    : 0;

  const creatorName =
    creator?.firstName && creator?.lastName
      ? `${creator.firstName} ${creator.lastName}`
      : creator?.name || 'Creator';
  const creatorInitial = (creator?.firstName || creator?.name || 'U')[0].toUpperCase();

  const [imgError, setImgError] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.15)'; e.currentTarget.style.borderLeft = '3px solid #7C3AED'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.borderLeft = 'none'; }}
      style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', transition: 'box-shadow 0.2s, border-left 0.2s' }}
    >
      {/* ── Card Header ── */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7C3AED,#A78BFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 15, fontWeight: 700, flexShrink: 0,
          overflow: 'hidden',
        }}>
          {creator?.profileImage
            ? <img src={creator.profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : creatorInitial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1E21', fontFamily: F.jakarta, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {creatorName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
              color: 'white', background: categoryColor(category),
            }}>
              {category}
            </span>
            <span style={{ color: '#65676B', fontSize: 13 }}>·</span>
            <span style={{ fontSize: 12, color: '#65676B' }}>{timeAgo(createdAt)}</span>
          </div>
        </div>
        {isAdmin && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {menuOpen && (
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
            )}
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <MoreHorizontal size={20} color="#7C3AED" />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 99, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.08)', minWidth: 200, overflow: 'hidden' }}>
                <button
                  onClick={() => { setMenuOpen(false); onDeleteProject(_id); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: F.jakarta, color: '#DC2626', textAlign: 'left' }}
                >
                  <Trash2 size={14} color="#DC2626" /> Delete Project
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onSuspendCreator(creator?._id); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF3C7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: F.jakarta, color: '#D97706', textAlign: 'left' }}
                >
                  <UserX size={14} color="#D97706" /> Suspend Creator
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/admin/dashboard/projects'); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: F.jakarta, color: '#7C3AED', textAlign: 'left' }}
                >
                  <ExternalLink size={14} color="#7C3AED" /> View on Admin Panel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Cover Image ── */}
      <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        {!imgError && coverImage ? (
          <img
            src={coverImage}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${categoryColor(category)}22, ${categoryColor(category)}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 48, color: categoryColor(category), opacity: 0.3, fontFamily: F.jakarta, fontWeight: 800 }}>
              {category}
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(transparent,rgba(0,0,0,0.85))',
        }} />
        {/* Project title in overlay */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 80,
          fontFamily: F.jakarta, fontSize: 20, fontWeight: 800,
          color: 'white', lineHeight: 1.3,
        }}>
          {title}
        </div>
        {/* Top-right badge: Equity / Funding */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          color: 'white', backdropFilter: 'blur(4px)',
          background: allowInvestment ? 'rgba(124,58,237,0.9)' : 'rgba(5,150,105,0.9)',
        }}>
          {allowInvestment ? 'Equity' : 'Funding'}
        </div>
        {/* HOT badge */}
        {progressPercent > 70 && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 700,
            padding: '4px 10px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Flame size={12} />
            HOT
          </div>
        )}
      </div>

      {/* ── Metrics Section ── */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F2F5' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1E21' }}>
              {formatCurrency(currentAmount)} raised
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>
              {progressPercent}%
            </span>
          </div>
          <div style={{ width: '100%', height: 7, background: '#E4E6EB', borderRadius: 4 }}>
            <div style={{
              width: `${progressPercent}%`, height: '100%',
              background: 'linear-gradient(90deg,#7C3AED,#A78BFF,#7C3AED)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
              borderRadius: 4,
            }} />
          </div>
        </div>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { value: formatCurrency(targetAmount), label: 'TARGET' },
            { value: allowInvestment && equityPercentage != null ? `${equityPercentage}%` : '—', label: 'EQUITY' },
            { value: daysLeft, label: 'DAYS LEFT' },
            { value: funders.length, label: 'BACKERS' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center', padding: '8px 4px', background: '#F5F3FF', borderRadius: 8, border: '1px solid #EDE9FE' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4C1D95' }}>{value}</div>
              <div style={{ fontSize: 10, color: '#7C3AED', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Media badges */}
        {(demoVideoUrl || businessPlan) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {demoVideoUrl && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, background: '#FEE2E2', color: '#DC2626', fontFamily: F.jakarta, fontSize: 11, fontWeight: 700 }}>
                <Play size={10} color="#DC2626" /> Demo Video
              </span>
            )}
            {businessPlan && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, background: '#EDE9FE', color: '#7C3AED', fontFamily: F.jakarta, fontSize: 11, fontWeight: 700 }}>
                <FileText size={10} color="#7C3AED" /> Business Plan
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #F0F2F5' }}>
        {/* Like */}
        <button
          onClick={() => onLike(_id, isLiked, likes)}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F2F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: 13, fontWeight: 600,
            color: isLiked ? '#E02424' : '#65676B', fontFamily: F.dm,
          }}
        >
          <Heart size={18} fill={isLiked ? '#E02424' : 'none'} color={isLiked ? '#E02424' : '#65676B'} />
          {likes}
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(v => !v)}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F2F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: 13, fontWeight: 600,
            color: '#65676B', fontFamily: F.dm,
          }}
        >
          <MessageCircle size={18} color="#65676B" />
          {localCommentCount}
        </button>

        {/* Save */}
        <button
          onClick={() => onSave(_id, isSaved)}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F2F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: 13, fontWeight: 600,
            color: isSaved ? '#7C3AED' : '#65676B', fontFamily: F.dm,
          }}
        >
          <Bookmark size={18} fill={isSaved ? '#7C3AED' : 'none'} color={isSaved ? '#7C3AED' : '#65676B'} />
        </button>

        {/* Share */}
        <button
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F2F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: 13, fontWeight: 600,
            color: '#65676B', fontFamily: F.dm,
          }}
        >
          <Share2 size={18} color="#65676B" />
        </button>

        <div style={{ flex: 1 }} />

        {/* CTA */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isInvestor && allowInvestment && (
            <button
              onClick={onInvest}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              style={{
                background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white',
                padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer', fontFamily: F.jakarta,
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              }}
            >
              Invest Now
            </button>
          )}
          {isBacker && allowFunding && (
            <button
              onClick={onFund}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              style={{
                background: 'linear-gradient(135deg,#059669,#047857)', color: 'white',
                padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer', fontFamily: F.jakarta,
                boxShadow: '0 4px 20px rgba(5,150,105,0.4)',
              }}
            >
              Fund Project
            </button>
          )}
          <Link
            to={`/project/${_id}`}
            style={{
              padding: '8px 16px', borderRadius: 10,
              background: 'transparent', border: '1px solid rgba(124,58,237,0.3)',
              color: '#7C3AED', cursor: 'pointer', fontFamily: F.jakarta,
              fontWeight: 600, fontSize: 12, textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            View Details
          </Link>
        </div>
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div style={{ padding: '0 16px 14px' }}>
          <CommentSection projectId={_id} onCommentAdded={() => setLocalCommentCount(c => c + 1)} />
        </div>
      )}
    </div>
  );
});
ProjectCard.displayName = 'ProjectCard';

// ─── Main CentralFeed Component ────────────────────────────────────────────────
const CentralFeed = () => {
  const user = useAuthStore((state) => state.user);
  const permissions = useRolePermissions();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [fundModalProject, setFundModalProject] = useState(null);
  const [investModalProject, setInvestModalProject] = useState(null);
  const [filters, setFilters] = useState({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');

  const loadingRef = useRef(false);
  const observerRef = useRef(null);
  const lastProjectRef = useRef(null);

  // ── Fetch projects ──
  const fetchProjects = useCallback(async (pageNum = 1, append = false) => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(!append);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '5',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await axios.get(`/publicProject?${params}`);
      const data = response.data;
      const raw = data.projects || data || [];
      const newProjects = raw.map(p => ({
        ...p,
        isLiked: p.likes?.some(l => l.user === user?._id) || false,
        likes: p.likesCount != null ? p.likesCount : (Array.isArray(p.likes) ? p.likes.length : 0),
        commentsCount: p.commentsCount || p.comments?.length || 0,
      }));

      if (append) {
        setProjects(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          return [...prev, ...newProjects.filter(p => !existingIds.has(p._id))];
        });
      } else {
        setProjects(newProjects);
      }

      setHasMore(data.hasMore !== false && newProjects.length === 5);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [filters, searchQuery, user?._id]);

  useEffect(() => {
    fetchProjects(1, false);
  }, [fetchProjects]);

  // ── Infinite scroll ──
  useEffect(() => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        fetchProjects(page + 1, true);
      }
    }, { threshold: 0.5 });

    if (lastProjectRef.current) observerRef.current.observe(lastProjectRef.current);

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [fetchProjects, loading, hasMore, page]);

  // ── Like handler ──
  const handleLike = async (projectId, isLiked, currentLikes) => {
    try {
      setProjects(prev => prev.map(p =>
        p._id === projectId
          ? { ...p, isLiked: !isLiked, likes: !isLiked ? currentLikes + 1 : currentLikes - 1 }
          : p
      ));
      await axios.post(`/publicProject/${projectId}/like`);
    } catch (err) {
      console.error('Error liking project:', err);
      fetchProjects(1, false);
    }
  };

  // ── Delete project (admin only) ──
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project from the platform?')) return;
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch {
      alert('Failed to delete project.');
    }
  };

  // ── Suspend creator (admin only) ──
  const handleSuspendCreator = async (creatorId) => {
    if (!creatorId) return;
    if (!window.confirm('Suspend this user?')) return;
    try {
      await suspendUser(creatorId);
      alert('User suspended successfully.');
    } catch {
      alert('Failed to suspend user.');
    }
  };

  // ── Save handler ──
  const handleSave = async (projectId, isSaved) => {
    try {
      setProjects(prev => prev.map(p =>
        p._id === projectId ? { ...p, isSaved: !isSaved } : p
      ));
      await axios.post(`/publicProject/${projectId}/save`);
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  // ── Role badge ──
  const getRoleBadge = () => {
    if (permissions.isAdmin) return { bg: '#7C3AED', label: 'Admin' };
    if (permissions.isInvestor) return { bg: '#D97706', label: 'Investor' };
    if (permissions.isBacker) return { bg: '#059669', label: 'Backer' };
    return { bg: '#2563EB', label: 'Creator' };
  };
  const roleBadge = getRoleBadge();

  // ── Dashboard link ──
  const getDashboardPath = () => {
    if (permissions.isAdmin) return '/admin/dashboard';
    if (permissions.isInvestor) return '/investor/dashboard';
    if (permissions.isBacker) return '/backer/dashboard';
    return '/creator/dashboard';
  };

  // ── User initials ──
  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase()
    : (user?.name?.[0] || 'U').toUpperCase();
  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || 'User';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', fontFamily: F.dm }}>

      {/* ══ FIXED TOPBAR ══════════════════════════════════════════════════════ */}
      <div style={{
        height: 56, background: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', height: 56,
        }}>
          {/* Left: logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: F.jakarta, fontWeight: 700, fontSize: 18,
            }}>
              G
            </div>
            <span style={{ fontFamily: F.jakarta, fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '0.5px' }}>
              GENESIS
            </span>
          </div>

          {/* Center: search */}
          <div style={{ flex: 1, maxWidth: 480, margin: '0 24px', position: 'relative' }}>
            <Search
              size={16}
              color="rgba(124,58,237,0.6)"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'white', border: 'none', borderRadius: 100,
                padding: '9px 18px 9px 40px', fontSize: 14, fontFamily: F.dm,
                outline: 'none', color: '#0D0621',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            />
          </div>

          {/* Right: bell + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell size={18} color="white" />
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: F.jakarta, overflow: 'hidden',
            }}>
              {user?.profileImage
                ? <img src={user.profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : userInitials}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 3-COLUMN LAYOUT ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', gap: 24,
        padding: '24px 20px', paddingTop: 80,
      }}>

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div style={{
          width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
          gap: 16, position: 'sticky', top: 80, alignSelf: 'flex-start',
        }}>
          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 16px rgba(124,58,237,0.1)', overflow: 'hidden' }}>
            {/* Cover strip */}
            <div style={{
              height: 64, borderRadius: '8px 8px 0 0',
              background: 'linear-gradient(135deg,#7C3AED,#4C1D95,#A78BFF)',
              margin: '-16px -16px 0 -16px',
            }} />
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7C3AED,#A78BFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 18, fontWeight: 700, fontFamily: F.jakarta,
              marginTop: -26, border: '3px solid white', position: 'relative', zIndex: 1,
              overflow: 'hidden',
            }}>
              {user?.profileImage
                ? <img src={user.profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : userInitials}
            </div>
            {/* Name */}
            <div style={{ fontFamily: F.jakarta, fontSize: 15, fontWeight: 700, color: '#0D0621', marginTop: 8 }}>
              {userName}
            </div>
            {/* Role badge */}
            <div style={{
              display: 'inline-block', background: '#EDE9FE', color: '#7C3AED',
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
              marginTop: 4,
            }}>
              {roleBadge.label}
            </div>
            {/* Divider */}
            <div style={{ height: 1, background: '#E4E6EB', margin: '12px 0' }} />
            {/* Dashboard link */}
            <button
              onClick={() => navigate(getDashboardPath())}
              onMouseEnter={e => { e.currentTarget.style.background = '#F0F2F5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, background: 'transparent',
                border: 'none', cursor: 'pointer', color: '#1C1E21',
                fontSize: 13, fontWeight: 500, fontFamily: F.dm, boxSizing: 'border-box',
              }}
            >
              <LayoutDashboard size={18} color="#7C3AED" />
              My Dashboard
            </button>
          </div>

          {/* Platform stats card */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 16px rgba(124,58,237,0.08)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0D0621', marginBottom: 12, fontFamily: F.jakarta, borderLeft: '3px solid #7C3AED', paddingLeft: 10 }}>
              Platform Stats
            </div>
            {[
              { label: 'Projects Live', value: '24' },
              { label: 'Total Raised', value: '1.4B FCFA' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F2F5' }}>
                <span style={{ fontSize: 13, color: '#1C1E21' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Trending categories card */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 16px rgba(124,58,237,0.08)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0D0621', marginBottom: 12, fontFamily: F.jakarta, borderLeft: '3px solid #7C3AED', paddingLeft: 10 }}>
              Trending
            </div>
            {[
              { name: 'FinTech', count: '12' },
              { name: 'AgriTech', count: '8' },
              { name: 'HealthTech', count: '6' },
              { name: 'EdTech', count: '5' },
              { name: 'CleanEnergy', count: '3' },
            ].map(({ name, count }) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #F0F2F5', fontSize: 13, color: '#1C1E21',
              }}>
                <span>{name}</span>
                <span style={{ background: '#EDE9FE', color: '#7C3AED', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER COLUMN ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stories row */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 16px rgba(124,58,237,0.08)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0D0621', marginBottom: 12, fontFamily: F.jakarta, borderLeft: '3px solid #7C3AED', paddingLeft: 10 }}>
              Projects
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {/* Explore card */}
              <div
                onClick={() => navigate('/project')}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                style={{
                  width: 120, height: 180, borderRadius: 16, flexShrink: 0,
                  background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <Plus size={28} color="white" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'white', marginTop: 8, fontFamily: F.jakarta }}>
                  Explore
                </span>
              </div>
              {/* Project story cards */}
              {projects.slice(0, 6).map(p => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/project/${p._id}`)}
                  style={{ width: 120, height: 180, borderRadius: 16, overflow: 'hidden', position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                >
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${categoryColor(p.category)}44,${categoryColor(p.category)}88)` }} />
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
                    background: 'linear-gradient(transparent,rgba(124,58,237,0.85))',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 8, left: 8, right: 8,
                    fontSize: 11, fontWeight: 600, color: 'white', lineHeight: 1.3,
                  }}>
                    {p.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter bar */}
          <div style={{
            background: 'white', borderRadius: 12, padding: '12px 16px',
            boxShadow: '0 2px 16px rgba(124,58,237,0.08)', display: 'flex', gap: 8,
          }}>
            {[
              { key: 'all', label: 'All Projects' },
              { key: 'investment', label: 'Investment' },
              { key: 'funding', label: 'Crowdfunding' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilters({ type: key })}
                style={{
                  padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', fontFamily: F.dm,
                  background: filters.type === key ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : '#F0F2F5',
                  color: filters.type === key ? 'white' : '#65676B',
                  boxShadow: filters.type === key ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && projects.length === 0 && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Error state */}
          {error && !loading && (
            <div style={{
              background: 'white', borderRadius: 12, padding: 48,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, color: '#DC2626', marginBottom: 12, fontFamily: F.jakarta, fontWeight: 700 }}>
                {error}
              </div>
              <button
                onClick={() => fetchProjects(1, false)}
                style={{
                  padding: '10px 24px', background: '#7C3AED', color: 'white',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontWeight: 600, fontFamily: F.dm,
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <div style={{
              background: 'white', borderRadius: 12, padding: 48,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)', textAlign: 'center',
            }}>
              <Search size={48} color="#65676B" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1E21', fontFamily: F.jakarta, marginBottom: 6 }}>
                No projects found
              </div>
              <div style={{ fontSize: 14, color: '#65676B' }}>Try adjusting your filters or search</div>
            </div>
          )}

          {/* Project cards */}
          {projects.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              permissions={permissions}
              onLike={handleLike}
              onSave={handleSave}
              onFund={() => setFundModalProject(project)}
              onInvest={() => setInvestModalProject(project)}
              isAdmin={permissions.isAdmin}
              onDeleteProject={handleDeleteProject}
              onSuspendCreator={handleSuspendCreator}
              ref={index === projects.length - 1 ? lastProjectRef : null}
            />
          ))}

          {/* Load more spinner */}
          {loading && projects.length > 0 && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#65676B', fontSize: 13 }}>
                <div style={{
                  width: 20, height: 20, border: '2px solid #E4E6EB',
                  borderTopColor: '#7C3AED', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Loading more...
              </div>
            </div>
          )}

          {/* End message */}
          {!hasMore && projects.length > 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#65676B', fontSize: 14 }}>
              You've seen all {projects.length} projects.
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────────────── */}
        <div style={{
          width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column',
          gap: 16, position: 'sticky', top: 80, alignSelf: 'flex-start',
        }}>
          {/* Suggested Projects */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 16px rgba(124,58,237,0.08)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0621', marginBottom: 14, fontFamily: F.jakarta, borderLeft: '3px solid #7C3AED', paddingLeft: 10 }}>
              Suggested Projects
            </div>
            {projects.slice(0, 3).map((p, i) => (
              <div
                key={p._id}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  paddingBottom: 12, marginBottom: 12,
                  borderBottom: i < 2 ? '1px solid #F0F2F5' : 'none',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${categoryColor(p.category)}44,${categoryColor(p.category)}88)` }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1E21', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#65676B', marginTop: 2 }}>
                    {formatCurrency(p.targetAmount || 0)} goal
                  </div>
                </div>
              </div>
            ))}
            <Link
              to="/feed"
              style={{
                fontSize: 13, color: '#7C3AED', fontWeight: 600,
                textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 4,
              }}
            >
              See more
            </Link>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 16px rgba(124,58,237,0.08)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0621', marginBottom: 14, fontFamily: F.jakarta, borderLeft: '3px solid #7C3AED', paddingLeft: 10 }}>
              Recent Activity
            </div>
            {[
              {
                icon: <TrendingUp size={14} color="white" />,
                iconBg: '#059669',
                text: 'New investment deal closed in AgriTech sector',
                time: '2h ago',
              },
              {
                icon: <UserPlus size={14} color="white" />,
                iconBg: '#7C3AED',
                text: '3 new investors joined this week',
                time: '5h ago',
              },
              {
                icon: <DollarSign size={14} color="white" />,
                iconBg: '#D97706',
                text: '27M FCFA raised for HealthTech project',
                time: '1d ago',
              },
              {
                icon: <Award size={14} color="white" />,
                iconBg: '#2563EB',
                text: 'Genesis reached 100 active projects!',
                time: '2d ago',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 3 ? 12 : 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: item.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#1C1E21', lineHeight: 1.4 }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: '#65676B', marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MODALS ════════════════════════════════════════════════════════════ */}
      {fundModalProject && (
        <FundModal project={fundModalProject} onClose={() => setFundModalProject(null)} />
      )}
      {investModalProject && (
        <InvestModal project={investModalProject} onClose={() => setInvestModalProject(null)} />
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CentralFeed;
