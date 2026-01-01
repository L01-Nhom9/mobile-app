import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const getTabScreenOptions = (role = 'student') => ({ route }) => ({
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

        if (route.name === 'StudentHome' || route.name === 'InstructorHome') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
        } else if (route.name === 'Add') {
            return (
                <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#93C5FD',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: -20,
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
});
