import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/Button';
import { classroomService } from '../../services/classroomService';

export default function JoinClassScreen({ navigation }) {
    const [classId, setClassId] = useState('');

    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        if (!classId.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập ID lớp học');
            return;
        }

        setLoading(true);
        try {
            await classroomService.joinClass(classId.trim());
            Alert.alert('Thành công', `Đã tham gia lớp thành công!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
           console.log('Join Error:', error);
           let msg = 'Không thể tham gia lớp. Vui lòng kiểm tra lại mã.';
           if (error.response) {
               msg += `\nStatus: ${error.response.status}`;
               if (error.response.data && typeof error.response.data === 'object') {
                   msg += `\nMsg: ${JSON.stringify(error.response.data)}`;
               } else {
                   msg += `\nData: ${error.response.data}`;
               }
           } else {
               msg += `\nError: ${error.message}`;
           }
           Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>Tham gia lớp học</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <Ionicons name="close" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Mã tham gia</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mã lớp..."
                    value={classId}
                    onChangeText={setClassId}
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#93C5FD" />
                ) : (
                    <GradientButton
                        title="Tham gia"
                        onPress={handleJoin}
                        style={styles.submitContainer}
                    />
                )}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 25,
        width: '100%',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center', // Center title, absolute close btn
        width: '100%',
        marginBottom: 20,
        position: 'relative',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        color: '#000',
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        padding: 5,
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        fontFamily: 'Roboto',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        padding: 15,
        marginBottom: 25,
        fontSize: 16,
        fontFamily: 'Roboto',
    },
    submitContainer: {
        width: '50%',
    },
});
