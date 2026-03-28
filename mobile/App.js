import React, { useState, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';
import CreateProjectScreen from './screens/CreateProjectScreen';
import ActivityScreen from './screens/ActivityScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import InvestorScreen from './screens/InvestorScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import { UserContext, ProjectsContext } from './contexts';

const initialProjects = [
    {
        id: 1,
        title: 'AI-Powered Cancer Detection Research',
        creator: 'Dr. Sarah Chen',
        university: 'Stanford University',
        category: 'Medical Research',
        goal: 50000,
        raised: 32500,
        backers: 127,
        daysLeft: 18,
        verified: true,
        image: require('./assets/AI.jpg'),
        status: 'validated'
    },
    {
        id: 2,
        title: 'Sustainable Energy Storage Solutions',
        creator: 'Prof. Michael Rodriguez',
        university: 'MIT',
        category: 'Clean Tech',
        goal: 75000,
        raised: 45200,
        backers: 89,
        daysLeft: 25,
        verified: true,
        image: require('./assets/energy1.jpg'),
        status: 'validated'
    },
    {
        id: 3,
        title: 'Ocean Plastic Cleanup Innovation',
        creator: 'Dr. Emma Thompson',
        university: 'UC Berkeley',
        category: 'Environmental',
        goal: 40000,
        raised: 28750,
        backers: 156,
        daysLeft: 12,
        verified: true,
        image: require('./assets/energy2.jpg'),
        status: 'validated'
    }
];

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
    const { userRole } = useContext(UserContext);
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'home';
                    if (route.name === 'Home') iconName = 'home';
                    if (route.name === 'Investor') iconName = 'briefcase';
                    if (route.name === 'Create') iconName = 'plus';
                    if (route.name === 'Activity') iconName = 'bell';
                    if (route.name === 'Profile') iconName = 'user';
                    if (route.name === 'Admin') iconName = 'shield';
                    return <FontAwesome name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#9333EA',
                tabBarInactiveTintColor: '#6B7280',
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            {userRole === 'investor' && <Tab.Screen name="Investor" component={InvestorScreen} />}
            {userRole === 'creator' && <Tab.Screen name="Create" component={CreateProjectScreen} />}
            {userRole === 'admin' && <Tab.Screen name="Admin" component={AdminDashboardScreen} />}
            <Tab.Screen name="Activity" component={ActivityScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    const [userRole, setUserRole] = useState(null);
    const [projects, setProjects] = useState(initialProjects);
    const [notifications, setNotifications] = useState([]);

    // Add a new project as pending
    const addProject = (project) => {
        setProjects(prev => [...prev, { ...project, id: Date.now(), status: 'pending' }]);
    };
    // Validate a project and notify creator
    const validateProject = (id) => {
        setProjects(prev => prev.map(p => {
            if (p.id === id) {
                // Add notification for creator
                setNotifications(prev => [...prev, {
                    to: p.creator,
                    type: 'validation',
                    text: `Your project "${p.title}" has been approved!`,
                    projectId: p.id,
                    timestamp: Date.now(),
                }]);
                return { ...p, status: 'validated' };
            }
            return p;
        }));
    };
    // Add a notification
    const addNotification = (notif) => {
        setNotifications(prev => [...prev, notif]);
    };

    return (
        <UserContext.Provider value={{ userRole, setUserRole }}>
            <ProjectsContext.Provider value={{ projects, setProjects, validateProject, addProject, notifications, addNotification, setNotifications }}>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Login">
                            {props => <LoginScreen {...props} setUserRole={setUserRole} />}
                        </Stack.Screen>
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ProjectsContext.Provider>
        </UserContext.Provider>
    );
} 