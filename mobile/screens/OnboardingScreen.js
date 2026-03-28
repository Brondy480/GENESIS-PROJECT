import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const roles = [
    { id: 'creator', label: 'Creator (Student/Researcher)' },
    { id: 'backer', label: 'Backer (General Public)' },
    { id: 'investor', label: 'Investor' },
];

export default function OnboardingScreen({ navigation }) {
    const [selectedRole, setSelectedRole] = useState(null);

    return (
        <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
                Welcome to GENESIS
            </Text>
            <Text style={{ fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
                Select your role to get started:
            </Text>
            {roles.map(role => (
                <TouchableOpacity
                    key={role.id}
                    onPress={() => setSelectedRole(role.id)}
                    style={{
                        padding: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: selectedRole === role.id ? '#9333EA' : '#E5E7EB',
                        backgroundColor: selectedRole === role.id ? '#F3E8FF' : '#F9FAFB',
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ fontSize: 16, color: selectedRole === role.id ? '#9333EA' : '#374151', fontWeight: '500' }}>{role.label}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity
                disabled={!selectedRole}
                onPress={() => navigation.replace('MainTabs')}
                style={{
                    marginTop: 32,
                    backgroundColor: selectedRole ? '#9333EA' : '#E5E7EB',
                    padding: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', marginTop: 24 }}>
                <Text style={{ color: '#2563EB' }}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: '#2563EB' }}>Sign Up</Text>
            </TouchableOpacity>
            <Text style={{ marginTop: 32, textAlign: 'center', color: '#6B7280' }}>
                (Signup/Login with email/social coming soon)
            </Text>
        </View>
    );
} 