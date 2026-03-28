import React, { useState, useContext } from 'react';
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProjectsContext } from '../contexts';
import * as ImagePicker from 'expo-image-picker';

const fundingAmounts = [5, 10, 25, 50, 100, 250];

const categories = [
    { name: 'Medical', icon: 'heartbeat', image: 'https://images.unsplash.com/photo-1519494080410-f9aa8f52f1e1?auto=format&fit=crop&w=64&q=80' },
    { name: 'Tech', icon: 'microchip', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=64&q=80' },
    { name: 'Energy', icon: 'bolt', image: require('../assets/energy1.jpg') },
    { name: 'Bio', icon: 'dna', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=64&q=80' },
    { name: 'Space', icon: 'rocket', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=64&q=80' },
    { name: 'Climate', icon: 'leaf', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=64&q=80' }
];

export default function HomeScreen(props) {
    const navigation = useNavigation();
    const route = useRoute();
    const { projects } = useContext(ProjectsContext);
    const userRole = route.params?.userRole || 'backer';
    const [activeTab, setActiveTab] = useState('home');
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [fundingProject, setFundingProject] = useState(null);

    // Only show validated projects
    const validatedProjects = projects.filter(p => p.status === 'validated');

    const handleFund = (project) => {
        setFundingProject(project);
        setShowFundingModal(true);
        setSelectedAmount(25);
    };

    const ProjectCard = ({ project }) => (
        <View style={{ backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden', marginBottom: 16 }}>
            <View style={{ position: 'relative' }}>
                <Image
                    source={
                        typeof project.image === 'string'
                            ? { uri: project.image }
                            : project.image
                    }
                    style={{ width: '100%', height: 192 }}
                    resizeMode="cover"
                />
                <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#374151' }}>{project.category}</Text>
                </View>
                {project.verified && (
                    <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#F3E8FF', borderRadius: 999, padding: 6 }}>
                        <FontAwesome name="check-circle" size={16} color="#9333EA" />
                    </View>
                )}
            </View>
            <View style={{ padding: 16 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#111827', marginBottom: 8 }}>{project.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 32, height: 32, backgroundColor: '#E5E7EB', borderRadius: 16, marginRight: 12 }} />
                    <View>
                        <Text style={{ fontWeight: '500', fontSize: 14, color: '#111827' }}>{project.creator}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{project.university}</Text>
                    </View>
                </View>
                <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>${project.raised.toLocaleString()} raised</Text>
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>{Math.round((project.raised / project.goal) * 100)}%</Text>
                    </View>
                    <View style={{ width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
                        <View style={{ width: `${Math.min((project.raised / project.goal) * 100, 100)}%`, height: 8, backgroundColor: '#9333EA', borderRadius: 4 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{project.backers} backers</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{project.daysLeft} days left</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleFund(project)} style={{ backgroundColor: '#9333EA', paddingVertical: 12, borderRadius: 8, marginTop: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '500', textAlign: 'center' }}>Fund This Project</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Role-based welcome message
    let welcomeTitle = 'Fund the Future of Research';
    let welcomeDesc = 'Support groundbreaking academic projects from top universities worldwide';
    if (userRole === 'creator') {
        welcomeTitle = 'Welcome, Creator!';
        welcomeDesc = 'Publish your research project and connect with backers and investors.';
    } else if (userRole === 'investor') {
        welcomeTitle = 'Discover High-Potential Projects';
        welcomeDesc = 'Swipe through and invest in the next big breakthrough.';
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            {/* Navigation Bar */}
            <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>GENESIS</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={{ padding: 8, borderRadius: 8, marginRight: 8 }}>
                        <FontAwesome name="search" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ padding: 8, borderRadius: 8 }}>
                        <FontAwesome name="bell" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
                {/* Hero Section */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 24, backgroundColor: '#9333EA' }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 6 }}>{welcomeTitle}</Text>
                    <Text style={{ color: '#DBEAFE', fontSize: 14 }}>{welcomeDesc}</Text>
                </View>
                {/* Categories */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Explore Categories</Text>
                    <FlatList
                        data={categories}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, idx) => idx.toString()}
                        renderItem={({ item }) => (
                            <View style={{ alignItems: 'center', marginRight: 16 }}>
                                <View style={{ width: 48, height: 48, borderRadius: 16, overflow: 'hidden', marginBottom: 6 }}>
                                    <Image
                                        source={
                                            typeof item.image === 'string'
                                                ? { uri: item.image }
                                                : item.image
                                        }
                                        style={{ width: 48, height: 48 }}
                                    />
                                </View>
                                <Text style={{ fontSize: 12, color: '#374151', fontWeight: '500' }} numberOfLines={1}>{item.name}</Text>
                            </View>
                        )}
                    />
                </View>
                {/* Featured Projects */}
                <View style={{ paddingHorizontal: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Featured Projects</Text>
                        <TouchableOpacity>
                            <Text style={{ color: '#2563EB', fontSize: 14, fontWeight: '500' }}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {validatedProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </View>
                {/* Trending Section */}
                <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Trending This Week</Text>
                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 48, height: 48, backgroundColor: '#D1FAE5', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <FontAwesome name="line-chart" size={24} color="#16A34A" />
                            </View>
                            <View>
                                <Text style={{ fontWeight: '500', color: '#111827' }}>Quantum Computing Research</Text>
                                <Text style={{ fontSize: 13, color: '#6B7280' }}>+127% funding this week</Text>
                            </View>
                        </View>
                        <FontAwesome name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                </View>
            </ScrollView>
            {/* Funding Modal */}
            <Modal
                visible={showFundingModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowFundingModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Fund This Project</Text>
                            <TouchableOpacity onPress={() => setShowFundingModal(false)}>
                                <FontAwesome name="close" size={22} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontWeight: '500', marginBottom: 12 }}>Choose Amount</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                            {fundingAmounts.map(amount => (
                                <TouchableOpacity
                                    key={amount}
                                    onPress={() => setSelectedAmount(amount)}
                                    style={{
                                        padding: 12,
                                        borderRadius: 8,
                                        borderWidth: 2,
                                        borderColor: selectedAmount === amount ? '#9333EA' : '#E5E7EB',
                                        backgroundColor: selectedAmount === amount ? '#F3E8FF' : '#F9FAFB',
                                        marginRight: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text style={{ color: selectedAmount === amount ? '#9333EA' : '#374151', fontWeight: '500' }}>${amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ position: 'relative', marginBottom: 20 }}>
                            <Text style={{ position: 'absolute', left: 12, top: 18, color: '#6B7280' }}>$</Text>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Custom amount"
                                style={{
                                    width: '100%',
                                    paddingLeft: 28,
                                    paddingRight: 12,
                                    paddingVertical: 12,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 8,
                                    fontSize: 15,
                                }}
                                value={selectedAmount ? selectedAmount.toString() : ''}
                                onChangeText={val => setSelectedAmount(Number(val))}
                            />
                        </View>
                        <View style={{ backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: '#6B7280' }}>Your contribution</Text>
                                <Text style={{ fontWeight: '500' }}>${selectedAmount || 0}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: '#6B7280' }}>Platform fee (3%)</Text>
                                <Text>${((selectedAmount || 0) * 0.03).toFixed(2)}</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 6 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontWeight: '500' }}>Total</Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>${((selectedAmount || 0) * 1.03).toFixed(2)}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            disabled={!selectedAmount}
                            style={{
                                backgroundColor: selectedAmount ? '#9333EA' : '#E5E7EB',
                                padding: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                                opacity: selectedAmount ? 1 : 0.5,
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Complete Funding</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
} 