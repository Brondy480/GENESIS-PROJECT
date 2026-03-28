import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';

const projects = [
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
        image: 'https://readdy.ai/api/search-image?query=Modern%20medical%20research%20laboratory%20with%20advanced%20AI%20computer%20systems%20and%20cancer%20detection%20equipment%2C%20clean%20white%20background%2C%20professional%20lighting%2C%20high-tech%20medical%20devices%2C%20microscopes%20and%20monitors%20displaying%20data%20analysis%2C%20scientific%20atmosphere%2C%20photorealistic%20style%2C%20centered%20composition&width=300&height=200&seq=proj1&orientation=landscape'
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
        image: 'https://readdy.ai/api/search-image?query=Advanced%20battery%20technology%20and%20renewable%20energy%20storage%20systems%20in%20modern%20laboratory%2C%20solar%20panels%20and%20energy%20storage%20units%2C%20clean%20white%20background%2C%20professional%20scientific%20equipment%2C%20green%20technology%20focus%2C%20photorealistic%20style%2C%20centered%20composition&width=300&height=200&seq=proj2&orientation=landscape'
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
        image: 'https://readdy.ai/api/search-image?query=Ocean%20cleanup%20technology%20and%20marine%20research%20equipment%2C%20underwater%20robotics%20and%20plastic%20collection%20systems%2C%20clean%20laboratory%20environment%2C%20white%20background%2C%20environmental%20science%20tools%2C%20blue%20and%20white%20color%20scheme%2C%20photorealistic%20style%2C%20centered%20composition&width=300&height=200&seq=proj3&orientation=landscape'
    }
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function InvestorScreen() {
    const [index, setIndex] = useState(0);
    const [shortlist, setShortlist] = useState([]);

    const handleSwipe = (direction) => {
        if (direction === 'right') {
            setShortlist([...shortlist, projects[index]]);
        }
        if (index < projects.length - 1) {
            setIndex(index + 1);
        }
    };

    const project = projects[index];

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Investor Swipe</Text>
            {project ? (
                <View style={{ width: SCREEN_WIDTH - 48, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' }}>
                    <Image source={{ uri: project.image }} style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 12 }} resizeMode="cover" />
                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#111827', marginBottom: 4 }}>{project.title}</Text>
                    <Text style={{ color: '#6B7280', marginBottom: 8 }}>{project.creator} • {project.university}</Text>
                    <Text style={{ color: '#9333EA', fontWeight: '500', marginBottom: 8 }}>{project.category}</Text>
                    <Text style={{ color: '#4B5563', marginBottom: 8 }}>${project.raised.toLocaleString()} raised of ${project.goal.toLocaleString()}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <TouchableOpacity onPress={() => handleSwipe('left')} style={{ backgroundColor: '#E5E7EB', padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' }}>
                            <Text style={{ color: '#374151', fontWeight: 'bold' }}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSwipe('right')} style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Shortlist</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, color: '#6B7280', marginBottom: 16 }}>No more projects to review.</Text>
                    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Shortlisted Projects:</Text>
                    {shortlist.length === 0 && <Text style={{ color: '#6B7280' }}>None yet.</Text>}
                    {shortlist.map((proj, i) => (
                        <Text key={proj.id} style={{ color: '#9333EA', marginBottom: 4 }}>{i + 1}. {proj.title}</Text>
                    ))}
                </View>
            )}
            {/* Placeholder for comparison dashboard */}
            <View style={{ marginTop: 32, width: '100%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Comparison Dashboard (Coming Soon)</Text>
                <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#6B7280' }}>Compare shortlisted projects here.</Text>
                </View>
            </View>
        </View>
    );
} 