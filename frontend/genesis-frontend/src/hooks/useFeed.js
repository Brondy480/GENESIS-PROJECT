import { useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';

const useFeed = (options = {}) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        category: options.category || null,
        type: options.type || 'all', // 'all', 'funding', 'investment'
        sort: options.sort || 'trending', // 'trending', 'newest', 'ending_soon'
        search: '',
    });

    // Fetch projects from API
    const fetchProjects = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '10',
                ...(filters.category && { category: filters.category }),
                ...(filters.type !== 'all' && { type: filters.type }),
                ...(filters.sort && { sort: filters.sort }),
                ...(filters.search && { search: filters.search }),
            });

            const response = await axios.get(`/publicProject?${params}`);
            const data = response.data;

            const newProjects = data.projects || data || [];

            if (append) {
                setProjects((prev) => {
                    // Prevent duplicates
                    const existingIds = new Set(prev.map((p) => p._id));
                    const uniqueNew = newProjects.filter((p) => !existingIds.has(p._id));
                    return [...prev, ...uniqueNew];
                });
            } else {
                setProjects(newProjects);
            }

            setHasMore(data.hasMore !== false && newProjects.length === 10);
            setPage(pageNum);
        } catch (err) {
            console.error('Error fetching feed:', err);
            setError(err.response?.data?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Initial fetch
    useEffect(() => {
        fetchProjects(1, false);
    }, [filters]);

    // Load more (pagination)
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchProjects(page + 1, true);
        }
    }, [loading, hasMore, page, fetchProjects]);

    // Refresh feed
    const refresh = useCallback(() => {
        setPage(1);
        fetchProjects(1, false);
    }, [fetchProjects]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    // Like a project
    const likeProject = useCallback(async (projectId) => {
        try {
            await axios.post(`/publicProject/${projectId}/like`);

            setProjects((prev) =>
                prev.map((p) =>
                    p._id === projectId
                        ? {
                            ...p,
                            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                            isLiked: !p.isLiked,
                        }
                        : p
                )
            );
        } catch (err) {
            console.error('Error liking project:', err);
        }
    }, []);

    // Save a project
    const saveProject = useCallback(async (projectId) => {
        try {
            await axios.post(`/publicProject/${projectId}/save`);

            setProjects((prev) =>
                prev.map((p) =>
                    p._id === projectId
                        ? { ...p, isSaved: !p.isSaved }
                        : p
                )
            );
        } catch (err) {
            console.error('Error saving project:', err);
        }
    }, []);

    // Get comments for a project
    const getComments = useCallback(async (projectId) => {
        try {
            const response = await axios.get(`/publicProject/${projectId}/comments`);
            return response.data.comments || response.data || [];
        } catch (err) {
            console.error('Error fetching comments:', err);
            return [];
        }
    }, []);

    // Add a comment
    const addComment = useCallback(async (projectId, text) => {
        try {
            const response = await axios.post(`/publicProject/${projectId}/comments`, { text });

            setProjects((prev) =>
                prev.map((p) =>
                    p._id === projectId
                        ? {
                            ...p,
                            comments: [response.data, ...(p.comments || [])],
                            commentsCount: (p.commentsCount || 0) + 1,
                        }
                        : p
                )
            );
            return response.data;
        } catch (err) {
            console.error('Error adding comment:', err);
            throw err;
        }
    }, []);

    return {
        projects,
        loading,
        error,
        hasMore,
        filters,
        page,
        loadMore,
        refresh,
        updateFilters,
        likeProject,
        saveProject,
        getComments,
        addComment,
    };
};

export default useFeed;
