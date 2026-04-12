import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, FileText } from 'lucide-react';

const getEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};
import useRolePermissions from '../hooks/useRolePermissions';
import CommentSection from '../components/feed/CommentSection';
import AdminPanel from '../components/feed/AdminPanel';
import FundModal from '../components/feed/FundModal';
import InvestModal from '../components/feed/InvestModal';
import axios from '../api/axios';

const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const permissions = useRolePermissions();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localLiked, setLocalLiked] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);
    const [localSaved, setLocalSaved] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [showInvestModal, setShowInvestModal] = useState(false);

    // Fetch project details
    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`/publicProject/${id}`);
                const data = response.data;
                setProject(data.project || data);
                setLocalLiked(data.isLiked || false);
                setLocalLikes(data.likes || 0);
                setLocalSaved(data.isSaved || false);
            } catch (err) {
                console.error('Error fetching project:', err);
                setError(err.response?.data?.message || 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProject();
        }
    }, [id]);

    // Handle like
    const handleLike = async () => {
        try {
            setLocalLiked(!localLiked);
            setLocalLikes(prev => localLiked ? prev - 1 : prev + 1);
            await axios.post(`/publicProject/${id}/like`);
        } catch (err) {
            console.error('Error liking project:', err);
            setLocalLiked(localLiked);
            setLocalLikes(project?.likes || 0);
        }
    };

    // Handle save
    const handleSave = async () => {
        try {
            setLocalSaved(!localSaved);
            await axios.post(`/publicProject/${id}/save`);
        } catch (err) {
            console.error('Error saving project:', err);
            setLocalSaved(localSaved);
        }
    };

    // Format currency
    const formatCurrency = (amount) => `${(amount || 0).toLocaleString()} FCFA`;

    // Calculate progress
    const progressPercent = project?.targetAmount > 0
        ? Math.min(Math.round(((project.currentAmount || 0) / project.targetAmount) * 100), 100)
        : 0;

    // Compute derived fields from backend model
    const backers = project?.funders?.length || 0;
    const fundingLabel = project?.allowInvestment && project?.allowFunding
        ? 'Hybrid'
        : project?.allowInvestment
        ? 'Investment'
        : 'Funding';
    const daysLeft = project?.deadline
        ? Math.max(0, Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
        : 30;

    // Get role badge style
    const getRoleBadgeStyle = () => {
        if (permissions.isAdmin) return { background: '#7C3AED', color: 'white' };
        if (permissions.isInvestor) return { background: '#D97706', color: 'white' };
        if (permissions.isBacker) return { background: '#3B82F6', color: 'white' };
        return { background: '#10B981', color: 'white' };
    };

    const handleViewBusinessPlan = async () => {
        try {
            const response = await axios.get(`/project/${project._id}/business-plan`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (err) {
            console.error('Business plan error:', err);
            alert('Failed to load business plan. Please try again.');
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#F0F2F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #DADDE1',
                    borderTopColor: '#7C3AED',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#F0F2F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    background: 'white',
                    padding: 32,
                    borderRadius: 12,
                    textAlign: 'center',
                    maxWidth: 400,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <AlertCircle size={48} color="#DC2626" />
                    </div>
                    <h2 style={{ fontFamily: F.jakarta, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                        {error}
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '10px 24px',
                            background: '#7C3AED',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 600,
                            marginTop: 16,
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F0F2F5',
            fontFamily: F.dm,
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #DADDE1',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{
                    maxWidth: 900,
                    margin: '0 auto',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#F0F2F5',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <svg width="20" height="20" fill="none" stroke="#050505" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 style={{
                        fontFamily: F.jakarta,
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#050505',
                        margin: 0,
                        flex: 1,
                    }}>
                        Project Details
                    </h1>
                    <div style={{
                        padding: '4px 12px',
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 700,
                        ...getRoleBadgeStyle(),
                    }}>
                        {permissions.role?.toUpperCase() || 'USER'}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                maxWidth: 900,
                margin: '0 auto',
                padding: '24px',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                    {/* Left Column - Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Cover Image */}
                        <div style={{
                            background: 'white',
                            borderRadius: 12,
                            overflow: 'hidden',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}>
                            <img
                                src={project.coverImage || 'https://via.placeholder.com/800x400?text=No+Image'}
                                alt={project.title}
                                style={{
                                    width: '100%',
                                    height: 350,
                                    objectFit: 'cover',
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                                }}
                            />
                        </div>

                        {/* Project Info */}
                        <div style={{
                            background: 'white',
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}>
                            {/* Badges */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <span style={{
                                    padding: '4px 12px',
                                    background: '#F0F2F5',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#050505',
                                }}>
                                    {project.category}
                                </span>
                                <span style={{
                                    padding: '4px 12px',
                                    background: project.allowInvestment ? '#FEF3C7' : '#E7F3FF',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: project.allowInvestment ? '#D97706' : '#1877F2',
                                }}>
                                    {fundingLabel}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 style={{
                                fontFamily: F.jakarta,
                                fontSize: 28,
                                fontWeight: 800,
                                color: '#050505',
                                marginBottom: 12,
                                lineHeight: 1.2,
                            }}>
                                {project.title}
                            </h1>

                            {/* Creator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #7C3AED, #A78BFF)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 18,
                                    fontWeight: 700,
                                }}>
                                    {project.creator?.firstName?.[0] || project.creator?.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p style={{
                                        fontFamily: F.jakarta,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: '#050505',
                                        margin: 0,
                                    }}>
                                        {project.creator?.firstName && project.creator?.lastName
                                            ? `${project.creator.firstName} ${project.creator.lastName}`
                                            : project.creator?.name || 'Unknown Creator'}
                                    </p>
                                    <p style={{
                                        fontSize: 13,
                                        color: '#65676B',
                                        margin: 0,
                                    }}>
                                        {project.creator?.title || project.creator?.role || 'Project Creator'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{
                                    fontFamily: F.jakarta,
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: '#050505',
                                    marginBottom: 12,
                                }}>
                                    About this project
                                </h3>
                                <p style={{
                                    fontSize: 15,
                                    color: '#1C1E21',
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {project.description}
                                </p>
                            </div>

                            {/* Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 16,
                                padding: 20,
                                background: '#F0F2F5',
                                borderRadius: 12,
                                marginBottom: 20,
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED', margin: 0 }}>
                                        {backers}
                                    </p>
                                    <p style={{ fontSize: 12, color: '#65676B', margin: '4px 0 0 0' }}>Backers</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED', margin: 0 }}>
                                        {daysLeft}
                                    </p>
                                    <p style={{ fontSize: 12, color: '#65676B', margin: '4px 0 0 0' }}>Days Left</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED', margin: 0 }}>
                                        {progressPercent}%
                                    </p>
                                    <p style={{ fontSize: 12, color: '#65676B', margin: '4px 0 0 0' }}>Funded</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    onClick={handleLike}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: 8,
                                        border: localLiked ? 'none' : '1px solid #DADDE1',
                                        background: localLiked ? '#FCE8E8' : 'white',
                                        color: localLiked ? '#E02424' : '#050505',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <svg width="20" height="20" fill={localLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {localLikes}
                                </button>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: 8,
                                        border: localSaved ? 'none' : '1px solid #DADDE1',
                                        background: localSaved ? '#FFF3CD' : 'white',
                                        color: localSaved ? '#F59E0B' : '#050505',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <svg width="20" height="20" fill={localSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    {localSaved ? 'Saved' : 'Save'}
                                </button>
                                <button
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: '#F0F2F5',
                                        color: '#050505',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Comments */}
                        <div style={{
                            background: 'white',
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}>
                            <h3 style={{
                                fontFamily: F.jakarta,
                                fontSize: 18,
                                fontWeight: 700,
                                color: '#050505',
                                marginBottom: 20,
                            }}>
                                Comments
                            </h3>
                            <CommentSection projectId={id} />
                        </div>

                        {/* Admin Panel */}
                        {permissions.isAdmin && project.approvalStatus !== 'approved' && (
                            <div style={{
                                background: 'white',
                                borderRadius: 12,
                                padding: 24,
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            }}>
                                <h3 style={{
                                    fontFamily: F.jakarta,
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#050505',
                                    marginBottom: 20,
                                }}>
                                    Admin Actions
                                </h3>
                                <AdminPanel project={project} />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Funding Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            position: 'sticky',
                            top: 80,
                        }}>
                            {/* Progress */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                }}>
                                    <span style={{
                                        fontFamily: F.jakarta,
                                        fontSize: 28,
                                        fontWeight: 800,
                                        color: '#7C3AED',
                                    }}>
                                        {formatCurrency(project.currentAmount || 0)}
                                    </span>
                                    <span style={{
                                        fontSize: 14,
                                        color: '#65676B',
                                        alignSelf: 'flex-end',
                                    }}>
                                        raised
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: 8,
                                    background: '#E4E6EB',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                }}>
                                    <div
                                        style={{
                                            width: `${progressPercent}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #7C3AED, #6D28D9)',
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: 8,
                                    fontSize: 13,
                                    color: '#65676B',
                                }}>
                                    <span>{progressPercent}% of {formatCurrency(project.targetAmount || 0)}</span>
                                    <span>{daysLeft} days to go</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {permissions.isBacker && project.allowFunding && (
                                <button
                                    onClick={() => setShowFundModal(true)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 24px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        marginBottom: 16,
                                    }}
                                >
                                    Back This Project
                                </button>
                            )}

                            {permissions.isInvestor && project.allowInvestment && (
                                <button
                                    onClick={() => setShowInvestModal(true)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 24px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #D97706, #B45309)',
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        marginBottom: 16,
                                    }}
                                >
                                    Invest Now
                                </button>
                            )}

                            {permissions.isCreator && (
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '14px 24px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'not-allowed',
                                        opacity: 0.6,
                                        marginBottom: 16,
                                    }}
                                    disabled
                                >
                                    View Only (Creator)
                                </button>
                            )}

                            {permissions.isAdmin && (
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '14px 24px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        marginBottom: 16,
                                    }}
                                >
                                    Admin View
                                </button>
                            )}

                            {/* Project Details */}
                            <div style={{
                                paddingTop: 16,
                                borderTop: '1px solid #E4E6EB',
                            }}>
                                <h4 style={{
                                    fontFamily: F.jakarta,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: '#050505',
                                    marginBottom: 12,
                                }}>
                                    Project Details
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#65676B', fontSize: 13 }}>Funding Type</span>
                                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                                            {project.allowInvestment && project.allowFunding
                                                ? 'Hybrid'
                                                : project.allowInvestment ? 'Investment' : 'Reward-based'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#65676B', fontSize: 13 }}>Goal</span>
                                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                                            {formatCurrency(project.targetAmount || 0)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#65676B', fontSize: 13 }}>Backers</span>
                                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                                            {backers}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#65676B', fontSize: 13 }}>Days Left</span>
                                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                                            {daysLeft}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#65676B', fontSize: 13 }}>Category</span>
                                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                                            {project.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demo Video */}
                        {project.demoVideoUrl && getEmbedUrl(project.demoVideoUrl) && (
                            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ fontFamily: F.jakarta, fontSize: 16, fontWeight: 700, color: '#0D0621', marginBottom: 12 }}>
                                    Demo Video
                                </h3>
                                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.1)' }}>
                                    <iframe
                                        width="100%"
                                        height="200"
                                        src={getEmbedUrl(project.demoVideoUrl)}
                                        title="Project Demo"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ display: 'block', border: 'none' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Business Plan — hidden from backers */}
                        {project.businessPlan && !permissions.isBacker && (
                            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ fontFamily: F.jakarta, fontSize: 16, fontWeight: 700, color: '#0D0621', marginBottom: 12 }}>
                                    Business Plan
                                </h3>
                                <button
                                    onClick={handleViewBusinessPlan}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', border: 'none', cursor: 'pointer', color: 'white', fontFamily: F.jakarta, fontWeight: 700, fontSize: 13, width: '100%' }}
                                >
                                    <FileText size={16} color="white" />
                                    View Business Plan PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFundModal && (
                <FundModal
                    project={project}
                    onClose={() => setShowFundModal(false)}
                />
            )}

            {showInvestModal && (
                <InvestModal
                    project={project}
                    onClose={() => setShowInvestModal(false)}
                />
            )}

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default ProjectDetail;
