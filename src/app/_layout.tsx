import { Tabs } from 'expo-router';
import '../../global.css';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function RootLayout() {
  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#A597FF',
          tabBarInactiveTintColor: 'white',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopWidth: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
            tabBarButton: (props) => <TouchableOpacity {...(props as any)} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            tabBarIcon: ({ color, size }) => <Feather name="list" size={size} color={color} />,
            tabBarButton: (props) => <TouchableOpacity {...(props as any)} />,
          }}
        />

        <Tabs.Screen
          name="camera"
          options={{
            tabBarIcon: ({ size }) => (
              <View className="items-center justify-center rounded-full">
                <View className="h-24 w-24 items-center justify-center rounded-full bg-black" />
                <View className="bg-tethr-purple absolute h-20 w-20 items-center justify-center rounded-full">
                  <AntDesign name="camera" size={size} color="#ffffff" />
                </View>
              </View>
            ),
            tabBarButton: (props) => <TouchableOpacity {...(props as any)} />,
          }}
        />

        <Tabs.Screen
          name="friends"
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
            tabBarButton: (props) => <TouchableOpacity {...(props as any)} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
            tabBarButton: (props) => <TouchableOpacity {...(props as any)} />,
          }}
        />
      </Tabs>
    </React.Fragment>
  );
}
