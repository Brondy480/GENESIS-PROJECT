import { createContext } from 'react';

export const UserContext = createContext({ userRole: null, setUserRole: () => { } });
export const ProjectsContext = createContext({
    projects: [],
    setProjects: () => { },
    validateProject: () => { },
    addProject: () => { },
    notifications: [],
    addNotification: () => { },
    setNotifications: () => { },
}); 