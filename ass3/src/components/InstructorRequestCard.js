import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function InstructorRequestCard({ item, onApprove, onReject, onPressProof }) {
    const isPending = item.status === 'pending';

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return { color: '#22C55E', borderColor: '#22C55E', text: 'ĐÃ DUYỆT' };
            case 'rejected': return { color: '#F97316', borderColor: '#F97316', text: 'TỪ CHỐI' }; 
            default: return { color: '#8B5CF6', borderColor: '#8B5CF6', text: 'CHỜ DUYỆT' };
        }
    };

    const statusStyle = getStatusStyle(item.status);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.studentName}>{item.studentName}</Text>
                    <Text style={styles.studentId}>{item.studentId}</Text>
                </View>

                {isPending && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => onApprove(item._id)}>
                            <Text style={styles.btnTextWhite}>Duyệt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => onReject(item._id)}>
                            <Text style={styles.btnTextWhite}>Từ chối</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>

            <View style={styles.divider} />

            <Text style={styles.label}>Ngày: <Text style={styles.value}>{item.date}</Text></Text>
            {item.className && <Text style={styles.label}>Lớp: <Text style={styles.value}>{item.className}</Text></Text>}
            <Text style={styles.label}>Lý do: <Text style={styles.value}>{item.reason}</Text></Text>

            <View style={styles.proofRow}>
                <Text style={styles.label}>Minh chứng: </Text>
                <TouchableOpacity onPress={() => onPressProof(item.proofImage)}>
                    <Text style={styles.linkText}>Chi tiết</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footerCenter}>
                <View style={[styles.statusBadge, { borderColor: statusStyle.borderColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    studentId: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    btnApprove: {
        backgroundColor: '#22C55E', // Green
    },
    btnReject: {
        backgroundColor: '#F97316', // Orange
    },
    btnTextWhite: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusTag: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: '#999',
        marginBottom: 5,
        fontFamily: 'Roboto',
    },
    value: {
        color: '#666',
    },
    proofRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    linkText: {
        color: '#666',
        textDecorationLine: 'underline',
        fontStyle: 'italic',
    },
    footerCenter: {
        alignItems: 'center',
        marginTop: 5,
    },
    statusBadge: {
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 20,
        minWidth: 120,
        alignItems: 'center',
    },
    statusText: {
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'uppercase',
    }
});
