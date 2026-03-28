import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, TextInput, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const fundingAmounts = [5, 10, 25, 50, 100, 250];

export default function ProjectDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { project } = route.params || {};
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(25);

    if (!project) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                <Text>No project data.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'white' }} contentContainerStyle={{ paddingBottom: 40 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ margin: 16 }}>
                <Text style={{ color: '#2563EB' }}>Back</Text>
            </TouchableOpacity>
            {/* Video pitch or placeholder image */}
            <View style={{ width: '100%', height: 200, backgroundColor: '#F3F4F6', marginBottom: 16 }}>
                {/* Replace with react-native-video for real video support */}
                <Image source={{ uri: project.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                {project.verified && (
                    <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#F3E8FF', borderRadius: 999, padding: 6 }}>
                        <FontAwesome name="check-circle" size={20} color="#9333EA" />
                    </View>
                )}
            </View>
            <View style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{project.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 32, height: 32, backgroundColor: '#E5E7EB', borderRadius: 16, marginRight: 10 }} />
                    <View>
                        <Text style={{ fontWeight: '500', color: '#111827' }}>{project.creator}</Text>
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>{project.university}</Text>
                    </View>
                </View>
                <Text style={{ color: '#6B7280', marginBottom: 16 }}>
                    {/* Placeholder description */}
                    This is a sample project description. Add more details about the research, goals, and impact here.
                </Text>
                {/* Funding stats */}
                <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ color: '#4B5563', fontWeight: '500' }}>${project.raised.toLocaleString()} raised</Text>
                        <Text style={{ color: '#6B7280' }}>{Math.round((project.raised / project.goal) * 100)}%</Text>
                    </View>
                    <View style={{ width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
                        <View style={{
                            width: `${Math.min((project.raised / project.goal) * 100, 100)}%`,
                            height: 8,
                            backgroundColor: '#9333EA',
                            borderRadius: 4,
                        }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>{project.backers} backers</Text>
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>{project.daysLeft} days left</Text>
                    </View>
                </View>
                {/* Trust signals */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <FontAwesome name="shield" size={16} color="#10B981" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#10B981', fontWeight: '500', fontSize: 13 }}>Funds held in escrow until milestones are met</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <FontAwesome name="info-circle" size={16} color="#6366F1" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#6366F1', fontSize: 13 }}>Platform fee: 3%</Text>
                </View>
                {/* Fund Now button */}
                <TouchableOpacity
                    onPress={() => setShowFundingModal(true)}
                    style={{ backgroundColor: '#9333EA', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 24 }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Fund Now</Text>
                </TouchableOpacity>
            </View>
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
        </ScrollView>
    );
} 