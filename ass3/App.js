import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import JoinClassScreen from './src/screens/student/JoinClassScreen';
import StudentHomeScreen from './src/screens/student/StudentHomeScreen';
import RequestListScreen from './src/screens/student/RequestListScreen';
import RequestFormScreen from './src/screens/student/RequestFormScreen';
import InstructorHomeScreen from './src/screens/instructor/InstructorHomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Student Stack ---
import { Ionicons } from '@expo/vector-icons';

function StudentTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 10,
        },
        tabBarActiveTintColor: '#93C5FD',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Roboto',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'StudentHome') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Add') {
             // Custom Middle Button Look
             return (
                 <View style={{
                     width: 50,
                     height: 50,
                     borderRadius: 25,
                     backgroundColor: '#93C5FD', // Fallback
                     justifyContent: 'center',
                     alignItems: 'center',
                     marginTop: -20, // Float effect
                     shadowColor: '#93C5FD',
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3,
                     shadowRadius: 5,
                     elevation: 5,
                 }}>
                    <Ionicons name="add" size={30} color="white" />
                 </View>
             );
          } else if (route.name === 'List') {
            iconName = focused ? 'document-text' : 'document-text-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="StudentHome" options={{ title: 'HOME' }}>
          {props => <StudentHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
       <Tab.Screen name="Add" component={View} options={{ title: '' }} listeners={{
           tabPress: (e) => {
             e.preventDefault(); // Placeholder action
           },
       }}/>
       <Tab.Screen name="List" options={{ title: 'LIST' }}>
           {props => <RequestListScreen {...props} user={user} onLogout={onLogout} />}
       </Tab.Screen> 
    </Tab.Navigator>
  );
}

// --- Instructor Stack ---
function InstructorTabs({ user, onLogout }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="InstructorHome">
          {props => <InstructorHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      {/* Add 'Classes' tab here later */}
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value == null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#93C5FD" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
             {isFirstLaunch && (
               <Stack.Screen name="Onboarding" component={OnboardingScreen} />
             )}
             <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'student' ? (
          // Student Stack
          <>
            <Stack.Screen name="StudentMain">
              {props => <StudentTabs {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Group screenOptions={{ presentation: 'transparentModal', animation: 'fade' }}>
               <Stack.Screen name="RequestForm">
                  {props => <RequestFormScreen {...props} user={user} />}
               </Stack.Screen>
               <Stack.Screen name="JoinClass" component={JoinClassScreen} />
            </Stack.Group>
          </>
        ) : (
          // Instructor Stack
          <Stack.Screen name="InstructorMain">
              {props => <InstructorTabs {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
