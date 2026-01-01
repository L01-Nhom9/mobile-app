import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from './Button';

export default function CreateClassModal({ visible, onClose }) {
    const [className, setClassName] = useState('');
    const [classCode, setClassCode] = useState('');

    const handleCreate = () => {
        if (!className.trim() || !classCode.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        Alert.alert('Thành công', `Đã tạo lớp ${className} (${classCode})`);

        setClassName('');
        setClassCode('');
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.label}>Tên lớp học</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Text input"
                        value={className}
                        onChangeText={setClassName}
                        placeholderTextColor="#ccc"
                    />

                    <Text style={styles.label}>Mã lớp học</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Text input"
                        value={classCode}
                        onChangeText={setClassCode}
                        placeholderTextColor="#ccc"
                    />

                    <View style={styles.buttonContainer}>
                        <GradientButton
                            title="Tạo lớp mới"
                            onPress={handleCreate}
                            style={styles.createBtn}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        marginTop: 10,
        fontFamily: 'Roboto',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
        color: '#333',
        fontFamily: 'Roboto',
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    createBtn: {
        width: '60%',
    }
});
