import { useState, useCallback, useEffect, useRef } from 'react';
import useFeed from '../../hooks/useFeed';
import useRolePermissions from '../../hooks/useRolePermissions';
import ProjectCard from './ProjectCard';
import FundModal from './FundModal';
import InvestModal from './InvestModal';

const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const ProjectFeed = ({ showFilters = true, emptyMessage = 'No projects found' }) => {
    useRolePermissions();
    const {
        projects,
        loading,
        error,
        hasMore,
        filters,
        loadMore,
        refresh,
        updateFilters,
        likeProject,
        saveProject,
    } = useFeed();

    // Modal state
    const [fundModalProject, setFundModalProject] = useState(null);
    const [investModalProject, setInvestModalProject] = useState(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const searchTimeout = useRef(null);

    // Handle search with debounce
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            updateFilters({ search: query });
        }, 500);
    }, [updateFilters]);

    // Handle infinite scroll
    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 500 &&
            hasMore &&
            !loading
        ) {
            loadMore();
        }
    }, [hasMore, loading, loadMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Action handlers
    const handleLike = async (projectId) => {
        await likeProject(projectId);
    };

    const handleSave = async (projectId) => {
        await saveProject(projectId);
    };

    const handleFund = (projectId) => {
        const project = projects.find(p => p._id === projectId);
        setFundModalProject(project);
    };

    const handleInvest = (projectId) => {
        const project = projects.find(p => p._id === projectId);
        setInvestModalProject(project);
    };

    // Filter options
    const sortOptions = [
        { value: 'trending', label: '🔥 Trending' },
        { value: 'newest', label: '✨ Newest' },
        { value: 'ending_soon', label: '⏰ Ending Soon' },
    ];

    const typeOptions = [
        { value: 'all', label: '🌐 All' },
        { value: 'funding', label: '🎯 Funding' },
        { value: 'investment', label: '💰 Investment' },
    ];

    const categoryOptions = [
        { value: null, label: 'All' },
        { value: 'Technology', label: '💻 Tech' },
        { value: 'Environment', label: '🌱 Eco' },
        { value: 'Health', label: '🏥 Health' },
        { value: 'Education', label: '📚 Edu' },
        { value: 'Creative', label: '🎨 Creative' },
    ];

    return (
        <div style={{ width: '100%' }}>
            {/* Filter Bar */}
            {showFilters && (
                <div style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(124, 58, 237, 0.08)'
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                        <span style={{
                            position: 'absolute',
                            left: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'rgba(13, 6, 33, 0.4)'
                        }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search projects..."
                            style={{
                                width: '100%',
                                paddingLeft: 44,
                                paddingRight: 14,
                                paddingTop: 12,
                                paddingBottom: 12,
                                border: '1.5px solid rgba(124, 58, 237, 0.1)',
                                borderRadius: 12,
                                fontSize: 14,
                                fontFamily: F.dm,
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(124, 58, 237, 0.1)'}
                        />
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {/* Sort Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'rgba(13, 6, 33, 0.5)', fontFamily: F.dm }}>Sort:</span>
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateFilters({ sort: option.value })}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 100,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        fontFamily: F.jakarta,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: filters.sort === option.value ? '#7C3AED' : '#F3F4F6',
                                        color: filters.sort === option.value ? 'white' : '#4B5563',
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* Type Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'rgba(13, 6, 33, 0.5)', fontFamily: F.dm }}>Type:</span>
                            {typeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateFilters({ type: option.value })}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 100,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        fontFamily: F.jakarta,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: filters.type === option.value ? '#4F46E5' : '#F3F4F6',
                                        color: filters.type === option.value ? 'white' : '#4B5563',
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* Category Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'rgba(13, 6, 33, 0.5)', fontFamily: F.dm }}>Category:</span>
                            {categoryOptions.map((option) => (
                                <button
                                    key={option.value || 'all'}
                                    onClick={() => updateFilters({ category: option.value })}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 100,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        fontFamily: F.jakarta,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: filters.category === option.value ? '#059669' : '#F3F4F6',
                                        color: filters.category === option.value ? 'white' : '#4B5563',
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && projects.length === 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 24
                }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                            background: 'white',
                            borderRadius: 16,
                            overflow: 'hidden',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div style={{
                                height: 192,
                                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s infinite'
                            }} />
                            <div style={{ padding: 20 }}>
                                <div style={{
                                    height: 16,
                                    background: '#f0f0f0',
                                    borderRadius: 8,
                                    width: '75%',
                                    marginBottom: 12
                                }} />
                                <div style={{
                                    height: 12,
                                    background: '#f0f0f0',
                                    borderRadius: 6,
                                    width: '100%',
                                    marginBottom: 8
                                }} />
                                <div style={{
                                    height: 12,
                                    background: '#f0f0f0',
                                    borderRadius: 6,
                                    width: '85%',
                                    marginBottom: 16
                                }} />
                                <div style={{
                                    height: 8,
                                    background: '#f0f0f0',
                                    borderRadius: 4,
                                    width: '100%',
                                    marginBottom: 16
                                }} />
                                <div style={{
                                    height: 40,
                                    background: '#f0f0f0',
                                    borderRadius: 12
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        margin: '0 auto 16px',
                        background: '#FEE2E2',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="32" height="32" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 style={{
                        fontFamily: F.jakarta,
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#0D0621',
                        marginBottom: 8
                    }}>
                        Something went wrong
                    </h3>
                    <p style={{
                        fontFamily: F.dm,
                        fontSize: 14,
                        color: '#6B7280',
                        marginBottom: 16
                    }}>
                        {error}
                    </p>
                    <button
                        onClick={refresh}
                        style={{
                            padding: '10px 24px',
                            background: '#7C3AED',
                            color: 'white',
                            borderRadius: 12,
                            fontFamily: F.jakarta,
                            fontWeight: 600,
                            fontSize: 14,
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        margin: '0 auto 16px',
                        background: '#EDE9FE',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="32" height="32" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 style={{
                        fontFamily: F.jakarta,
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#0D0621',
                        marginBottom: 8
                    }}>
                        {emptyMessage}
                    </h3>
                    <p style={{
                        fontFamily: F.dm,
                        fontSize: 14,
                        color: '#6B7280',
                        marginBottom: 16
                    }}>
                        Try adjusting your filters or check back later
                    </p>
                    <button
                        onClick={refresh}
                        style={{
                            padding: '10px 24px',
                            background: '#7C3AED',
                            color: 'white',
                            borderRadius: 12,
                            fontFamily: F.jakarta,
                            fontWeight: 600,
                            fontSize: 14,
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Refresh
                    </button>
                </div>
            )}

            {/* Project Grid */}
            {projects.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 24
                }}>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onLike={handleLike}
                            onSave={handleSave}
                            onFund={handleFund}
                            onInvest={handleInvest}
                        />
                    ))}
                </div>
            )}

            {/* Load More / Loading More */}
            {projects.length > 0 && (
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    {loading && hasMore && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#6B7280',
                            fontFamily: F.dm,
                            fontSize: 14
                        }}>
                            <div style={{
                                width: 20,
                                height: 20,
                                border: '2px solid rgba(124, 58, 237, 0.2)',
                                borderTopColor: '#7C3AED',
                                borderRadius: '50%',
                                animation: 'spin 0.7s linear infinite',
                                marginRight: 8
                            }} />
                            Loading more projects...
                        </div>
                    )}
                    {!hasMore && (
                        <p style={{
                            color: '#9CA3AF',
                            fontFamily: F.dm,
                            fontSize: 14
                        }}>
                            You've reached the end! 🎉
                        </p>
                    )}
                </div>
            )}

            {/* Fund Modal */}
            {fundModalProject && (
                <FundModal
                    project={fundModalProject}
                    onClose={() => setFundModalProject(null)}
                />
            )}

            {/* Invest Modal */}
            {investModalProject && (
                <InvestModal
                    project={investModalProject}
                    onClose={() => setInvestModalProject(null)}
                />
            )}

            {/* Add shimmer animation to global styles */}
            <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </div>
    );
};

export default ProjectFeed;
