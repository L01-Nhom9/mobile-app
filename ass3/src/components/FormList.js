import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const FormList = ({ data }) => {

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return { color: '#C084FC', borderColor: '#C084FC', bg: '#F3E8FF' }; // Purple
            case 'approved': return { color: '#4ADE80', borderColor: '#4ADE80', bg: '#DCFCE7' }; // Green
            case 'rejected': return { color: '#F87171', borderColor: '#F87171', bg: '#FEE2E2' }; // Red
            default: return { color: '#999', borderColor: '#999', bg: '#eee' };
        }
    };

    const getStatusText = (status) => {
        switch (status) {
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
                <Text style={styles.className}>{item.className}</Text>
                <Text style={styles.classCode}>{item.code}</Text>
                <View style={styles.divider} />

                <Text style={styles.infoLine}><Text style={styles.label}>Ngày:</Text> {item.date}</Text>
                <Text style={styles.infoLine}><Text style={styles.label}>Lý do:</Text> {item.reason}</Text>
                <Text style={[styles.infoLine, { textDecorationLine: 'underline', color: '#666' }]}>
                    Minh chứng: Chi tiết
                </Text>

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
    }
});

export default FormList;
