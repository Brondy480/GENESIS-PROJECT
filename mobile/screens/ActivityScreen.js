import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { ProjectsContext, UserContext } from '../contexts';

export default function ActivityScreen() {
    const [tab, setTab] = useState('Notifications');
    const { notifications } = useContext(ProjectsContext);
    const { userRole } = useContext(UserContext);

    // For demo, creators are named 'You' in CreateProjectScreen
    const userName = userRole === 'creator' ? 'You' : null;
    const userNotifications = userName
        ? notifications.filter(n => n.to === userName)
        : [];

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                {['Notifications', 'Updates', 'Messages'].map(t => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setTab(t)}
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 24,
                            borderRadius: 20,
                            backgroundColor: tab === t ? '#9333EA' : '#E5E7EB',
                            marginHorizontal: 4,
                        }}
                    >
                        <Text style={{ color: tab === t ? 'white' : '#374151', fontWeight: 'bold' }}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                {tab === 'Notifications' && (
                    <>
                        {userRole === 'creator' && userNotifications.length > 0 && (
                            <FlatList
                                data={userNotifications}
                                keyExtractor={(_, idx) => idx.toString()}
                                renderItem={({ item }) => (
                                    <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' }}>
                                        <Text style={{ color: '#374151' }}>{item.text}</Text>
                                    </View>
                                )}
                            />
                        )}
                        {userRole === 'creator' && userNotifications.length === 0 && (
                            <Text style={{ color: '#6B7280', fontSize: 16 }}>No notifications yet.</Text>
                        )}
                        {userRole !== 'creator' && (
                            <Text style={{ color: '#6B7280', fontSize: 16 }}>No notifications for your role.</Text>
                        )}
                    </>
                )}
                {tab === 'Updates' && (
                    <Text style={{ color: '#6B7280', fontSize: 16, marginTop: 32 }}>Project updates coming soon!</Text>
                )}
                {tab === 'Messages' && (
                    <View style={{ alignItems: 'center', marginTop: 32 }}>
                        <Text style={{ color: '#6B7280', fontSize: 16 }}>Messaging coming soon!</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
} 