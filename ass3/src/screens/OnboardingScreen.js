import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Chào mừng đến với ClassTrack!',
    description: 'Trợ lý xin nghỉ học thông minh\nGiúp bạn xử lý mọi thủ tục nhanh chóng',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png' // Teacher/Classroom
  },
  {
    id: '2',
    title: 'Tạo đơn xin phép trong 1 phút',
    description: 'Chỉ cần vài thao tác đơn giản\nĐể gửi đơn xin nghỉ học mọi lúc, mọi nơi',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921226.png' // Mobile form
  },
  {
    id: '3',
    title: 'Theo dõi trạng thái tức thì',
    description: 'Nhận thông báo ngay\nKhi đơn được giáo viên duyệt hoặc từ chối',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921234.png' // Notification
  },
  {
    id: '4',
    title: 'Sẵn sàng trải nghiệm?',
    description: 'Đăng nhập hoặc đăng ký\nĐể bắt đầu quản lý việc nghỉ học của bạn',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921245.png' // Rocket launch
  },
];

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const slideIndex = Math.ceil(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < SLIDES.length) {
      setCurrentIndex(slideIndex);
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('alreadyLaunched', 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* Spacer to push content down roughly as per design */}
      <View style={{ height: 60 }} /> 
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.buttonContainer} onPress={handleNext}>
           <LinearGradient
                colors={['#A78BFA', '#F9A8D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
            >
              <Text style={styles.buttonText}>
                {currentIndex === SLIDES.length - 1 ? 'Bắt đầu ngay' : 'Tiếp theo'}
              </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    marginTop: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  slide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 30,
    // marginTop: 20,
  },
  image: {
    width: width * 0.7,
    height: height * 0.35,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Roboto',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Roboto',
  },
  footer: {
    height: 150,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#A78BFA', // Purple/Pink theme matches button start
    width: 8,
    height: 8,
  },
  buttonContainer: {
      width: '100%',
      borderRadius: 30,
      overflow: 'hidden',
      shadowColor: '#A78BFA',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});
