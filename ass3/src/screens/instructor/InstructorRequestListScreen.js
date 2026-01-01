import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InstructorRequestCard from '../../components/InstructorRequestCard';
import ProofModal from '../../components/ProofModal';

const MOCK_ALL_REQUESTS = [
    { _id: '1', studentName: 'Nguyễn Văn A', studentId: '2211832', className: 'Quản lý dự án - CO3007', date: '22/11/2025', reason: 'Bị sốt', status: 'pending', proofImage: 'https://via.placeholder.com/300' },
    { _id: '2', studentName: 'Lê Thị B', studentId: '2211832', className: 'Mobile Dev - CO3007', date: '22/11/2025', reason: 'Việc gia đình', status: 'approved', proofImage: '' },
    { _id: '3', studentName: 'Nguyễn Văn A', studentId: '2211832', className: 'Quản lý dự án - CO3007', date: '22/11/2025', reason: 'Xe hư', status: 'rejected', proofImage: '' },
    { _id: '4', studentName: 'Trần C', studentId: '2211832', className: 'Mobile Dev - CO3007', date: '22/11/2025', reason: 'Đau bụng', status: 'pending', proofImage: '' },
];


export default function InstructorRequestListScreen({ navigation }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);

    const getFilteredData = () => {
        if (activeFilter === 'all') return MOCK_ALL_REQUESTS;
        return MOCK_ALL_REQUESTS.filter(r => r.status === activeFilter);
    };

    const handleApprove = (id) => { console.log('Approve', id); };
    const handleReject = (id) => { console.log('Reject', id); };

    const handleOpenProof = (item) => {
        setSelectedProof(item);
        setModalVisible(true);
    };

    const FilterChip = ({ label, value }) => (
        <TouchableOpacity
            style={[styles.chip, activeFilter === value && styles.chipActive]}
            onPress={() => setActiveFilter(value)}
        >
            <Text style={[styles.chipText, activeFilter === value && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Bộ lọc:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip label="Tất cả" value="all" />
                        <FilterChip label="Đã duyệt" value="approved" />
                        <FilterChip label="Chờ duyệt" value="pending" />
                        <FilterChip label="Từ chối" value="rejected" />
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={getFilteredData()}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <InstructorRequestCard
                        item={item}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onPressProof={() => handleOpenProof(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
            />

            {/* Modal */}
            {selectedProof && (
                <ProofModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    imageUrl={selectedProof.proofImage}
                    studentName={selectedProof.studentName}
                    date={selectedProof.date}
                    reason={selectedProof.reason}
                    status={selectedProof.status}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 50,
    },
    header: {
        marginBottom: 15,
    },
    backBtn: {
        marginBottom: 15,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterLabel: {
        fontWeight: 'bold',
        marginRight: 10,
        fontSize: 14,
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#E8F0FE',
        marginRight: 10,
    },
    chipActive: {
        backgroundColor: '#4285F4',
    },
    chipText: {
        color: '#4285F4',
        fontWeight: '600',
        fontSize: 12,
    },
    chipTextActive: {
        color: 'white',
    },
    listContent: {
        paddingBottom: 20,
    }
});
