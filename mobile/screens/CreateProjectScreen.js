import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ProjectsContext } from '../contexts';

const fundingAmounts = [5, 10, 25, 50, 100, 250];

const categories = [
    { name: 'Medical', icon: 'heartbeat', image: 'https://images.unsplash.com/photo-1519494080410-f9aa8f52f1e1?auto=format&fit=crop&w=64&q=80' },
    { name: 'Tech', icon: 'microchip', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=64&q=80' },
    { name: 'Energy', icon: 'bolt', image: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=64&q=80' },
    { name: 'Bio', icon: 'dna', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=64&q=80' },
    { name: 'Space', icon: 'rocket', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=64&q=80' },
    { name: 'Climate', icon: 'leaf', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=64&q=80' }
];

export default function CreateProjectScreen() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '',
        category: '',
        university: '',
        description: '',
        video: '',
        goal: '',
    });
    const [published, setPublished] = useState(false);
    const { addProject } = useContext(ProjectsContext);

    const handleChange = (key, value) => setForm({ ...form, [key]: value });
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handlePublish = () => {
        // Simple validation
        if (!form.title || !form.category || !form.university || !form.description || !form.goal) {
            Alert.alert('Please fill in all required fields.');
            return;
        }
        addProject({
            ...form,
            creator: 'You',
            university: form.university,
            category: form.category,
            goal: Number(form.goal),
            raised: 0,
            backers: 0,
            daysLeft: 30,
            verified: false,
            image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
        });
        setPublished(true);
    };

    if (published) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Project Submitted!</Text>
                <Text style={{ color: '#6B7280', fontSize: 16, textAlign: 'center' }}>
                    Your project is pending admin validation. You will be notified when it is approved.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'white' }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
            {/* Progress Indicator */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
                {[1, 2, 3, 4].map(s => (
                    <View key={s} style={{
                        width: 32, height: 8, borderRadius: 4, marginHorizontal: 4,
                        backgroundColor: step === s ? '#9333EA' : '#E5E7EB',
                    }} />
                ))}
            </View>
            {/* Step 1: Project Info */}
            {step === 1 && (
                <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Project Info</Text>
                    <Text style={{ marginBottom: 6 }}>Project Title *</Text>
                    <TextInput
                        value={form.title}
                        onChangeText={val => handleChange('title', val)}
                        placeholder="Enter project title"
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 16 }}
                    />
                    <Text style={{ marginBottom: 6 }}>Category *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.name}
                                onPress={() => handleChange('category', cat.name)}
                                style={{
                                    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8,
                                    backgroundColor: form.category === cat.name ? '#9333EA' : '#F3F4F6',
                                }}
                            >
                                <Text style={{ color: form.category === cat.name ? 'white' : '#6B7280', fontWeight: '500' }}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Text style={{ marginBottom: 6 }}>University / Institution *</Text>
                    <TextInput
                        value={form.university}
                        onChangeText={val => handleChange('university', val)}
                        placeholder="Enter university or institution"
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 24 }}
                    />
                    <TouchableOpacity
                        onPress={nextStep}
                        style={{ backgroundColor: '#9333EA', padding: 16, borderRadius: 8, alignItems: 'center' }}
                        disabled={!form.title || !form.category || !form.university}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Next</Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* Step 2: Description & Video */}
            {step === 2 && (
                <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Description & Video</Text>
                    <Text style={{ marginBottom: 6 }}>Project Description *</Text>
                    <TextInput
                        value={form.description}
                        onChangeText={val => handleChange('description', val)}
                        placeholder="Describe your project"
                        multiline
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 16, minHeight: 80 }}
                    />
                    <Text style={{ marginBottom: 6 }}>Video Pitch (YouTube URL)</Text>
                    <TextInput
                        value={form.video}
                        onChangeText={val => handleChange('video', val)}
                        placeholder="Paste YouTube video URL (optional)"
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 24 }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={prevStep} style={{ padding: 16, borderRadius: 8, backgroundColor: '#E5E7EB', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Text style={{ color: '#374151', fontWeight: 'bold' }}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={nextStep} style={{ padding: 16, borderRadius: 8, backgroundColor: '#9333EA', alignItems: 'center', flex: 1, marginLeft: 8 }} disabled={!form.description}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {/* Step 3: Funding Goal */}
            {step === 3 && (
                <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Funding Goal</Text>
                    <Text style={{ marginBottom: 6 }}>Goal Amount (USD) *</Text>
                    <TextInput
                        value={form.goal}
                        onChangeText={val => handleChange('goal', val.replace(/[^0-9]/g, ''))}
                        placeholder="Enter funding goal"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 24 }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={prevStep} style={{ padding: 16, borderRadius: 8, backgroundColor: '#E5E7EB', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Text style={{ color: '#374151', fontWeight: 'bold' }}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={nextStep} style={{ padding: 16, borderRadius: 8, backgroundColor: '#9333EA', alignItems: 'center', flex: 1, marginLeft: 8 }} disabled={!form.goal}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {/* Step 4: Review & Publish */}
            {step === 4 && (
                <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Review & Publish</Text>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Title:</Text>
                    <Text style={{ marginBottom: 8 }}>{form.title}</Text>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Category:</Text>
                    <Text style={{ marginBottom: 8 }}>{form.category}</Text>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>University:</Text>
                    <Text style={{ marginBottom: 8 }}>{form.university}</Text>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Description:</Text>
                    <Text style={{ marginBottom: 8 }}>{form.description}</Text>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Video URL:</Text>
                    <Text style={{ marginBottom: 8 }}>{form.video || 'N/A'}</Text>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Goal:</Text>
                    <Text style={{ marginBottom: 16 }}>${form.goal}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={prevStep} style={{ padding: 16, borderRadius: 8, backgroundColor: '#E5E7EB', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Text style={{ color: '#374151', fontWeight: 'bold' }}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePublish} style={{ padding: 16, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center', flex: 1, marginLeft: 8 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Publish Project</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
} 