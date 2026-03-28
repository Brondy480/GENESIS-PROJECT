import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const roles = [
    { id: 'creator', label: 'Creator (Student/Researcher)' },
    { id: 'backer', label: 'Backer (General Public)' },
    { id: 'investor', label: 'Investor' },
    { id: 'admin', label: 'Admin' },
];

export default function LoginScreen({ navigation, route, setUserRole }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(null);

    useEffect(() => {
        if (route?.params) {
            setEmail(route.params.email || '');
            setPassword(route.params.password || '');
            setRole(route.params.role || null);
        }
    }, [route?.params]);

    const handleLogin = () => {
        if (!email || !password || !role) {
            alert('Please enter email, password, and select a role.');
            return;
        }
        if (setUserRole) setUserRole(role);
        navigation.replace('MainTabs');
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>Login</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 16 }}
            />
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 16 }}
            />
            <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Select Role</Text>
            {roles.map(r => (
                <TouchableOpacity
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    style={{
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: role === r.id ? '#9333EA' : '#E5E7EB',
                        backgroundColor: role === r.id ? '#F3E8FF' : '#F9FAFB',
                        marginBottom: 8,
                    }}
                >
                    <Text style={{ color: role === r.id ? '#9333EA' : '#374151', fontWeight: '500' }}>{r.label}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#9333EA', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16, marginBottom: 16 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace('Signup')} style={{ alignItems: 'center' }}>
                <Text style={{ color: '#2563EB' }}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    );
} 