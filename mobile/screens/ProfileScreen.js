import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { UserContext, ProjectsContext } from '../contexts';

export default function ProfileScreen() {
    const [darkMode, setDarkMode] = useState(false);
    const [textSize, setTextSize] = useState(16);
    const { setUserRole, userRole } = useContext(UserContext);
    const { setNotifications } = useContext(ProjectsContext);
    const navigation = useNavigation();

    // Profile state (simulate user info)
    const [profile, setProfile] = useState({
        name: 'Your Name',
        email: 'you@example.com',
        role: userRole || 'backer',
        photo: null,
    });
    const [editing, setEditing] = useState(false);
    const [editProfile, setEditProfile] = useState(profile);

    const handleLogout = () => {
        setUserRole(null);
        setNotifications([]);
        navigation.replace('Login');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.IMAGES,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setEditProfile({ ...editProfile, photo: result.assets[0].uri });
        }
    };

    const handleSave = () => {
        setProfile(editProfile);
        setEditing(false);
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: darkMode ? '#18181B' : 'white', padding: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: darkMode ? 'white' : '#111827', marginBottom: 24 }}>Profile</Text>
            <TouchableOpacity onPress={editing ? pickImage : undefined} style={{ marginBottom: 16 }}>
                <Image
                    source={profile.photo && !editing ? { uri: profile.photo } : editProfile.photo && editing ? { uri: editProfile.photo } : require('../assets/profile-placeholder.png')}
                    style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#E5E7EB' }}
                />
                {editing && <Text style={{ color: '#2563EB', textAlign: 'center', marginTop: 4 }}>Change Photo</Text>}
            </TouchableOpacity>
            {editing ? (
                <>
                    <TextInput
                        value={editProfile.name}
                        onChangeText={val => setEditProfile({ ...editProfile, name: val })}
                        placeholder="Name"
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12, color: darkMode ? 'white' : '#111827', width: 240 }}
                    />
                    <TextInput
                        value={editProfile.email}
                        onChangeText={val => setEditProfile({ ...editProfile, email: val })}
                        placeholder="Email"
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12, color: darkMode ? 'white' : '#111827', width: 240 }}
                    />
                    <Text style={{ color: darkMode ? 'white' : '#374151', marginBottom: 16 }}>Role: {editProfile.role}</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, marginRight: 8 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setEditing(false); setEditProfile(profile); }} style={{ backgroundColor: '#E5E7EB', padding: 12, borderRadius: 8 }}>
                            <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <Text style={{ color: darkMode ? 'white' : '#111827', fontSize: 18, marginBottom: 4 }}>{profile.name}</Text>
                    <Text style={{ color: darkMode ? 'white' : '#6B7280', fontSize: 16, marginBottom: 4 }}>{profile.email}</Text>
                    <Text style={{ color: darkMode ? 'white' : '#6B7280', fontSize: 16, marginBottom: 16 }}>Role: {profile.role}</Text>
                    <TouchableOpacity onPress={() => setEditing(true)} style={{ backgroundColor: '#9333EA', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Edit Profile</Text>
                    </TouchableOpacity>
                </>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ color: darkMode ? 'white' : '#374151', fontSize: 16, marginRight: 12 }}>Dark Mode</Text>
                <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ color: darkMode ? 'white' : '#374151', fontSize: 16, marginBottom: 8 }}>Text Size</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setTextSize(Math.max(12, textSize - 2))} style={{ backgroundColor: '#E5E7EB', padding: 8, borderRadius: 8, marginRight: 8 }}>
                        <Text style={{ fontSize: 18, color: '#374151' }}>A-</Text>
                    </TouchableOpacity>
                    <Text style={{ color: darkMode ? 'white' : '#374151', fontSize: textSize, marginHorizontal: 8 }}>{textSize}</Text>
                    <TouchableOpacity onPress={() => setTextSize(Math.min(28, textSize + 2))} style={{ backgroundColor: '#E5E7EB', padding: 8, borderRadius: 8, marginLeft: 8 }}>
                        <Text style={{ fontSize: 22, color: '#374151' }}>A+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={{ color: darkMode ? 'white' : '#374151', fontSize: textSize, marginBottom: 32 }}>This is a preview of your text size and mode.</Text>
            <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#EF4444', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
} 