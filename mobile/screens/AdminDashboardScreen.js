import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ProjectsContext } from '../contexts';

export default function AdminDashboardScreen() {
    const { projects, validateProject } = useContext(ProjectsContext);
    const pending = projects.filter(p => p.status === 'pending');

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Pending Projects</Text>
            {pending.length === 0 && (
                <Text style={{ color: '#6B7280', fontSize: 16 }}>No pending projects.</Text>
            )}
            {pending.map(project => (
                <View key={project.id} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{project.title}</Text>
                    <Text style={{ color: '#6B7280', marginBottom: 8 }}>{project.creator} • {project.university}</Text>
                    <Text style={{ color: '#9333EA', fontWeight: '500', marginBottom: 8 }}>{project.category}</Text>
                    <TouchableOpacity onPress={() => validateProject(project.id)} style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Validate</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
} 