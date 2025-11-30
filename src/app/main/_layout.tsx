import { Tabs, useSegments } from 'expo-router';
import '../../../global.css';
import { TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { getFriendsList } from '@/controllers/getFriends';

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function RootLayout() {
  const [incomingRequests, setIncoming] = useState<number>(0);
  const segments = useSegments();

  const hideTabBar =
    segments.includes('camera') || segments.includes('groups') || segments.includes('tasks');

  const loadFriends = useCallback(async () => {
    const incomingRes = await getFriendsList.getIncomingFriendRequestsCount();
    setIncoming(incomingRes);
  }, [setIncoming]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return (
    <React.Fragment>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          lazy: false,
          tabBarActiveTintColor: '#A597FF',
          tabBarInactiveTintColor: 'white',
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#000000',
            borderTopWidth: 0,
            display: hideTabBar ? 'none' : 'flex',
          },
          sceneStyle: { backgroundColor: '#000000' },
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
              <View className="items-center justify-center">
                <View className="h-24 w-24 items-center justify-center rounded-full bg-black" />
                <View className="absolute h-20 w-20 items-center justify-center rounded-full bg-tethr-purple">
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
            tabBarBadge: incomingRequests && incomingRequests > 0 ? incomingRequests : undefined,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
            tabBarButton: (props) => <TouchableOpacity {...(props as any)} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </React.Fragment>
  );
}
