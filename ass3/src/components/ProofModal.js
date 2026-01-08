import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from './Button';
import { API_URL } from '../config';

export default function ProofModal({ visible, onClose, requestId, accessToken, studentName, date, reason, status }) {
    
    const imageUrl = `${API_URL}/leave-request/evidence/${requestId}`;
    
    // Construct source object for Image component
    const imageSource = {
        uri: imageUrl,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const getStatusStyle = (s) => {
        switch (s) {
            case 'approved': return { color: '#22C55E', borderColor: '#22C55E', text: 'ĐÃ DUYỆT' };
            case 'rejected': return { color: '#F97316', borderColor: '#F97316', text: 'TỪ CHỐI' };
            default: return { color: '#8B5CF6', borderColor: '#8B5CF6', text: 'CHỜ DUYỆT' };
        }
    };

    const statusStyle = getStatusStyle(status);
    const isPending = status === 'pending';

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

                    {/* Header Info */}
                    <View style={styles.header}>
                        <Text style={styles.studentName}>{studentName}</Text>

                        {isPending && (
                            <View style={styles.headerButtons}>
                                <TouchableOpacity style={[styles.btn, styles.btnApprove]}><Text style={styles.btnText}>Duyệt</Text></TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.btnReject]}><Text style={styles.btnText}>Từ chối</Text></TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Ngày: <Text style={styles.value}>{date}</Text></Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Lý do: <Text style={styles.value}>{reason}</Text></Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Minh chứng:</Text>
                    </View>

                    {/* Image Area */}
                    <View style={styles.imageContainer}>
                         <TouchableOpacity onPress={() => setIsFullScreen(true)}>
                             <Image 
                                source={imageSource} 
                                style={styles.image} 
                                resizeMode="contain"
                                onError={(e) => console.log('Image Load Error', e.nativeEvent.error)}
                             />
                         </TouchableOpacity>
                    </View>

                    {/* Bottom Status Button */}
                    {!isPending && (
                        <View style={styles.bottomStatus}>
                            <TouchableOpacity style={[styles.statusBadge, { borderColor: statusStyle.borderColor }]}>
                                <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* Full Screen Image Modal */}
            <Modal
                visible={isFullScreen}
                transparent={true}
                onRequestClose={() => setIsFullScreen(false)}
            >
                <View style={styles.fullScreenContainer}>
                    <TouchableOpacity style={styles.closeFullScreenButton} onPress={() => setIsFullScreen(false)}>
                         <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                    <Image
                        source={imageSource}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
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
        padding: 20,
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
    header: {
        marginBottom: 10,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    studentId: {
        color: '#999',
        marginBottom: 10,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
        position: 'absolute',
        right: 30, 
        top: 0,
    },
    btn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    btnApprove: { backgroundColor: '#22C55E' },
    btnReject: { backgroundColor: '#F97316' },
    btnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    infoRow: {
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        color: '#999',
    },
    value: {
        fontWeight: 'normal',
        color: '#333',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        textDecorationLine: 'underline',
        color: '#666',
    },
    bottomStatus: {
        alignItems: 'center',
        marginTop: 10,
    },
    statusBadge: {
        borderWidth: 1,
        borderColor: '#22C55E',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 30,
    },
    statusText: {
        color: '#22C55E', // Green text for approved
        fontWeight: 'bold',
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    closeFullScreenButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    }
});
