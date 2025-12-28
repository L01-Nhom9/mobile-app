import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Image, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import mockApi from '../../services/mockApi';

const REASONS = ['Đau ốm', 'Chuyện gia đình', 'Phương tiện di chuyển', 'Khác'];
const SESSIONS = ['T2 28/11 7h00-9h50', 'T5 03/12 15h00-16h50'];

export default function RequestFormScreen({ route, navigation, user }) {
  const { classroom } = route.params;
  const [reason, setReason] = useState(null);
  const [session, setSession] = useState(null);
  const [proofImage, setProofImage] = useState(null);

  // Dropdown States
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [showSessionPicker, setShowSessionPicker] = useState(false);

  const handlePickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };
  
  const handleLaunchCamera = async () => {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera is required!");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
      });

      if (!result.canceled) {
          setProofImage(result.assets[0].uri);
      }
  }

  const showImageOptions = () => {
      Alert.alert(
          "Chọn minh chứng",
          "Chọn ảnh từ thư viện hoặc chụp ảnh mới",
          [
              { text: "Hủy", style: "cancel"},
              { text: "Thư viện", onPress: handlePickImage },
              { text: "Máy ảnh", onPress: handleLaunchCamera }
          ]
      );
  }

  const handleSubmit = async () => {
    if (!reason || !session) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn lý do và buổi nghỉ.');
        return;
    }

    try {
      await mockApi.requests.create({
        studentId: user._id,
        classroomId: classroom._id,
        reason,
        session, // Assuming date/time extraction happens on backend or this string is verified
        proofImage
      });
      // Use standard Alert or custom success modal. Using Alert for simplicity.
       Alert.alert('Thành công', 'Đã gửi đơn xin nghỉ!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đơn.');
    }
  };

  const RenderDropdown = ({ visible, options, onSelect, onClose }) => {
      return (
          <Modal visible={visible} transparent animationType="fade">
              <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
                  <View style={styles.dropdownContainer}>
                      {options.map((opt, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.dropdownItem} 
                            onPress={() => { onSelect(opt); onClose(); }}
                          >
                              <Text style={styles.dropdownText}>{opt}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>
              </TouchableOpacity>
          </Modal>
      );
  };

  return (
    <View style={styles.overlay}>
       <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 24 }} /> 
                <Text style={styles.title}>Đơn xin nghỉ học</Text>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                     <Ionicons name="close" size={20} color="#333" />
                 </TouchableOpacity>
            </View>
            <View style={styles.subHeader}>
                <Text style={styles.className}>{classroom.name}</Text>
                <Text style={styles.classCode}>{classroom.code}</Text>
            </View>

            {/* Inputs */}
            <View style={styles.row}>
                <TouchableOpacity style={styles.picker} onPress={() => setShowReasonPicker(true)}>
                    <Text style={[styles.pickerText, !reason && styles.placeholder]}>
                        {reason || 'Lý do xin nghỉ'}
                    </Text>
                     <Ionicons name="caret-down" size={16} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.picker} onPress={() => setShowSessionPicker(true)}>
                    <Text style={[styles.pickerText, !session && styles.placeholder]}>
                        {session ? (session.length > 15 ? session.substring(0, 12) + '...' : session ) : 'Buổi'}
                    </Text>
                     <Ionicons name="caret-down" size={16} color="#999" />
                </TouchableOpacity>
            </View>

             {/* Dropdowns */}
             <RenderDropdown 
                visible={showReasonPicker} 
                options={REASONS} 
                onSelect={setReason} 
                onClose={() => setShowReasonPicker(false)} 
            />
            <RenderDropdown 
                visible={showSessionPicker} 
                options={SESSIONS} 
                onSelect={setSession} 
                onClose={() => setShowSessionPicker(false)} 
            />


            {/* Proof Area */}
            <TouchableOpacity style={styles.proofArea} onPress={showImageOptions}>
                {proofImage ? (
                    <Image source={{ uri: proofImage }} style={styles.proofImage} resizeMode="cover" />
                ) : (
                    <View style={styles.proofPlaceholder}>
                         <Text style={styles.proofText}>Minh chứng</Text>
                         <Ionicons name="camera-outline" size={24} color="#666" />
                    </View>
                )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} style={styles.submitContainer}>
                <LinearGradient
                    colors={['#A78BFA', '#F9A8D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                >
                    <Text style={styles.submitButtonText}>Nộp đơn</Text>
                </LinearGradient>
            </TouchableOpacity>

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
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 25,
    paddingTop: 30,
    alignItems: 'center',
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      alignItems: 'center',
      marginBottom: 5,
  },
  title: {
      fontSize: 22,
      fontWeight: 'bold',
      fontFamily: 'Roboto',
      color: '#000',
  },
  closeBtn: {
      backgroundColor: '#f0f0f0',
      borderRadius: 15,
      padding: 5,
  },
  subHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
      justifyContent: 'center'
  },
  className: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#000',
      marginRight: 10,
      fontFamily: 'Roboto',
  },
  classCode: {
      fontSize: 14,
      color: '#999',
      fontFamily: 'Roboto',
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20,
  },
  picker: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 20, // Rounded pill shape
      paddingHorizontal: 15,
      paddingVertical: 12,
      width: '48%',
  },
  pickerText: {
      fontSize: 13,
      color: '#333',
      fontFamily: 'Roboto',
  },
  placeholder: {
      color: '#999',
  },
  proofArea: {
      width: '100%',
      height: 150,
      borderWidth: 1,
      borderColor: '#ddd', // Could make dashed if easy, but solid is fine
      borderRadius: 20,
      marginBottom: 25,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      // Shadow for inner feel? Or simple flat. Let's do simple flat as per image mostly.
      elevation: 1, 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
  },
  proofPlaceholder: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  proofText: {
      color: '#999',
      marginRight: 10,
      fontFamily: 'Roboto',
  },
  proofImage: {
      width: '100%',
      height: '100%',
  },
  submitContainer: {
      width: '60%',
      borderRadius: 25,
      overflow: 'hidden',
  },
  submitButton: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  submitButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Roboto',
  },
  // Modal Dropdown Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  dropdownContainer: {
      backgroundColor: 'white',
      width: '80%',
      borderRadius: 15,
      padding: 10,
      elevation: 5,
  },
  dropdownItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
  dropdownText: {
      fontSize: 16,
      color: '#333',
      fontFamily: 'Roboto',
  }
});
