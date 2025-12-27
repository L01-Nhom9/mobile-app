import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image, SafeAreaView } from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Chào mừng đến với ClassTrack!',
    description: 'Trợ lý xin nghỉ học thông minh\nGiúp bạn xử lý mọi thủ tục nhanh chóng',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png' // Placeholder: Education/Welcome
  },
  {
    id: '2',
    title: 'Tạo đơn xin phép trong 1 phút',
    description: 'Chỉ cần vài thao tác đơn giản\nĐể gửi đơn xin nghỉ học mọi lúc, mọi nơi',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921226.png' // Placeholder: Mobile/Form
  },
  {
    id: '3',
    title: 'Theo dõi trạng thái tức thì',
    description: 'Nhận thông báo ngay\nKhi đơn được giáo viên duyệt hoặc từ chối',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921234.png' // Placeholder: Notification/Status
  },
  {
    id: '4',
    title: 'Sẵn sàng trải nghiệm?',
    description: 'Đăng nhập hoặc đăng ký\nĐể bắt đầu quản lý việc nghỉ học của bạn',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921245.png' // Placeholder: Start/Rocket
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const slideIndex = Math.ceil(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < SLIDES.length) {
      setCurrentIndex(slideIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
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
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Bắt đầu ngay' : 'Tiếp theo'}
          </Text>
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
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  slide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50, // Space for image
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    height: height * 0.2,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#E6A8D7', // Pink theme
    width: 20, // Expanded dot
  },
  button: {
    backgroundColor: '#E6A8D7',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#E6A8D7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
