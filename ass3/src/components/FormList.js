import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const FormList = ({ data, onPressProof, onWithdraw }) => {

    const getStatusColor = (status) => {
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'pending': return { color: '#F59E0B', borderColor: '#F59E0B', bg: '#FEF3C7' }; 
            case 'approved': return { color: '#10B981', borderColor: '#10B981', bg: '#D1FAE5' };
            case 'rejected': return { color: '#EF4444', borderColor: '#EF4444', bg: '#FEE2E2' };
            default: return { color: '#999', borderColor: '#999', bg: '#eee' };
        }
    };

    const getStatusText = (status) => {
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'pending': return 'CHỜ DUYỆT';
            case 'approved': return 'ĐÃ DUYỆT';
            case 'rejected': return 'TỪ CHỐI';
            default: return status;
        }
    };

    const renderItem = ({ item }) => {
        const style = getStatusColor(item.status);
        return (
            <View style={styles.card}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View>
                        <Text style={styles.className}>{item.className}</Text>
                        <Text style={styles.classCode}>{item.code}</Text>
                    </View>
                </View>
                <View style={styles.divider} />

                <Text style={styles.infoLine}><Text style={styles.label}>Ngày:</Text> {item.date}</Text>
                <Text style={styles.infoLine}><Text style={styles.label}>Lý do:</Text> {item.reason}</Text>
                
                <View style={{flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
                   <Text style={[styles.label, {marginRight: 5}]}>Minh chứng:</Text>
                   <Text 
                        style={[styles.infoLine, { textDecorationLine: 'underline', color: '#3B82F6' }]}
                        onPress={() => onPressProof && onPressProof(item)}
                   >
                        Chạm vào để xem minh chứng
                    </Text>
                </View>

                {(item.status === 'PENDING' || item.status === 'pending') && (
                    <TouchableOpacity 
                        style={styles.withdrawButton}
                        onPress={() => onWithdraw && onWithdraw(item._id)}
                    >
                        <Text style={styles.withdrawText}>Thu hồi</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { borderColor: style.borderColor, backgroundColor: style.bg }]}>
                        <Text style={[styles.statusText, { color: style.borderColor }]}>{getStatusText(item.status)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    className: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'Roboto',
    },
    classCode: {
        fontSize: 14,
        color: '#999',
        marginBottom: 10,
        fontFamily: 'Roboto',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    infoLine: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        fontFamily: 'Roboto',
    },
    label: {
        color: '#999',
    },
    statusContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        textTransform: 'uppercase',
    },
    withdrawButton: {
        marginTop: 10,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    withdrawText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: 'bold',
    }
});

export default FormList;
